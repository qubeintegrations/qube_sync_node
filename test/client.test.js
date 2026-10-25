"use strict";

const { describe, it: nodeIt } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const util = require("node:util");

const qubesync = require("..");
const { Client, APIError } = qubesync;

const KEY = "sk_test_never_show_me";
const BASIC = `Basic ${Buffer.from(`${KEY}:`).toString("base64")}`;
const CONN = "0b7c5a52-6f0e-4d4e-9a39-6f1b8f3d2a10";
const RUN = "4c1f3e0a-9d9b-4a3e-8f55-1b2c3d4e5f60";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// A real local server: records every request, answers from a queue of responses.
const server = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const url = new URL(req.url, "http://localhost");
    const text = Buffer.concat(chunks).toString("utf8");
    received.push({
      method: req.method,
      path: url.pathname,
      search: url.search,
      query: [...url.searchParams.entries()],
      headers: req.headers,
      text,
      body: text === "" ? undefined : JSON.parse(text),
    });
    const answer = responses.length > 1 ? responses.shift() : responses[0] || {};
    if (answer.destroy) return req.socket.destroy();
    const send = () => {
      const headers = { ...(answer.headers || {}) };
      let body = answer.raw !== undefined ? answer.raw : answer.json !== undefined ? JSON.stringify(answer.json) : "";
      if (answer.json !== undefined && !headers["content-type"]) headers["content-type"] = "application/json";
      res.writeHead(answer.status || 200, headers);
      res.end(body);
    };
    if (answer.delay) setTimeout(send, answer.delay);
    else send();
  });
});

let received = [];
let responses = [];
let base;
let sleeps = [];
const sleep = async (ms) => {
  sleeps.push(ms);
};

function client(options = {}) {
  // Never let a test fall back to https://qubesync.com.
  assert.ok(base && base.startsWith("http://127.0.0.1:"), "the test server isn't listening");
  return new Client({ apiKey: KEY, baseUrl: base, sleep, ...options });
}

function answer(...list) {
  responses = list;
}

function last() {
  return received[received.length - 1];
}

// node:test's before/after hooks need Node 16.18, and this package supports 16.17: every
// test waits for the server instead, and starts from a clean slate.
const ready = new Promise((resolve, reject) => {
  server.on("connection", (socket) => socket.unref());
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    server.unref();
    base = `http://127.0.0.1:${server.address().port}`;
    resolve();
  });
});

// Node 16.17 runs a suite's tests concurrently; they share the server, so take turns.
let turn = ready;

function it(name, fn) {
  return nodeIt(name, () => {
    const run = turn.then(async () => {
      received = [];
      sleeps = [];
      responses = [{ status: 200, json: { data: { ok: true } } }];
      await fn();
    });
    turn = run.catch(() => {});
    return run;
  });
}

describe("Client: construction", () => {
  it("requires an apiKey and never reads the environment", () => {
    assert.throws(() => new Client({}), TypeError);
    assert.throws(() => new Client({ apiKey: "" }), TypeError);
    assert.throws(() => new Client(), TypeError);
    process.env.QUBE_API_KEY = "from_env";
    try {
      assert.throws(() => new Client({}), TypeError);
    } finally {
      delete process.env.QUBE_API_KEY;
    }
  });

  it("has the documented defaults and strips trailing slashes", () => {
    const c = new Client({ apiKey: KEY });
    assert.strictEqual(c.baseUrl, "https://qubesync.com");
    assert.strictEqual(c.connectTimeout, 5000);
    assert.strictEqual(c.timeout, 30000);
    assert.strictEqual(c.maxRetries, 2);
    assert.strictEqual(new Client({ apiKey: KEY, baseUrl: "https://example.test//" }).baseUrl, "https://example.test");
    assert.throws(() => new Client({ apiKey: KEY, baseUrl: "ftp://example.test" }), TypeError);
  });

  it("never shows the key in inspect, JSON or its own properties", () => {
    const c = new Client({ apiKey: KEY });
    assert.ok(!util.inspect(c).includes(KEY));
    assert.ok(!util.inspect(c, { showHidden: true, depth: 5 }).includes(KEY));
    assert.match(util.inspect(c), /baseUrl: 'https:\/\/qubesync\.com'/);
    assert.ok(!JSON.stringify(c).includes(KEY));
    assert.ok(!JSON.stringify(Object.getOwnPropertyNames(c).map((n) => c[n])).includes(KEY));
    assert.ok(!String(c).includes(KEY));
  });

  it("is exported with the webhook names", () => {
    assert.strictEqual(typeof qubesync.verify, "function");
    assert.strictEqual(qubesync.VERSION, "0.2.0");
  });
});

describe("Client: every call", () => {
  it("sends Basic auth, Accept, User-Agent, and JSON with a body", async () => {
    await client().createConnection({ webhookUrl: "https://app.test/hooks" });
    const r = last();
    assert.strictEqual(r.headers.authorization, BASIC);
    assert.strictEqual(r.headers.accept, "application/json");
    assert.strictEqual(r.headers["user-agent"], `qubesync-node/${require("../package.json").version}`);
    assert.strictEqual(r.headers["content-type"], "application/json");

    await client().getConnection(CONN);
    assert.strictEqual(last().headers["content-type"], undefined);
  });

  it("unwraps data", async () => {
    answer({ json: { data: { id: CONN, name: "Acme" }, meta: { x: 1 } } });
    assert.deepStrictEqual(await client().getConnection(CONN), { id: CONN, name: "Acme" });
  });

  it("answers null for a 204 or an empty body", async () => {
    answer({ status: 204 });
    assert.strictEqual(await client().deleteConnection(CONN), null);
    answer({ status: 200, raw: "" });
    assert.strictEqual(await client().request("GET", "/connections"), null);
  });

  it("rejects a 2xx that isn't JSON with the JSON error", async () => {
    answer({ status: 200, raw: "<html>" });
    await assert.rejects(client().listConnections(), SyntaxError);
  });

  it("rejects bad arguments as a Promise, before any request", async () => {
    const c = client();
    const pending = c.createConnection({});
    assert.ok(pending instanceof Promise);
    await assert.rejects(pending, TypeError);
    await assert.rejects(c.startRun(CONN, "w", {}, { webhookUrl: "https://app.test/h" }), TypeError);
    await assert.rejects(c.answer("/x", {}), TypeError);
    await assert.rejects(c.search("/x", { field: "customer" }), TypeError);
    await assert.rejects(c.queue(CONN, "customers", {}, {}), TypeError);
    await assert.rejects(c.queue(CONN, "customers", {}, { webhookUrl: "https://app.test/h", method: "PATCH" }), TypeError);
    assert.strictEqual(received.length, 0);
  });
});

describe("Client: connections", () => {
  it("createConnection", async () => {
    await client().createConnection({ webhookUrl: "https://app.test/hooks", name: "Acme" });
    assert.deepStrictEqual(pick(last()), ["POST", "/api/v2/connections", { webhook_url: "https://app.test/hooks", name: "Acme" }]);
    await client().createConnection({ webhookUrl: "https://app.test/hooks" });
    assert.deepStrictEqual(last().body, { webhook_url: "https://app.test/hooks" });
  });

  it("getConnection, listConnections, deleteConnection", async () => {
    await client().getConnection(CONN);
    assert.deepStrictEqual(pick(last()), ["GET", `/api/v2/connections/${CONN}`, undefined]);
    answer({ json: { data: [{ id: CONN }] } });
    assert.deepStrictEqual(await client().listConnections(), [{ id: CONN }]);
    assert.deepStrictEqual(pick(last()), ["GET", "/api/v2/connections", undefined]);
    answer({ status: 204 });
    await client().deleteConnection(CONN);
    assert.deepStrictEqual(pick(last()), ["DELETE", `/api/v2/connections/${CONN}`, undefined]);
  });

  it("updateConnection sends only the given keys", async () => {
    await client().updateConnection(CONN, { name: "New" });
    assert.deepStrictEqual(pick(last()), ["PUT", `/api/v2/connections/${CONN}`, { name: "New" }]);
    await client().updateConnection(CONN, { webhookUrl: "https://app.test/h2", name: "N" });
    assert.deepStrictEqual(last().body, { webhook_url: "https://app.test/h2", name: "N" });
  });

  it("regenerateOnboarding and setPassword", async () => {
    await client().regenerateOnboarding(CONN);
    assert.deepStrictEqual(pick(last()), ["POST", `/api/v2/connections/${CONN}/onboarding-url`, undefined]);
    answer({ json: { data: { id: CONN, password: "generated" } } });
    assert.deepStrictEqual(await client().setPassword(CONN), { id: CONN, password: "generated" });
    assert.deepStrictEqual(pick(last()), ["POST", `/api/v2/connections/${CONN}/password`, undefined]);
    assert.strictEqual(last().text, "");
    await client().setPassword(CONN, { password: "hunter2" });
    assert.deepStrictEqual(last().body, { password: "hunter2" });
  });

  it("getQwc returns the XML string", async () => {
    answer({ json: { qwc: "<?xml version=\"1.0\"?><QBWCXML/>" } });
    assert.strictEqual(await client().getQwc(CONN), "<?xml version=\"1.0\"?><QBWCXML/>");
    assert.deepStrictEqual(pick(last()), ["POST", `/api/v2/connections/${CONN}/qwc`, undefined]);
  });

  it("escapes ids in paths", async () => {
    await client().getConnection("a/b?c");
    assert.strictEqual(last().path, "/api/v2/connections/a%2Fb%3Fc");
  });
});

describe("Client: runs", () => {
  it("startRun sends the reference as the Idempotency-Key", async () => {
    await client().startRun(CONN, "customer_sync", { customer: { name: "Acme" } }, {
      reference: "order-1042",
      webhookUrl: "https://app.test/hooks",
      version: 3,
    });
    const r = last();
    assert.deepStrictEqual(pick(r), [
      "POST",
      `/api/v2/connections/${CONN}/workflow-runs`,
      { workflow: "customer_sync", reference: "order-1042", input: { customer: { name: "Acme" } }, webhook_url: "https://app.test/hooks", version: 3 },
    ]);
    assert.strictEqual(r.headers["idempotency-key"], "order-1042");
    await client().startRun(CONN, "customer_sync", { a: 1 }, { reference: "r", webhookUrl: "https://app.test/h" });
    assert.ok(!("version" in last().body));
  });

  it("getRun by link or by ids", async () => {
    await client().getRun(`${base}/api/v2/connections/${CONN}/workflow-runs/${RUN}`);
    assert.deepStrictEqual(pick(last()), ["GET", `/api/v2/connections/${CONN}/workflow-runs/${RUN}`, undefined]);
    await client().getRun(CONN, RUN);
    assert.deepStrictEqual(pick(last()), ["GET", `/api/v2/connections/${CONN}/workflow-runs/${RUN}`, undefined]);
  });

  it("listRuns drops missing filters", async () => {
    answer({ json: { data: [] } });
    assert.deepStrictEqual(await client().listRuns(CONN, { reference: "order-1042", outcome: "succeeded" }), []);
    assert.strictEqual(last().path, `/api/v2/connections/${CONN}/workflow-runs`);
    assert.deepStrictEqual(last().query, [["reference", "order-1042"], ["outcome", "succeeded"]]);
    await client().listRuns(CONN);
    assert.strictEqual(last().search, "");
  });

  it("cancelRun posts the reason or {}", async () => {
    const link = `${base}/api/v2/connections/${CONN}/workflow-runs/${RUN}/cancel`;
    await client().cancelRun(link, { reason: "customer asked" });
    assert.deepStrictEqual(pick(last()), ["POST", `/api/v2/connections/${CONN}/workflow-runs/${RUN}/cancel`, { reason: "customer asked" }]);
    await client().cancelRun(link);
    assert.deepStrictEqual(last().body, {});
  });

  it("runEvents returns the whole body", async () => {
    answer({ json: { data: [{ seq: "1" }], next_after: "1" } });
    assert.deepStrictEqual(await client().runEvents(CONN, RUN, { after: "7.3", limit: 50 }), { data: [{ seq: "1" }], next_after: "1" });
    assert.strictEqual(last().path, `/api/v2/connections/${CONN}/workflow-runs/${RUN}/events`);
    assert.deepStrictEqual(last().query, [["after", "7.3"], ["limit", "50"]]);
  });
});

describe("Client: questions", () => {
  const decisions = () => `${base}/api/v2/connections/${CONN}/workflow-runs/${RUN}/decisions?prompt_token=pt_1`;
  const searchUrl = () => `${base}/api/v2/connections/${CONN}/workflow-runs/${RUN}/search?prompt_token=pt_1`;

  it("answer keeps the link's query", async () => {
    await client().answer(decisions(), { choice: "create" });
    assert.deepStrictEqual(pick(last()), ["POST", `/api/v2/connections/${CONN}/workflow-runs/${RUN}/decisions`, { choice: "create" }]);
    assert.deepStrictEqual(last().query, [["prompt_token", "pt_1"]]);
    await client().answer(decisions(), { choice: "use_existing", data: { customer: "80000001-1" } });
    assert.deepStrictEqual(last().body, { choice: "use_existing", data: { customer: "80000001-1" } });
  });

  it("search appends field and q after the link's query", async () => {
    answer({ json: { data: [{ list_id: "80000001-1" }] } });
    assert.deepStrictEqual(await client().search(searchUrl(), { field: "customer", q: "Ac" }), [{ list_id: "80000001-1" }]);
    assert.strictEqual(last().search, "?prompt_token=pt_1&field=customer&q=Ac");
  });
});

describe("Client: links", () => {
  it("refuses another host, port or scheme without a request, and never names the key", async () => {
    const port = Number(new URL(base).port);
    const others = [
      `http://evil.test:${port}/api/v2/connections`,
      `http://127.0.0.1:${port + 1}/api/v2/connections`,
      `https://127.0.0.1:${port}/api/v2/connections`,
      `http://localhost:${port}/api/v2/connections`,
    ];
    for (const url of others) {
      await assert.rejects(client().getRun(url), (error) => {
        assert.ok(error instanceof TypeError);
        assert.ok(error.message.includes(new URL(url).origin), error.message);
        assert.ok(error.message.includes(base), error.message);
        assert.ok(!error.message.includes(KEY));
        return true;
      });
    }
    await assert.rejects(client().request("GET", "connections"), TypeError);
    assert.strictEqual(received.length, 0);
  });

  it("accepts the same origin, with or without the default port", async () => {
    const c = new Client({ apiKey: KEY, baseUrl: "https://qubesync.com", sleep });
    await assert.rejects(c.getRun("https://qubesync.evil.com/api/v2/x"), TypeError);
    await client().request("GET", `${base}/api/v2/connections?x=1`, undefined, { query: { y: 2 } });
    assert.strictEqual(last().search, "?x=1&y=2");
  });
});

describe("Client: queued requests", () => {
  it("queue POSTs the params, webhook_url in the query, a fresh UUID key", async () => {
    await client().queue(CONN, "/customers", { name: "Acme" }, { webhookUrl: "https://app.test/hooks" });
    const r = last();
    assert.deepStrictEqual(pick(r), ["POST", `/api/v2/connections/${CONN}/customers`, { name: "Acme" }]);
    assert.deepStrictEqual(r.query, [["webhook_url", "https://app.test/hooks"]]);
    assert.match(r.headers["idempotency-key"], UUID);
    await client().queue(CONN, "customers", { name: "Acme" }, { webhookUrl: "https://app.test/hooks" });
    assert.notStrictEqual(last().headers["idempotency-key"], r.headers["idempotency-key"]);
    await client().queue(CONN, "customers", {}, { webhookUrl: "https://app.test/h", idempotencyKey: "mine-1" });
    assert.strictEqual(last().headers["idempotency-key"], "mine-1");
  });

  it("queue with get sends the params as the query", async () => {
    await client().queue(CONN, "txn-deleteds", { txn_del_type: ["Invoice", "Bill"], max_returned: 10 }, {
      webhookUrl: "https://app.test/hooks",
      method: "get",
    });
    const r = last();
    assert.deepStrictEqual(pick(r), ["GET", `/api/v2/connections/${CONN}/txn-deleteds`, undefined]);
    assert.deepStrictEqual(r.query, [
      ["webhook_url", "https://app.test/hooks"],
      ["txn_del_type", "Invoice"],
      ["txn_del_type", "Bill"],
      ["max_returned", "10"],
    ]);
    await assert.rejects(
      client().queue(CONN, "customers", { filter: { name: "A" } }, { webhookUrl: "https://app.test/h", method: "GET" }),
      TypeError
    );
    await client().queue(CONN, "customers", { list_id: "1" }, { webhookUrl: "https://app.test/h", method: "Put" });
    assert.deepStrictEqual(pick(last()), ["PUT", `/api/v2/connections/${CONN}/customers`, { list_id: "1" }]);
  });

  it("queueQbxml", async () => {
    await client().queueQbxml(CONN, "<QBXML/>", { webhookUrl: "https://app.test/hooks" });
    const r = last();
    assert.deepStrictEqual(pick(r), ["POST", `/api/v2/connections/${CONN}/queued-requests`, { request_xml: "<QBXML/>" }]);
    assert.deepStrictEqual(r.query, [["webhook_url", "https://app.test/hooks"]]);
    assert.match(r.headers["idempotency-key"], UUID);
  });

  it("getRequest, requestPages, discardRequest", async () => {
    await client().getRequest(CONN, "q1");
    assert.deepStrictEqual(pick(last()), ["GET", `/api/v2/connections/${CONN}/queued-requests/q1`, undefined]);
    answer({ json: { data: [{ page: 1 }] } });
    assert.deepStrictEqual(await client().requestPages(CONN, "q1"), [{ page: 1 }]);
    assert.deepStrictEqual(pick(last()), ["GET", `/api/v2/connections/${CONN}/queued-requests/q1/pages`, undefined]);
    answer({ json: { data: { id: "q1", state: "discarded" } } });
    await client().discardRequest(CONN, "q1");
    assert.deepStrictEqual(pick(last()), ["POST", `/api/v2/connections/${CONN}/queued-requests/q1/discard`, undefined]);
  });

  it("listRequests sends snake_case filters and returns the whole body", async () => {
    const page = { data: [{ id: "q1" }], meta: { page: 2, total_pages: 3 } };
    answer({ json: page });
    const result = await client().listRequests(CONN, {
      page: 2,
      pageSize: 50,
      state: "errored",
      webhookState: "failed",
      sort: "inserted_at",
      sortDirection: "desc",
      searchPhrase: "Acme",
    });
    assert.deepStrictEqual(result, page);
    assert.deepStrictEqual(last().query, [
      ["page", "2"],
      ["page_size", "50"],
      ["state", "errored"],
      ["webhook_state", "failed"],
      ["sort", "inserted_at"],
      ["sort_direction", "desc"],
      ["search_phrase", "Acme"],
    ]);
  });

  it("eachRequest walks every page", async () => {
    answer(
      { json: { data: [{ id: "a" }, { id: "b" }], meta: { page: 1, total_pages: 3 } } },
      { json: { data: [{ id: "c" }], meta: { page: 2, total_pages: 3 } } },
      { json: { data: [{ id: "d" }], meta: { page: 3, total_pages: 3 } } }
    );
    const ids = [];
    for await (const request of client().eachRequest(CONN, { state: "errored" })) ids.push(request.id);
    assert.deepStrictEqual(ids, ["a", "b", "c", "d"]);
    assert.deepStrictEqual(
      received.map((r) => r.query),
      [1, 2, 3].map((p) => [["page", String(p)], ["state", "errored"]])
    );
  });

  it("eachRequest stops on an empty page", async () => {
    answer({ json: { data: [{ id: "a" }], meta: { page: 1, total_pages: 9 } } }, { json: { data: [], meta: { page: 2, total_pages: 9 } } });
    const ids = [];
    for await (const request of client().eachRequest(CONN)) ids.push(request.id);
    assert.deepStrictEqual(ids, ["a"]);
    assert.strictEqual(received.length, 2);
  });
});

describe("Client: request", () => {
  it("returns the whole body and passes query and headers", async () => {
    answer({ json: { data: [1], meta: { n: 1 } } });
    const body = await client().request("post", "/workflows/validate", { definition: {} }, { query: { a: "1" }, headers: { "X-Extra": "yes" } });
    assert.deepStrictEqual(body, { data: [1], meta: { n: 1 } });
    assert.deepStrictEqual(pick(last()), ["POST", "/api/v2/workflows/validate", { definition: {} }]);
    assert.strictEqual(last().headers["x-extra"], "yes");
    assert.strictEqual(last().search, "?a=1");
  });
});

describe("Client: retries", () => {
  for (const status of [502, 503, 504, 429]) {
    it(`retries a GET on ${status}, backing off 0.5 s then 1 s`, async () => {
      answer({ status, raw: "busy" }, { status, raw: "busy" }, { json: { data: { id: CONN } } });
      assert.deepStrictEqual(await client().getConnection(CONN), { id: CONN });
      assert.strictEqual(received.length, 3);
      assert.strictEqual(sleeps.length, 2);
      assert.ok(sleeps[0] >= 500 && sleeps[0] <= 625, String(sleeps[0]));
      assert.ok(sleeps[1] >= 1000 && sleeps[1] <= 1250, String(sleeps[1]));
    });
  }

  it("honours Retry-After on 429 and 503, capped at 30 s", async () => {
    answer({ status: 429, headers: { "retry-after": "3" } }, { status: 503, headers: { "retry-after": "120" } }, { json: { data: {} } });
    await client().listConnections();
    assert.deepStrictEqual(sleeps, [3000, 30000]);
  });

  it("raises APIError after the last try", async () => {
    answer({ status: 503, json: { errors: "down for maintenance" } });
    await assert.rejects(client().listConnections(), (error) => error instanceof APIError && error.status === 503);
    assert.strictEqual(received.length, 3);
    received = [];
    await assert.rejects(client({ maxRetries: 0 }).listConnections(), APIError);
    assert.strictEqual(received.length, 1);
  });

  it("reuses queue's generated key on a retry", async () => {
    answer({ status: 503 }, { status: 201, json: { data: { id: "q1" } } });
    assert.deepStrictEqual(await client().queue(CONN, "customers", { name: "A" }, { webhookUrl: "https://app.test/h" }), { id: "q1" });
    assert.strictEqual(received.length, 2);
    assert.match(received[0].headers["idempotency-key"], UUID);
    assert.strictEqual(received[1].headers["idempotency-key"], received[0].headers["idempotency-key"]);
  });

  it("retries startRun, which carries a key", async () => {
    answer({ status: 502 }, { status: 201, json: { data: { id: RUN } } });
    await client().startRun(CONN, "w", {}, { reference: "ref-1", webhookUrl: "https://app.test/h" });
    assert.strictEqual(received.length, 2);
    assert.strictEqual(received[1].headers["idempotency-key"], "ref-1");
  });

  it("sends a POST without a key once", async () => {
    answer({ status: 503 });
    await assert.rejects(client().createConnection({ webhookUrl: "https://app.test/h" }), APIError);
    await assert.rejects(client().answer(`${base}/api/v2/x/decisions`, { choice: "a" }), APIError);
    await assert.rejects(client().cancelRun(`${base}/api/v2/x/cancel`), APIError);
    await assert.rejects(client().regenerateOnboarding(CONN), APIError);
    assert.strictEqual(received.length, 4);
    assert.deepStrictEqual(sleeps, []);
  });

  for (const status of [400, 404, 409, 422]) {
    it(`doesn't retry a ${status}`, async () => {
      answer({ status, json: { errors: "no" } });
      await assert.rejects(client().getConnection(CONN), (error) => error.status === status);
      assert.strictEqual(received.length, 1);
    });
  }

  it("retries a reset connection", async () => {
    answer({ destroy: true }, { json: { data: { id: CONN } } });
    assert.deepStrictEqual(await client().getConnection(CONN), { id: CONN });
    assert.strictEqual(received.length, 2);
    assert.strictEqual(sleeps.length, 1);
  });

  it("raises Node's own error after a refused connection's last try", async () => {
    const closed = http.createServer();
    await new Promise((resolve) => closed.listen(0, "127.0.0.1", resolve));
    const port = closed.address().port;
    await new Promise((resolve) => closed.close(resolve));
    const c = new Client({ apiKey: KEY, baseUrl: `http://127.0.0.1:${port}`, sleep });
    await assert.rejects(c.getConnection(CONN), (error) => {
      assert.strictEqual(error.code, "ECONNREFUSED");
      assert.ok(!(error instanceof APIError));
      assert.ok(!String(error.message).includes(KEY));
      return true;
    });
    assert.strictEqual(sleeps.length, 2);
  });

  it("times out a slow answer", async () => {
    answer({ delay: 400, json: { data: {} } });
    const c = client({ timeout: 50, maxRetries: 0 });
    const started = Date.now();
    await assert.rejects(c.listConnections(), (error) => {
      assert.strictEqual(error.code, "ETIMEDOUT");
      assert.match(error.message, /50 ms/);
      return true;
    });
    assert.ok(Date.now() - started < 350, "gave up before the answer");
    // A timeout is retried like any network failure.
    answer({ delay: 200, json: { data: {} } }, { json: { data: { ok: 1 } } });
    sleeps = [];
    assert.deepStrictEqual(await client({ timeout: 50, maxRetries: 1 }).listConnections(), { ok: 1 });
    assert.strictEqual(sleeps.length, 1);
  });
});

describe("APIError", () => {
  async function failWith(response) {
    answer(response);
    try {
      await client({ maxRetries: 0 }).getConnection(CONN);
    } catch (error) {
      assert.ok(error instanceof APIError);
      assert.ok(error instanceof Error);
      assert.strictEqual(error.name, "APIError");
      assert.ok(!error.message.includes(KEY));
      assert.ok(!util.inspect(error).includes(KEY));
      assert.ok(!util.inspect(error).includes(BASIC));
      return error;
    }
    assert.fail("expected an APIError");
  }

  it("a sentence", async () => {
    const e = await failWith({ status: 422, json: { errors: 'unknown parameter: "emial"' }, headers: { "x-request-id": "req_123" } });
    assert.strictEqual(e.status, 422);
    assert.strictEqual(e.errors, 'unknown parameter: "emial"');
    assert.strictEqual(e.code, null);
    assert.strictEqual(e.message, 'QuBe Sync answered 422: unknown parameter: "emial"');
    assert.strictEqual(e.requestId, "req_123");
    assert.strictEqual(e.body, JSON.stringify({ errors: 'unknown parameter: "emial"' }));
  });

  it("detail and code", async () => {
    const e = await failWith({ status: 409, json: { errors: { detail: "The prompt changed", code: "prompt_changed" } } });
    assert.deepStrictEqual(e.errors, { detail: "The prompt changed", code: "prompt_changed" });
    assert.strictEqual(e.code, "prompt_changed");
    assert.strictEqual(e.message, "QuBe Sync answered 409: The prompt changed");
    assert.strictEqual(e.requestId, null);
  });

  it("field by field", async () => {
    const e = await failWith({
      status: 422,
      json: { errors: { webhook_url: ["is invalid", "may not contain a username or password"], name: ["is too long"] } },
    });
    assert.strictEqual(e.code, null);
    assert.strictEqual(e.message, "QuBe Sync answered 422: webhook_url: is invalid, may not contain a username or password; name: is too long");
  });

  it("located problems", async () => {
    const e = await failWith({
      status: 422,
      json: { errors: [{ path: "input.customer", message: "is required" }, { path: "input.total", message: "must be a number" }] },
    });
    assert.ok(Array.isArray(e.errors));
    assert.strictEqual(e.message, "QuBe Sync answered 422: input.customer: is required; input.total: must be a number");
  });

  it("the plain-text 401", async () => {
    const e = await failWith({ status: 401, raw: "Unauthorized", headers: { "www-authenticate": 'Basic realm="Application"' } });
    assert.strictEqual(e.status, 401);
    assert.strictEqual(e.errors, null);
    assert.strictEqual(e.code, null);
    assert.strictEqual(e.body, "Unauthorized");
    assert.strictEqual(e.message, "QuBe Sync answered 401: Unauthorized");
  });

  it("a long non-JSON body, trimmed to 500 characters on one line", async () => {
    const e = await failWith({ status: 500, raw: `  <html>\n${"x".repeat(1000)}</html>  ` });
    assert.strictEqual(e.errors, null);
    assert.ok(!e.message.includes("\n"));
    assert.strictEqual(e.message, `QuBe Sync answered 500: ${`<html> ${"x".repeat(1000)}`.slice(0, 500)}`);
  });
});

function pick(r) {
  return [r.method, r.path, r.body];
}
