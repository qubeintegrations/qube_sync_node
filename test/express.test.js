"use strict";

// qubesync/express on a real Express app, against a local fake of QuBe Sync.

const { describe, it: nodeIt } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

const express = require("express");

const support = require("./kit-support");
const { kit, fake, answer, logged, invoices, accounts, calls, reset, vectorBody, sign, SECRET, CONN } = support;
const qube = require("../express");

const it = (name, fn) => support.it(nodeIt, name, fn);

// Sends one request to the app, on a port of its own, and resolves to { status, headers, text }.
function request(app, { method = "GET", path, headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const req = http.request({ host: "127.0.0.1", port: server.address().port, method, path, headers }, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          server.close();
          resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString("utf8") });
        });
      });
      req.on("error", (err) => {
        server.close();
        reject(err);
      });
      if (body !== undefined) req.write(body);
      req.end();
    });
  });
}

// An app as the README mounts it: webhooks first, then JSON, a sign-in, connect and questions.
function app({ jsonFirst = false } = {}) {
  const made = express();
  if (jsonFirst) made.use(express.json());
  made.use(qube.webhooks());
  made.use(express.json());
  made.use((req, res, next) => {
    const user = req.get("X-Test-User");
    if (!user) return res.sendStatus(401);
    req.user = { id: user, accountId: Number(req.get("X-Test-Account") || 42) };
    next();
  });
  made.use(qube.connect());
  made.use(qube.questions());
  // Errors as text, so a test can read them.
  made.use((err, req, res, next) => {
    void next;
    res.status(500).type("text/plain").send(err.message);
  });
  return made;
}

function post(path, body, headers = {}) {
  return { method: "POST", path, body, headers: { "content-type": "application/json", ...headers } };
}

const signedIn = { "X-Test-User": "u1" };

describe("express: webhooks", () => {
  it("verifies, enqueues and answers 200", async () => {
    const jobs = [];
    reset({ enqueue: (job) => jobs.push(job) });
    const body = vectorBody("workflow_run.completed");
    const res = await request(app(), post("/webhooks/qube/create_invoice/7", body, { "X-Qube-Signature": sign(body) }));
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(jobs, [{ operation: "create_invoice", recordId: "7", body }]);
  });

  it("takes the connection's own events, at /connection/<account id>", async () => {
    const jobs = [];
    reset({ enqueue: (job) => jobs.push(job) });
    const body = vectorBody("connection.connected");
    const res = await request(app(), post("/webhooks/qube/connection/42", body, { "X-Qube-Signature": sign(body) }));
    assert.strictEqual(res.status, 200);
    assert.strictEqual(jobs[0].operation, "connection");
  });

  it("takes a body whatever its content type, and verifies its exact bytes", async () => {
    const jobs = [];
    reset({ enqueue: (job) => jobs.push(job) });
    const body = `  ${vectorBody("workflow_run.completed")}\n`;
    const res = await request(app(), { method: "POST", path: "/webhooks/qube/create_invoice/7", body, headers: { "content-type": "text/plain", "X-Qube-Signature": sign(body) } });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(jobs[0].body, body);
  });

  it("answers 401 to a bad signature, logging only its reason", async () => {
    const jobs = [];
    reset({ enqueue: (job) => jobs.push(job) });
    const body = vectorBody("workflow_run.completed");
    const bad = sign(body, "whsec_someone_else");
    for (const [header, reason] of [[bad, "mismatch"], [undefined, "missing"], ["nonsense", "malformed"], [sign(body, SECRET, 1000), "stale"]]) {
      const headers = header ? { "X-Qube-Signature": header } : {};
      const res = await request(app(), post("/webhooks/qube/create_invoice/7", body, headers));
      assert.strictEqual(res.status, 401);
      const last = logged()[logged().length - 1];
      assert.strictEqual(last.text, `QuBe Sync: refused a webhook: ${reason}`);
    }
    const all = logged().map((l) => l.text).join("\n");
    assert.ok(!all.includes(SECRET) && !all.includes(bad) && !all.includes(JSON.parse(body).run_id));
    assert.deepStrictEqual(jobs, []);
  });

  it("answers 404 for a slug none of the operations has, once verified", async () => {
    const jobs = [];
    reset({ enqueue: (job) => jobs.push(job) });
    const body = vectorBody("workflow_run.completed");
    const res = await request(app(), post("/webhooks/qube/delete_everything/7", body, { "X-Qube-Signature": sign(body) }));
    assert.strictEqual(res.status, 404);
    const unsigned = await request(app(), post("/webhooks/qube/delete_everything/7", body));
    assert.strictEqual(unsigned.status, 401);
    assert.deepStrictEqual(jobs, []);
  });

  it("needs the raw body: mounted after express.json(), it says so", async () => {
    const jobs = [];
    reset({ enqueue: (job) => jobs.push(job) });
    const body = vectorBody("workflow_run.completed");
    const res = await request(app({ jsonFirst: true }), post("/webhooks/qube/create_invoice/7", body, { "X-Qube-Signature": sign(body) }));
    assert.strictEqual(res.status, 500);
    assert.match(res.text, /already parsed .* Mount webhooks\(\) before them/);
    assert.deepStrictEqual(jobs, []);
  });

  it("an empty body is a 401, and an unset secret an error naming where to set it", async () => {
    reset({ enqueue: () => {} });
    const empty = await request(app(), { method: "POST", path: "/webhooks/qube/create_invoice/7", headers: { "X-Qube-Signature": sign("x") } });
    assert.strictEqual(empty.status, 401);
    assert.strictEqual(logged()[logged().length - 1].text, "QuBe Sync: refused a webhook: mismatch");

    kit.configure({ webhookSecret: null });
    const saved = process.env.QUBE_WEBHOOK_SECRET;
    delete process.env.QUBE_WEBHOOK_SECRET;
    try {
      const body = vectorBody("workflow_run.completed");
      const res = await request(app(), post("/webhooks/qube/create_invoice/7", body, { "X-Qube-Signature": sign(body) }));
      assert.strictEqual(res.status, 500);
      assert.match(res.text, /QUBE_WEBHOOK_SECRET is not set.*quickbooks-desktop\/config/);
    } finally {
      if (saved !== undefined) process.env.QUBE_WEBHOOK_SECRET = saved;
    }
  });

  it("refuses a body over its limit", async () => {
    reset({ enqueue: () => {} });
    const made = express();
    made.use(qube.webhooks({ limit: 100 }));
    const body = vectorBody("workflow_run.completed");
    const res = await request(made, post("/webhooks/qube/create_invoice/7", body, { "X-Qube-Signature": sign(body) }));
    assert.strictEqual(res.status, 413);
  });
});

describe("express: connect", () => {
  function accountSettings() {
    return {
      currentAccount: (req) => accounts.find(req.user.accountId),
    };
  }

  it("creates the connection the first time, and saves its id", async () => {
    reset(accountSettings());
    const row = accounts.add({ id: 42, qube_connection_id: null, qube_connection_revision: 3 });
    answer({ status: 201, json: { data: { id: "conn_new", links: { onboarding: "https://qubesync.com/onboard/abc" } } } });
    const res = await request(app(), { method: "POST", path: "/quickbooks/connect", headers: signedIn });
    assert.strictEqual(res.status, 303);
    assert.strictEqual(res.headers.location, "https://qubesync.com/onboard/abc");
    assert.deepStrictEqual(fake.received.map((r) => `${r.method} ${r.path}`), ["POST /api/v2/connections"]);
    assert.deepStrictEqual(fake.received[0].body, { webhook_url: "https://app.example.com/webhooks/qube/connection/42" });
    assert.strictEqual(row.qube_connection_id, "conn_new");
    assert.strictEqual(row.qube_connection_revision, null);
  });

  it("reuses a saved connection: its webhook URL brought up to date, with a fresh link", async () => {
    reset(accountSettings());
    accounts.add({ id: 42, qube_connection_id: CONN });
    answer({ json: { data: { id: CONN } } }, { json: { data: { id: CONN, links: { onboarding: "https://qubesync.com/onboard/again" } } } });
    const res = await request(app(), { method: "POST", path: "/quickbooks/connect", headers: signedIn });
    assert.strictEqual(res.status, 303);
    assert.strictEqual(res.headers.location, "https://qubesync.com/onboard/again");
    assert.deepStrictEqual(fake.received.map((r) => `${r.method} ${r.path}`), [`PUT /api/v2/connections/${CONN}`, `POST /api/v2/connections/${CONN}/onboarding-url`]);
    assert.deepStrictEqual(fake.received[0].body, { webhook_url: "https://app.example.com/webhooks/qube/connection/42" });
  });

  it("answers 401 when currentAccount finds no account, and says where to set it when unset", async () => {
    reset(accountSettings());
    const res = await request(app(), { method: "POST", path: "/quickbooks/connect", headers: { ...signedIn, "X-Test-Account": "999" } });
    assert.strictEqual(res.status, 401);
    assert.deepStrictEqual(fake.received, []);

    reset();
    const unset = await request(app(), { method: "POST", path: "/quickbooks/connect", headers: signedIn });
    assert.strictEqual(unset.status, 500);
    assert.match(unset.text, /the currentAccount setting isn't set\. Set it with configure\(\{ currentAccount \}\) in your app's quickbooks-desktop\/config/);
  });
});

describe("express: questions", () => {
  const SEARCH = () => `${fake.base}/api/v2/connections/${CONN}/workflow-runs/r1/search?prompt_token=tok`;
  const DECISIONS = () => `${fake.base}/api/v2/connections/${CONN}/workflow-runs/r1/decisions?prompt_token=tok`;

  function asking(fields = {}) {
    return invoices.add({
      id: 7,
      account_id: 42,
      qube_reference: "r",
      qube_revision: 2,
      qube_question: {
        id: "ask_pick",
        token: "tok",
        kind: "pick",
        message: "Which?",
        choices: [
          {
            id: "use",
            label: "Use it",
            fields: [
              { name: "count", type: "number" },
              { name: "rush", type: "boolean" },
              { name: "customer", type: "record" },
            ],
          },
          { id: "skip", label: "Skip" },
        ],
      },
      qube_links: { decisions: DECISIONS(), search: SEARCH() },
      ...fields,
    });
  }

  const authorized = {
    authorizeQuestion: (req, record) => record.account_id === req.user.accountId,
  };

  function form(fields) {
    return {
      method: "POST",
      path: "/qube/questions/create_invoice/7",
      body: new URLSearchParams(fields).toString(),
      headers: { "content-type": "application/x-www-form-urlencoded", Referer: "http://elsewhere.example/page", ...signedIn },
    };
  }

  it("refuses every answer and search until authorizeQuestion is set, and logs why", async () => {
    reset();
    const record = asking();
    const res = await request(app(), form({ choice: "skip" }));
    assert.strictEqual(res.status, 404);
    const search = await request(app(), { path: "/qube/questions/create_invoice/7/search?field=customer&q=acme", headers: signedIn });
    assert.strictEqual(search.status, 404);
    assert.deepStrictEqual(fake.received, []);
    assert.ok(record.qube_question);
    const warnings = logged().filter((l) => /the authorizeQuestion setting isn't set/.test(l.text));
    assert.strictEqual(warnings.length, 2);
    assert.match(warnings[0].text, /create_invoice 7.*configure\(\{ authorizeQuestion \}\) in your app's quickbooks-desktop\/config/);
  });

  it("refuses a user authorizeQuestion refuses, and a slug that isn't an operation", async () => {
    reset(authorized);
    asking({ account_id: 1 });
    assert.strictEqual((await request(app(), form({ choice: "skip" }))).status, 404);
    kit.configure({ authorizeQuestion: (req, record) => record });
    assert.strictEqual((await request(app(), form({ choice: "skip" }))).status, 404);
    assert.match(logged()[logged().length - 1].text, /authorizeQuestion returned object, not true or false/);
    const connection = await request(app(), { ...form({ choice: "skip" }), path: "/qube/questions/connection/7" });
    assert.strictEqual(connection.status, 404);
    assert.deepStrictEqual(fake.received, []);
  });

  it("posts the choice with its fields as their types, forgets the question, and sends the user back", async () => {
    reset(authorized);
    const record = asking();
    answer({ json: { data: { state: "running" } } });
    const res = await request(app(), form({ choice: "use", "data[count]": "3", "data[rush]": "true", "data[customer]": "80000001-1" }));
    assert.strictEqual(res.status, 303);
    assert.strictEqual(res.headers.location, "/"); // the referer isn't this app
    const sent = fake.received[0];
    assert.strictEqual(sent.method, "POST");
    assert.strictEqual(sent.path, `/api/v2/connections/${CONN}/workflow-runs/r1/decisions`);
    assert.deepStrictEqual(sent.body, { choice: "use", data: { count: 3, rush: true, customer: "80000001-1" } });
    assert.strictEqual(record.qube_question, null);
    assert.strictEqual(record.qube_links, null);
  });

  it("sends the user back to the page they answered on, when it's this app's", async () => {
    reset(authorized);
    asking();
    answer({ json: { data: {} } });
    const app1 = app();
    const server = app1.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const port = server.address().port;
    const res = await new Promise((resolve, reject) => {
      const body = "choice=skip";
      const req = http.request(
        {
          host: "127.0.0.1",
          port,
          method: "POST",
          path: "/qube/questions/create_invoice/7",
          headers: { "content-type": "application/x-www-form-urlencoded", Referer: `http://127.0.0.1:${port}/invoices/7`, ...signedIn },
        },
        (r) => {
          r.resume();
          r.on("end", () => resolve(r));
        }
      );
      req.on("error", reject);
      req.end(body);
    });
    server.close();
    assert.strictEqual(res.statusCode, 303);
    assert.strictEqual(res.headers.location, `http://127.0.0.1:${port}/invoices/7`);
  });

  it("a choice the question doesn't have is a 409, and nothing is sent", async () => {
    reset(authorized);
    const record = asking();
    const res = await request(app(), form({ choice: "invented" }));
    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.text, kit.QUESTION_CHANGED);
    assert.deepStrictEqual(fake.received, []);
    assert.ok(record.qube_question);
  });

  for (const [status, errors] of [
    [409, { code: "prompt_changed", detail: "The question has changed." }],
    [400, { code: "not_awaiting_input", detail: "The run isn't waiting." }],
  ]) {
    it(`QuBe Sync's ${status} ${errors.code}: the question is forgotten, and the user told it changed (409)`, async () => {
      reset(authorized);
      const record = asking();
      answer({ status, json: { errors } });
      const res = await request(app(), form({ choice: "skip" }));
      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.text, kit.QUESTION_CHANGED);
      assert.strictEqual(record.qube_question, null);
    });
  }

  it("QuBe Sync's 422: the refusal in words, and the question kept", async () => {
    reset(authorized);
    const record = asking();
    answer({ status: 422, json: { errors: { detail: "count must be a whole number" } } });
    const res = await request(app(), form({ choice: "use", "data[count]": "2.5" }));
    assert.strictEqual(res.status, 422);
    assert.strictEqual(res.headers["content-type"].split(";")[0], "text/plain");
    assert.strictEqual(res.text, "QuBe Sync couldn't take that answer: count must be a whole number");
    assert.ok(record.qube_question);
  });

  it("a 500 from QuBe Sync is an error, and the question is kept", async () => {
    reset(authorized);
    const record = asking();
    answer({ status: 500, json: { errors: "boom" } });
    const res = await request(app(), form({ choice: "skip" }));
    assert.strictEqual(res.status, 500);
    assert.ok(record.qube_question);
  });

  it("search: asks QuBe Sync within its bounds, and passes a 4xx on as []", async () => {
    reset(authorized);
    const record = asking();
    const path = (q, field = "customer") => `/qube/questions/create_invoice/7/search?field=${encodeURIComponent(field)}&q=${encodeURIComponent(q)}`;
    const matches = [{ value: "80000001-1", label: "Acme", detail: null }];
    answer({ json: { data: matches } });

    const found = await request(app(), { path: path("  acme "), headers: signedIn });
    assert.strictEqual(found.status, 200);
    assert.deepStrictEqual(JSON.parse(found.text), matches);
    assert.deepStrictEqual(fake.received[0].query, { prompt_token: "tok", field: "customer", q: "acme" });

    for (const q of ["a", " a ", "x".repeat(101)]) {
      const res = await request(app(), { path: path(q), headers: signedIn });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(JSON.parse(res.text), []);
    }
    const noField = await request(app(), { path: path("acme", ""), headers: signedIn });
    assert.deepStrictEqual([noField.status, JSON.parse(noField.text)], [200, []]);
    assert.strictEqual(fake.received.length, 1);

    answer({ status: 409, json: { errors: { code: "prompt_changed" } } });
    const changed = await request(app(), { path: path("acme"), headers: signedIn });
    assert.deepStrictEqual([changed.status, JSON.parse(changed.text)], [409, []]);

    record.qube_links = { decisions: DECISIONS(), search: null };
    const none = await request(app(), { path: path("acme"), headers: signedIn });
    assert.deepStrictEqual([none.status, JSON.parse(none.text)], [409, []]);
    assert.strictEqual(fake.received.length, 2);
  });
});

describe("express: options", () => {
  it("a router takes settings as its argument, and the Settings configure returns", async () => {
    reset();
    const settings = kit.configure({ enqueue: () => {} });
    assert.ok(qube.webhooks(settings));
    qube.questions({ authorizeQuestion: () => true, limit: "10kb" });
    assert.strictEqual(typeof kit.settings().authorizeQuestion, "function");
    assert.strictEqual(await kit.settings().authorizeQuestion({}, {}, "create_invoice"), true);
    assert.throws(() => qube.connect({ nope: 1 }), /doesn't know the setting "nope"/);
  });
});

