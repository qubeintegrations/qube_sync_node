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
    assert.strictEqual(qubesync.VERSION, "0.3.0");
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
    await assert.rejects(c.queue("customer.create", CONN, {}, {}), TypeError);
    await assert.rejects(c.customer.create(CONN, { name: "A" }, {}), TypeError);
    await assert.rejects(c.queue("customer.create", CONN, {}, { webhookUrl: "https://app.test/h", method: "PATCH" }), TypeError);
    assert.strictEqual(received.length, 0);
  });
});

describe("Client: connections", () => {
  it("createConnection", async () => {
    await client().createConnection({ webhookUrl: "https://app.test/hooks", name: "Acme" });
    assert.deepStrictEqual(pick(last()), ["POST", "/api/v2/connections", { webhook_url: "https://app.test/hooks", name: "Acme" }]);
    await client().createConnection({ webhookUrl: "https://app.test/hooks" });
    assert.deepStrictEqual(last().body, { webhook_url: "https://app.test/hooks" });
    await client().createConnection({ webhookUrl: "https://app.test/hooks", type: "simulated" });
    assert.deepStrictEqual(last().body, { webhook_url: "https://app.test/hooks", type: "simulated" });
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

  it("redeliverRun posts to the run's redeliver path and unwraps data", async () => {
    const data = { run_id: RUN, event: "workflow_run.awaiting_input", revision: 4, webhook_url: "https://app.test/h" };
    answer({ json: { data } });
    assert.deepStrictEqual(await client().redeliverRun(CONN, RUN), data);
    assert.deepStrictEqual(pick(last()), ["POST", `/api/v2/connections/${CONN}/workflow-runs/${RUN}/redeliver`, undefined]);
  });

  it("redeliverRun rejects a 409 or a 429 as an APIError, sent once", async () => {
    answer({ status: 409, json: { errors: { code: "nothing_to_redeliver", detail: "Nothing yet" } } });
    await assert.rejects(client().redeliverRun(CONN, RUN), (e) => e instanceof qubesync.APIError && e.status === 409 && e.code === "nothing_to_redeliver");
    const before = received.length;
    answer({ status: 429, json: { errors: { detail: "Too soon" } } });
    await assert.rejects(client({ maxRetries: 0 }).redeliverRun(CONN, RUN), (e) => e.status === 429);
    assert.strictEqual(received.length, before + 1);
  });

  it("runEvents returns the whole body", async () => {
    answer({ json: { data: [{ seq: "1" }], next_after: "1" } });
    assert.deepStrictEqual(await client().runEvents(CONN, RUN, { after: "7.3", limit: 50 }), { data: [{ seq: "1" }], next_after: "1" });
    assert.strictEqual(last().path, `/api/v2/connections/${CONN}/workflow-runs/${RUN}/events`);
    assert.deepStrictEqual(last().query, [["after", "7.3"], ["limit", "50"]]);
  });
});

describe("Client: workflow types", () => {
  const doc = { digest: "sha256:aa", operations_digest: "sha256:bb", include_drafts: false, workflows: {} };

  it("workflowTypes gets the document, with drafts on request", async () => {
    answer({ json: { data: doc }, headers: { etag: '"sha256:aa"' } });
    assert.deepStrictEqual(await client().workflowTypes(), doc);
    assert.deepStrictEqual(pick(last()), ["GET", "/api/v2/workflows/types", undefined]);
    assert.strictEqual(last().search, "");
    assert.strictEqual(last().headers["if-none-match"], undefined);
    await client().workflowTypes({ includeDrafts: true });
    assert.deepStrictEqual(last().query, [["include", "drafts"]]);
  });

  it("sends etag as If-None-Match, quoting a digest, and resolves to NOT_MODIFIED on a 304", async () => {
    answer({ status: 304 });
    assert.strictEqual(await client().workflowTypes({ etag: "sha256:aa" }), qubesync.NOT_MODIFIED);
    assert.strictEqual(last().headers["if-none-match"], '"sha256:aa"');
    await client().workflowTypes({ etag: 'W/"x"', includeDrafts: true });
    assert.strictEqual(last().headers["if-none-match"], 'W/"x"');
    assert.strictEqual(typeof qubesync.NOT_MODIFIED, "symbol");
  });

  it("rejects any other answer outside 2xx", async () => {
    answer({ status: 401, json: { errors: "invalid API key" } });
    await assert.rejects(client().workflowTypes({ etag: "sha256:aa" }), (error) => error instanceof APIError && error.status === 401);
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
  it("a body operation sends JSON, webhook_url in the query and a fresh UUID key", async () => {
    await client().customer.create(CONN, { name: "Acme", bill_address: { city: "Austin" } }, { webhookUrl: "https://app.test/hooks" });
    const r = last();
    assert.deepStrictEqual(pick(r), ["POST", `/api/v2/connections/${CONN}/customers`, { name: "Acme", bill_address: { city: "Austin" } }]);
    assert.deepStrictEqual(r.query, [["webhook_url", "https://app.test/hooks"]]);
    assert.match(r.headers["idempotency-key"], UUID);
    await client().customer.create(CONN, { name: "Acme" }, { webhookUrl: "https://app.test/hooks" });
    assert.notStrictEqual(last().headers["idempotency-key"], r.headers["idempotency-key"]);
    await client().customer.create(CONN, { name: "A" }, { webhookUrl: "https://app.test/h", idempotencyKey: "mine-1" });
    assert.strictEqual(last().headers["idempotency-key"], "mine-1");
  });

  it("a query operation sends its params as the query string, nested ones bracketed", async () => {
    await client().customer.query(CONN, {
      list_id: ["80000001-1", "80000002-1"],
      max_returned: 10,
      name_range: { from: "A", to: "M" },
      currency_filter: { full_name: ["US Dollar"] },
    }, { webhookUrl: "https://app.test/hooks" });
    const r = last();
    assert.deepStrictEqual(pick(r), ["GET", `/api/v2/connections/${CONN}/customers`, undefined]);
    assert.deepStrictEqual(r.query, [
      ["webhook_url", "https://app.test/hooks"],
      ["list_id", "80000001-1"],
      ["list_id", "80000002-1"],
      ["max_returned", "10"],
      ["name_range[from]", "A"],
      ["name_range[to]", "M"],
      ["currency_filter[full_name][]", "US Dollar"],
    ]);
    // customer.query is paged: still one call; the pages come by webhook.
    assert.strictEqual(received.length, 1);
    await assert.rejects(
      client().customer.query(CONN, { list_id: [["a"]] }, { webhookUrl: "https://app.test/h" }),
      TypeError
    );
  });

  it("queue by id sends what the entity method sends", async () => {
    const params = { name: "Acme", is_active: true };
    const options = { webhookUrl: "https://app.test/hooks", idempotencyKey: "k-1" };
    await client().queue("customer.create", CONN, params, options);
    await client().customer.create(CONN, params, options);
    const [a, b] = received;
    assert.deepStrictEqual([a.method, a.path, a.search, a.text, a.headers["idempotency-key"]], [b.method, b.path, b.search, b.text, b.headers["idempotency-key"]]);
  });

  it("queue refuses an unknown id without method and path, and sends one with them", async () => {
    await assert.rejects(client().queue("widget.create", CONN, {}, { webhookUrl: "https://app.test/h" }), (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /widget\.create/);
      assert.match(error.message, /method/);
      assert.match(error.message, /path/);
      return true;
    });
    await assert.rejects(client().queue("widget.create", CONN, {}, { webhookUrl: "https://app.test/h", method: "POST" }), TypeError);
    assert.strictEqual(received.length, 0);
    await client().queue("widget.create", CONN, { name: "W" }, { webhookUrl: "https://app.test/h", method: "post", path: "/widgets" });
    assert.deepStrictEqual(pick(last()), ["POST", `/api/v2/connections/${CONN}/widgets`, { name: "W" }]);
    await client().queue("widget.query", CONN, { name: "W" }, { webhookUrl: "https://app.test/h", method: "GET", path: "widgets" });
    assert.deepStrictEqual(pick(last()), ["GET", `/api/v2/connections/${CONN}/widgets`, undefined]);
    assert.deepStrictEqual(last().query, [["webhook_url", "https://app.test/h"], ["name", "W"]]);
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
    assert.deepStrictEqual(await client().customer.create(CONN, { name: "A" }, { webhookUrl: "https://app.test/h" }), { id: "q1" });
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

describe("Client: onRetry, totalTimeout and answer", () => {
  function recorder() {
    const calls = [];
    const onRetry = (info) => {
      assert.ok(Object.isFrozen(info));
      calls.push(info);
    };
    return { calls, onRetry };
  }

  // A fake clock that moves only when the client sleeps (plus `extra` per sleep).
  function fakeTime(extra = 0, real = false) {
    let offset = 0;
    return {
      clock: () => (real ? require("node:perf_hooks").performance.now() : 0) + offset,
      sleep: async (ms) => {
        sleeps.push(ms);
        offset += ms + extra;
      },
    };
  }

  it("calls onRetry before each retry of a 503, without the query or the key", async () => {
    const { calls, onRetry } = recorder();
    answer({ status: 503 }, { status: 503 }, { json: { data: [] } });
    await client({ onRetry }).listRuns(CONN, { reference: "secret-search" });
    assert.strictEqual(calls.length, 2);
    calls.forEach((info, i) => {
      assert.deepStrictEqual(Object.keys(info).sort(), ["attempt", "delayMs", "elapsedMs", "error", "maxRetries", "method", "status", "url"]);
      assert.strictEqual(info.attempt, i + 1);
      assert.strictEqual(info.maxRetries, 2);
      assert.strictEqual(info.delayMs, sleeps[i]);
      assert.ok(info.elapsedMs >= 0);
      assert.strictEqual(info.method, "GET");
      assert.strictEqual(info.url, `${base}/api/v2/connections/${CONN}/workflow-runs`);
      assert.strictEqual(info.status, 503);
      assert.strictEqual(info.error, null);
    });
    const shown = util.inspect(calls, { depth: 5 }) + JSON.stringify(calls);
    assert.ok(!shown.includes(KEY) && !shown.includes(BASIC) && !shown.includes("secret-search"));
  });

  it("calls onRetry with the error of a reset connection", async () => {
    const { calls, onRetry } = recorder();
    answer({ destroy: true }, { json: { data: {} } });
    await client({ onRetry }).getConnection(CONN);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].status, null);
    assert.ok(calls[0].error instanceof Error);
    assert.strictEqual(calls[0].error.code, "ECONNRESET");
  });

  it("doesn't call onRetry on success, a 4xx or after the last try", async () => {
    const { calls, onRetry } = recorder();
    await client({ onRetry }).getConnection(CONN);
    answer({ status: 404, json: { errors: { detail: "Not Found" } } });
    await assert.rejects(client({ onRetry }).getConnection(CONN), APIError);
    assert.strictEqual(calls.length, 0);
    answer({ status: 503 });
    await assert.rejects(client({ onRetry }).getConnection(CONN), APIError);
    assert.strictEqual(calls.length, 2);
  });

  it("stops the call when onRetry throws", async () => {
    answer({ status: 503 }, { json: { data: {} } });
    const boom = new Error("stop");
    await assert.rejects(
      client({
        onRetry: () => {
          throw boom;
        },
      }).getConnection(CONN),
      (error) => error === boom
    );
    assert.strictEqual(received.length, 1);
    assert.deepStrictEqual(sleeps, []);
  });

  it("doesn't make a retry whose wait leaves under a second of totalTimeout", async () => {
    const { calls, onRetry } = recorder();
    answer({ status: 503 });
    // 2000 ms: the first wait (500-625 ms) fits, the second (1000-1250 ms) doesn't.
    await assert.rejects(client({ totalTimeout: 2000, onRetry, ...fakeTime() }).getConnection(CONN), (error) => error.status === 503);
    assert.strictEqual(received.length, 2);
    assert.strictEqual(sleeps.length, 1);
    assert.strictEqual(calls.length, 1);
  });

  it("doesn't wait out a Retry-After beyond the limit, or shorten it", async () => {
    const { calls, onRetry } = recorder();
    answer({ status: 429, headers: { "retry-after": "20" } }, { json: { data: {} } });
    await assert.rejects(client({ totalTimeout: 10000, onRetry, ...fakeTime() }).listConnections(), (error) => error.status === 429);
    assert.strictEqual(received.length, 1);
    assert.deepStrictEqual(sleeps, []);
    assert.strictEqual(calls.length, 0);
  });

  it("caps a later attempt's read timeout to the time left", async () => {
    // The wait takes 900 ms longer than planned, so the retry has ~200 ms left of 1700.
    answer({ status: 503 }, { delay: 1500, json: { data: {} } });
    const started = Date.now();
    await assert.rejects(
      client({ totalTimeout: 1700, timeout: 5000, maxRetries: 1, ...fakeTime(900, true) }).listConnections(),
      (error) => {
        assert.strictEqual(error.code, "ETIMEDOUT");
        const ms = Number(/within (\d+(\.\d+)?) ms/.exec(error.message)[1]);
        assert.ok(ms < 400, error.message);
        return true;
      }
    );
    assert.ok(Date.now() - started < 1000, "gave up when the total ran out");
    assert.strictEqual(received.length, 2);
  });

  it("retries answer when its link has a prompt_token, and sends it once without", async () => {
    const link = `${base}/api/v2/connections/${CONN}/workflow-runs/${RUN}/decisions`;
    answer({ status: 503 }, { json: { data: { id: RUN } } });
    assert.deepStrictEqual(await client().answer(`${link}?prompt_token=pt_1`, { choice: "create" }), { id: RUN });
    assert.strictEqual(received.length, 2);
    assert.deepStrictEqual(received[1].query, [["prompt_token", "pt_1"]]);
    for (const url of [link, `${link}?prompt_token=`]) {
      received = [];
      answer({ status: 503 });
      await assert.rejects(client().answer(url, { choice: "create" }), (error) => error.status === 503);
      assert.strictEqual(received.length, 1, url);
    }
  });
});

describe("Client: a retried DELETE that finds nothing", () => {
  const notFound = { status: 404, json: { errors: { detail: "Not Found" } } };

  it("is success after a read timeout", async () => {
    answer({ status: 204, delay: 300 }, notFound);
    assert.strictEqual(await client({ timeout: 50 }).deleteConnection(CONN), null);
    assert.deepStrictEqual(received.map((r) => r.method), ["DELETE", "DELETE"]);
  });

  it("is success after a reset connection, or a 502 or 504", async () => {
    for (const first of [{ destroy: true }, { status: 502 }, { status: 504 }]) {
      received = [];
      answer(first, notFound);
      assert.strictEqual(await client().deleteConnection(CONN), null, JSON.stringify(first));
      assert.strictEqual(received.length, 2);
    }
    answer({ status: 504 }, notFound);
    assert.strictEqual(await client().request("DELETE", `/connections/${CONN}/workflow-runs/${RUN}`), null);
  });

  it("raises on the first attempt's 404", async () => {
    answer(notFound);
    await assert.rejects(client().deleteConnection(CONN), (error) => error instanceof APIError && error.status === 404);
    assert.strictEqual(received.length, 1);
  });

  it("raises after a 503 or a 429", async () => {
    for (const first of [{ status: 503 }, { status: 429 }]) {
      received = [];
      answer(first, notFound);
      await assert.rejects(client().deleteConnection(CONN), (error) => error.status === 404);
      assert.strictEqual(received.length, 2);
    }
  });

  it("raises after a refused connection", async () => {
    // The first attempt finds nothing listening; the server opens on that port during the wait.
    const later = http.createServer((req, res) => {
      req.resume();
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ errors: { detail: "Not Found" } }));
    });
    later.on("connection", (socket) => socket.unref());
    await new Promise((resolve) => later.listen(0, "127.0.0.1", resolve));
    const port = later.address().port;
    await new Promise((resolve) => later.close(resolve));
    const c = new Client({
      apiKey: KEY,
      baseUrl: `http://127.0.0.1:${port}`,
      sleep: () => new Promise((resolve) => later.listen(port, "127.0.0.1", resolve)),
    });
    try {
      await assert.rejects(c.deleteConnection(CONN), (error) => error instanceof APIError && error.status === 404);
    } finally {
      later.close();
    }
  });

  it("leaves other methods' 404s alone", async () => {
    answer({ status: 504 }, notFound);
    await assert.rejects(client().getConnection(CONN), (error) => error.status === 404);
  });
});

describe("Client: every generated operation", () => {
  const { OPERATIONS } = require("../operations/index.js");
  const manifest = JSON.parse(require("node:fs").readFileSync(require("node:path").join(__dirname, "fixtures", "operations.json"), "utf8"));
  const camel = (snake) => snake.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

  it("covers the manifest", () => {
    assert.deepStrictEqual(Object.keys(OPERATIONS), manifest.operations.map((op) => op.id).sort());
  });

  it("carries the manifest's digest, as QuBe Sync names it in operations_digest", () => {
    const bytes = require("node:fs").readFileSync(require("node:path").join(__dirname, "fixtures", "operations.json"));
    const hex = require("node:crypto").createHash("sha256").update(bytes).digest("hex");
    assert.strictEqual(require("../operations/index.js").DIGEST, `sha256:${hex}`);
  });

  it("sends each through its entity accessor and action", async () => {
    const c = client();
    for (const op of manifest.operations) {
      received = [];
      const entity = c[camel(op.entity)];
      assert.strictEqual(typeof entity[op.action], "function", op.id);
      await entity[op.action](CONN, { probe: "x" }, { webhookUrl: "https://app.test/h" });
      const r = last();
      assert.strictEqual(r.method, op.method, op.id);
      assert.strictEqual(r.path, `/api/v2${op.path.replace("{connection_id}", CONN)}`, op.id);
      assert.match(r.headers["idempotency-key"], UUID, op.id);
      if (op.params_in === "body") {
        assert.deepStrictEqual(r.body, { probe: "x" }, op.id);
        assert.deepStrictEqual(r.query, [["webhook_url", "https://app.test/h"]], op.id);
      } else {
        assert.strictEqual(r.body, undefined, op.id);
        assert.deepStrictEqual(r.query, [["webhook_url", "https://app.test/h"], ["probe", "x"]], op.id);
      }
    }
  });

  it("escapes the connection id as one segment", async () => {
    await client().invoice.query("a/b", {}, { webhookUrl: "https://app.test/h" });
    assert.strictEqual(last().path, "/api/v2/connections/a%2Fb/invoices");
  });

  it("loads an entity's module on first use only, once per client", () => {
    const { execFileSync } = require("node:child_process");
    const script = `
      const { Client } = require(${JSON.stringify(require.resolve(".."))});
      const loaded = () => Object.keys(require.cache).filter((k) => /operations[\\/][a-z0-9_]+\\.js$/.test(k) && !/index\\.js$/.test(k)).map((k) => k.split(/[\\/]/).pop()).sort();
      const c = new Client({ apiKey: "k" });
      const before = loaded();
      const a = c.customerMsg;
      const same = a === c.customerMsg && a !== new Client({ apiKey: "k" }).customerMsg;
      console.log(JSON.stringify({ before, after: loaded(), same }));
    `;
    const out = JSON.parse(execFileSync(process.execPath, ["-e", script], { encoding: "utf8" }));
    assert.deepStrictEqual(out.before, []);
    assert.deepStrictEqual(out.after, ["customer_msg.js"]);
    assert.strictEqual(out.same, true);
  });

  it("can be imported alone", async () => {
    const { CustomerMsg } = require("qubesync/operations/customer_msg");
    await new CustomerMsg(client()).create(CONN, { name: "Net 30" }, { webhookUrl: "https://app.test/h" });
    assert.deepStrictEqual(pick(last()), ["POST", `/api/v2/connections/${CONN}/customer-msgs`, { name: "Net 30" }]);
  });

  it("is up to date with the manifest", () => {
    const { execFileSync } = require("node:child_process");
    execFileSync(process.execPath, [require("node:path").join(__dirname, "..", "scripts", "generate-operations.js"), "--check"], { encoding: "utf8" });
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
