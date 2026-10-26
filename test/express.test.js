"use strict";

// qubesync/express on a real Express app, against a local fake of QuBe Sync: every route's
// status codes, and that each is scoped to the signed-in account.

const { describe, it: nodeIt } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

const express = require("express");

const support = require("./kit-support");
const {
  kit,
  fake,
  answer,
  data,
  apiError,
  logged,
  loggedText,
  tables,
  reset,
  makeConnection,
  makeRun,
  reload,
  vectorBody,
  runBody,
  sign,
  qubeConnectionFor,
  SECRET,
  CONN,
  WEBHOOK_URL,
} = support;
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

// An app as the README mounts it: webhooks first, then JSON, a sign-in (X-Test-Account names the
// signed-in account), connect and questions.
function app({ jsonFirst = false } = {}) {
  const made = express();
  if (jsonFirst) made.use(express.json());
  made.use(qube.webhooks());
  made.use(express.json());
  made.use((req, res, next) => {
    const id = req.get("X-Test-Account");
    if (!id) return res.sendStatus(401);
    req.account = tables.Account.find(id);
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

function signedPost(path, body, headers = {}) {
  return { method: "POST", path, body, headers: { "content-type": "application/json", "X-Qube-Signature": sign(body), ...headers } };
}

function form(path, fields, account, headers = {}) {
  const body = new URLSearchParams(fields).toString();
  const signedIn = account ? { "X-Test-Account": String(account.id) } : {};
  return { method: "POST", path, body, headers: { "content-type": "application/x-www-form-urlencoded", ...signedIn, ...headers } };
}

// The fixtures most tests start from: an account, its connection, an invoice and a run of it.
async function fixtures() {
  const account = tables.Account.add({ name: "Riverbend" });
  const connection = await makeConnection(account);
  const invoice = tables.Invoice.add({ accountId: account.id, number: "1001" });
  const run = await makeRun(invoice, connection);
  return { account, connection, invoice, run };
}

describe("express: webhooks", () => {
  it("POST /webhooks/qube/runs/:id verifies the delivery, enqueues it with its raw body and answers 200", async () => {
    const deliveries = [];
    reset({ enqueue: (delivery) => deliveries.push(delivery) });
    const { run } = await fixtures();
    const body = `  ${runBody("workflow_run.completed", run)}\n`;
    const res = await request(app(), { ...signedPost(`/webhooks/qube/runs/${run.id}`, body), headers: { "content-type": "text/plain", "X-Qube-Signature": sign(body) } });
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(deliveries, [{ kind: "run", id: String(run.id), body }]);
  });

  it("POST /webhooks/qube/connections/:id verifies the delivery, enqueues it and answers 200, a connection with no qubeId yet included", async () => {
    const deliveries = [];
    reset({ enqueue: (delivery) => deliveries.push(delivery) });
    const account = tables.Account.add();
    const connection = await makeConnection(account);
    const waiting = await kit.Connection.create(account);
    const body = vectorBody("connection.connected");
    for (const row of [connection, waiting]) {
      const res = await request(app(), signedPost(`/webhooks/qube/connections/${row.id}`, body));
      assert.strictEqual(res.status, 200);
    }
    assert.deepStrictEqual(deliveries.map((d) => [d.kind, d.id]), [["connection", String(connection.id)], ["connection", String(waiting.id)]]);
  });

  it("answers 404 for a row that isn't there, once the signature checks out, and checks the signature first", async () => {
    const deliveries = [];
    reset({ enqueue: (delivery) => deliveries.push(delivery) });
    const body = vectorBody("workflow_run.completed");
    for (const path of ["/webhooks/qube/runs/999", "/webhooks/qube/runs/abc", "/webhooks/qube/connections/999"]) {
      assert.strictEqual((await request(app(), signedPost(path, body))).status, 404, path);
      assert.strictEqual((await request(app(), signedPost(path, body, { "X-Qube-Signature": "t=1,v1=00" }))).status, 401, path);
    }
    assert.deepStrictEqual(deliveries, []);
  });

  it("refuses a bad signature with 401, logging only its reason, never the secret or the body", async () => {
    const deliveries = [];
    reset({ enqueue: (delivery) => deliveries.push(delivery) });
    const { run, connection } = await fixtures();
    const body = runBody("workflow_run.completed", run);
    const bad = sign(body, "whsec_someone_else");
    for (const path of [`/webhooks/qube/runs/${run.id}`, `/webhooks/qube/connections/${connection.id}`]) {
      for (const [header, reason] of [[bad, "mismatch"], [undefined, "missing"], ["nonsense", "malformed"], [sign(body, SECRET, 1000), "stale"]]) {
        const res = await request(app(), { method: "POST", path, body, headers: header ? { "X-Qube-Signature": header } : {} });
        assert.strictEqual(res.status, 401);
        assert.strictEqual(logged()[logged().length - 1].text, `QuBe Sync: refused a webhook: ${reason}`);
      }
    }
    const tampered = await request(app(), { method: "POST", path: `/webhooks/qube/runs/${run.id}`, body: `${body} `, headers: { "X-Qube-Signature": sign(body) } });
    assert.strictEqual(tampered.status, 401);
    const all = loggedText();
    assert.ok(!all.includes(SECRET) && !all.includes(bad) && !all.includes(run.reference));
    assert.deepStrictEqual(deliveries, []);
  });

  it("takes a list of secrets while one rotates", async () => {
    reset({ enqueue: () => {}, webhookSecret: ["whsec_new", SECRET] });
    const { run } = await fixtures();
    const body = runBody("workflow_run.completed", run);
    assert.strictEqual((await request(app(), signedPost(`/webhooks/qube/runs/${run.id}`, body))).status, 200);
  });

  it("answers 503, logged without the body, when the enqueue returns false or throws", async () => {
    reset({ enqueue: () => false });
    const { run } = await fixtures();
    const body = runBody("workflow_run.completed", run);
    assert.strictEqual((await request(app(), signedPost(`/webhooks/qube/runs/${run.id}`, body))).status, 503);
    assert.match(loggedText(), new RegExp(`error QuBe Sync: couldn't enqueue a webhook for run ${run.id}: the enqueue returned false; answered 503`));
    kit.configure({
      enqueue: async () => {
        throw new Error("redis down: secret-ish detail");
      },
    });
    assert.strictEqual((await request(app(), signedPost(`/webhooks/qube/runs/${run.id}`, body))).status, 503);
    assert.match(loggedText(), new RegExp(`couldn't enqueue a webhook for run ${run.id} \\(Error\\); answered 503`));
    assert.ok(!loggedText().includes(run.reference) && !loggedText().includes("secret-ish"));
  });

  it("takes a body of up to 5 MB, and answers 413 for a larger one", async () => {
    const deliveries = [];
    reset({ enqueue: (delivery) => deliveries.push(delivery) });
    const { run } = await fixtures();
    const padded = JSON.stringify({ ...JSON.parse(runBody("workflow_run.completed", run)), pad: "x".repeat(4 * 1024 * 1024) });
    assert.strictEqual((await request(app(), signedPost(`/webhooks/qube/runs/${run.id}`, padded))).status, 200);
    const big = "x".repeat(kit.MAX_BODY_BYTES + 1);
    assert.strictEqual((await request(app(), signedPost(`/webhooks/qube/runs/${run.id}`, big))).status, 413);
    assert.match(loggedText(), /refused a webhook: its body is over 5242880 bytes/);
    assert.strictEqual(deliveries.length, 1);
  });

  it("needs no sign-in, and the raw body: mounted after express.json(), it says so", async () => {
    reset({ enqueue: () => {} });
    const { run } = await fixtures();
    const body = runBody("workflow_run.completed", run);
    const res = await request(app({ jsonFirst: true }), signedPost(`/webhooks/qube/runs/${run.id}`, body));
    assert.strictEqual(res.status, 500);
    assert.match(res.text, /already parsed .* Mount webhooks\(\) before them/);
  });

  it("raises naming the config file when the webhook secret isn't set", async () => {
    reset({ enqueue: () => {} });
    const { run } = await fixtures();
    kit.configure({ webhookSecret: null });
    const saved = process.env.QUBE_WEBHOOK_SECRET;
    delete process.env.QUBE_WEBHOOK_SECRET;
    try {
      const res = await request(app(), signedPost(`/webhooks/qube/runs/${run.id}`, "{}"));
      assert.strictEqual(res.status, 500);
      assert.match(res.text, /webhookSecret isn't set yet\. Set QUBE_WEBHOOK_SECRET/);
    } finally {
      if (saved !== undefined) process.env.QUBE_WEBHOOK_SECRET = saved;
    }
  });

  it("has no route for the old /:operation/:record_id and /connection/:account_id URLs", async () => {
    reset({ enqueue: () => {} });
    const body = vectorBody("workflow_run.completed");
    assert.strictEqual((await request(app(), signedPost("/webhooks/qube/create_invoice/7", body))).status, 401); // past the webhooks router, into the sign-in
    assert.strictEqual((await request(app(), signedPost("/webhooks/qube/connection/1", body))).status, 401);
  });
});

describe("express: connect", () => {
  const onboarding = (id = "conn-q-1") => data({ id, links: { onboarding: `https://qubesync.com/onboard/${id}` } }, 201);

  it("POST /quickbooks/connections writes a row, makes QuBe Sync's with the row's webhook URL, and sends them to setup", async () => {
    reset();
    const account = tables.Account.add();
    answer(onboarding());
    const res = await request(app(), form("/quickbooks/connections", { name: "  Main file  " }, account));
    assert.strictEqual(res.status, 303);
    assert.strictEqual(res.headers.location, "https://qubesync.com/onboard/conn-q-1");
    const [connection] = await kit.Connection.ownedBy(account);
    assert.deepStrictEqual([connection.qubeId, connection.name, connection.status], ["conn-q-1", "Main file", "pending"]);
    assert.deepStrictEqual(fake.received.map((r) => [r.method, r.path, r.body]), [
      ["POST", "/api/v2/connections", { webhook_url: `${WEBHOOK_URL}/connections/${connection.id}`, name: "Main file" }],
    ]);
  });

  it("sends the newest connection that never connected back through setup, rather than making another", async () => {
    reset();
    const account = tables.Account.add();
    await makeConnection(account, { qubeId: "q-old", status: "pending" });
    const newest = await makeConnection(account, { qubeId: "q-new", status: "setup_cancelled" });
    answer(data({ id: "q-new" }), onboarding("q-new"));
    const res = await request(app(), form("/quickbooks/connections", {}, account));
    assert.strictEqual(res.headers.location, "https://qubesync.com/onboard/q-new");
    assert.deepStrictEqual(fake.received.map((r) => [r.method, r.path, r.body]), [
      ["PUT", "/api/v2/connections/q-new", { webhook_url: `${WEBHOOK_URL}/connections/${newest.id}` }],
      ["POST", "/api/v2/connections/q-new/onboarding-url", undefined],
    ]);
    assert.strictEqual((await kit.Connection.ownedBy(account)).length, 2);
  });

  it("makes a new connection when the account's only one is connected, and another with new=1", async () => {
    reset();
    const account = tables.Account.add();
    await makeConnection(account, { qubeId: "q-1", status: "connected" });
    answer(onboarding("q-2"));
    await request(app(), form("/quickbooks/connections", {}, account));
    assert.strictEqual((await kit.Connection.ownedBy(account)).length, 2);
    answer(onboarding("q-3"));
    const res = await request(app(), form("/quickbooks/connections", { new: "1", name: "Second file" }, account));
    assert.strictEqual(res.headers.location, "https://qubesync.com/onboard/q-3");
    const listed = await kit.Connection.ownedBy(account);
    assert.strictEqual(listed.length, 3);
    assert.strictEqual(listed.find((c) => c.qubeId === "q-3").name, "Second file");
  });

  it("leaves the row without a qubeId when QuBe Sync doesn't answer, and the next click picks it up", async () => {
    reset();
    const account = tables.Account.add();
    answer(apiError(500, "boom"));
    assert.strictEqual((await request(app(), form("/quickbooks/connections", {}, account))).status, 500);
    const [left] = await kit.Connection.ownedBy(account);
    assert.strictEqual(left.qubeId, null);
    fake.received = [];
    answer(data([]), onboarding("q-1"));
    const res = await request(app(), form("/quickbooks/connections", {}, account));
    assert.strictEqual(res.status, 303);
    assert.deepStrictEqual(fake.received.map((r) => [r.method, r.path]), [["GET", "/api/v2/connections"], ["POST", "/api/v2/connections"]]);
    const listed = await kit.Connection.ownedBy(account);
    assert.deepStrictEqual(listed.map((c) => c.qubeId), ["q-1"]);
  });

  it("adopts a connection whose create landed but whose id was never saved, making no second one", async () => {
    reset();
    const account = tables.Account.add();
    const left = await kit.Connection.create(account);
    answer(data([qubeConnectionFor(left)]), data({ id: "conn-q-lost" }), onboarding("conn-q-lost"));
    const res = await request(app(), form("/quickbooks/connections", {}, account));
    assert.strictEqual(res.headers.location, "https://qubesync.com/onboard/conn-q-lost");
    assert.deepStrictEqual(fake.received.map((r) => [r.method, r.path]), [
      ["GET", "/api/v2/connections"],
      ["PUT", "/api/v2/connections/conn-q-lost"],
      ["POST", "/api/v2/connections/conn-q-lost/onboarding-url"],
    ]);
    assert.strictEqual((await kit.Connection.get(left.id)).qubeId, "conn-q-lost");
  });

  it("is behind the app's sign-in, answers 401 when currentAccount finds no account, and raises when it isn't set", async () => {
    reset();
    assert.strictEqual((await request(app(), form("/quickbooks/connections", {}, null))).status, 401);
    const res = await request(app(), form("/quickbooks/connections", {}, { id: 999 }));
    assert.strictEqual(res.status, 401);
    assert.match(loggedText(), /refused a connect: currentAccount found no signed-in account/);
    kit.configure({ currentAccount: null });
    const unset = await request(app(), form("/quickbooks/connections", {}, tables.Account.add()));
    assert.strictEqual(unset.status, 500);
    assert.match(unset.text, /currentAccount isn't set yet.*quickbooks-desktop\/config/);
    assert.strictEqual(fake.received.length, 0);
  });

  it("POST /quickbooks/connections/:id/onboarding brings the connection's webhook URL up to date and sends them back through setup", async () => {
    reset();
    const account = tables.Account.add();
    const connection = await makeConnection(account, { qubeId: "q-1" });
    answer(data({ id: "q-1" }), onboarding("q-1"));
    const res = await request(app(), form(`/quickbooks/connections/${connection.id}/onboarding`, {}, account));
    assert.strictEqual(res.status, 303);
    assert.strictEqual(res.headers.location, "https://qubesync.com/onboard/q-1");
    assert.deepStrictEqual(fake.received[0].body, { webhook_url: `${WEBHOOK_URL}/connections/${connection.id}` });
  });

  it("makes QuBe Sync's connection for a row left without one", async () => {
    reset();
    const account = tables.Account.add();
    const connection = await kit.Connection.create(account, { name: "Main" });
    answer(data([]), onboarding("q-9"));
    const res = await request(app(), form(`/quickbooks/connections/${connection.id}/onboarding`, {}, account));
    assert.strictEqual(res.status, 303);
    assert.deepStrictEqual(fake.received[1].body, { webhook_url: connection.webhookUrl(), name: "Main" });
    assert.strictEqual((await kit.Connection.get(connection.id)).qubeId, "q-9");
  });

  it("answers 404 for another account's connection, or one that isn't there, and asks QuBe Sync nothing", async () => {
    reset();
    const owner = tables.Account.add();
    const other = tables.Account.add();
    const connection = await makeConnection(owner);
    for (const id of [connection.id, 999, "abc"]) {
      const res = await request(app(), form(`/quickbooks/connections/${id}/onboarding`, {}, other));
      assert.strictEqual(res.status, 404, String(id));
    }
    assert.strictEqual((await request(app(), form(`/quickbooks/connections/${connection.id}/onboarding`, {}, { id: 999 }))).status, 401);
    assert.strictEqual(fake.received.length, 0);
  });
});

describe("express: questions", () => {
  const question = {
    token: "tok",
    message: "Which customer?",
    choices: [
      { id: "use:1", label: "Riverbend Electric", fields: [] },
      {
        id: "add",
        label: "Add it",
        fields: [
          { name: "name", type: "text" },
          { name: "count", type: "number" },
          { name: "rate", type: "number" },
          { name: "taxable", type: "boolean" },
          { name: "note", type: "text" },
        ],
      },
    ],
  };

  // A run asking the question, with its links on the fake.
  async function asking() {
    const made = await fixtures();
    const base = fake.base;
    const links = {
      decisions: `${base}/api/v2/connections/c/workflow-runs/r/decisions?prompt_token=tok`,
      search: `${base}/api/v2/connections/c/workflow-runs/r/search?prompt_token=tok`,
    };
    await made.run.update({ question, links, revision: 6, state: "awaiting_input" });
    return { ...made, links };
  }

  function answerForm(run, fields, account, headers = {}) {
    return form(`/qube/questions/runs/${run.id}`, fields, account, { Referer: `/invoices/${run.recordId}`, ...headers });
  }

  it("POST /qube/questions/runs/:id posts the choice with its fields as their types, forgets the question and goes back", async () => {
    reset();
    const { account, run } = await asking();
    answer(data({ state: "running" }));
    const res = await request(
      app(),
      answerForm(run, { choice: "add", "data[name]": " Lone Star ", "data[count]": "3", "data[rate]": "1.5", "data[taxable]": "true", "data[note]": "" }, account)
    );
    assert.strictEqual(res.status, 303);
    assert.strictEqual(res.headers.location, `/invoices/${run.recordId}`);
    assert.deepStrictEqual(fake.received[0].body, { choice: "add", data: { name: "Lone Star", count: 3, rate: 1.5, taxable: true } });
    assert.strictEqual(fake.received[0].query.prompt_token, "tok");
    assert.strictEqual((await reload(run)).question, null);
  });

  it("sends an unticked checkbox as false, and a number it can't read as typed", async () => {
    reset();
    const { account, run } = await asking();
    answer(data({}));
    await request(app(), answerForm(run, { choice: "add", "data[count]": "three" }, account));
    assert.deepStrictEqual(fake.received[0].body.data, { count: "three", taxable: false });
  });

  it("answers 409 for a choice the question doesn't have, and for a run that has stopped asking", async () => {
    reset();
    const { account, run } = await asking();
    let res = await request(app(), answerForm(run, { choice: "nope" }, account));
    assert.deepStrictEqual([res.status, res.text], [409, kit.QUESTION_CHANGED]);
    await run.update({ question: null, links: null });
    res = await request(app(), answerForm(run, { choice: "use:1" }, account));
    assert.strictEqual(res.status, 409);
    assert.strictEqual(fake.received.length, 0);
  });

  it("forgets the question and answers 409 when QuBe Sync says it was answered or asked again, or any other 400", async () => {
    for (const refusal of [apiError(409, { code: "conflict" }), apiError(400, { code: "not_awaiting_input" }), apiError(400, { code: "bad_request" })]) {
      reset();
      const { account, run } = await asking();
      answer(refusal);
      const res = await request(app(), answerForm(run, { choice: "use:1" }, account));
      assert.strictEqual(res.status, 409);
      assert.strictEqual((await reload(run)).question, null);
    }
  });

  it("keeps the question and says why for a 422, and raises for anything else QuBe Sync answers", async () => {
    reset();
    const { account, run } = await asking();
    answer(apiError(422, { code: "invalid", detail: "count must be whole" }));
    let res = await request(app(), answerForm(run, { choice: "add", "data[count]": "1.5" }, account));
    assert.deepStrictEqual([res.status, res.text], [422, "QuBe Sync couldn't take that answer: count must be whole"]);
    assert.notStrictEqual((await reload(run)).question, null);
    answer(apiError(500, "boom"));
    res = await request(app(), answerForm(run, { choice: "use:1" }, account));
    assert.strictEqual(res.status, 500);
    assert.match(res.text, /QuBe Sync answered 500/);
  });

  it("by default lets the account that owns the run's connection answer, and nobody else", async () => {
    reset();
    const { account, run } = await asking();
    const other = tables.Account.add({ name: "Someone else" });
    answer(data({}));
    const refused = await request(app(), answerForm(run, { choice: "use:1" }, other));
    assert.strictEqual(refused.status, 404);
    assert.match(loggedText(), new RegExp(`refused an answer for run ${run.id}: authorizeQuestion said no`));
    assert.strictEqual(fake.received.length, 0);
    const allowed = await request(app(), answerForm(run, { choice: "use:1" }, account));
    assert.strictEqual(allowed.status, 303);
  });

  it("by default refuses when currentAccount finds no account, or one with no id (never matching a null owner)", async () => {
    reset();
    const { run } = await asking();
    assert.strictEqual((await request(app(), answerForm(run, { choice: "use:1" }, { id: 999 }))).status, 404);
    kit.configure({ currentAccount: () => new support.Account() });
    assert.strictEqual((await request(app(), answerForm(run, { choice: "use:1" }, { id: 1 }))).status, 404);
    kit.configure({ currentAccount: () => Object.assign(new support.Customer(), { id: 1 }) }); // the same id, another type
    assert.strictEqual((await request(app(), answerForm(run, { choice: "use:1" }, { id: 1 }))).status, 404);
    assert.strictEqual(fake.received.length, 0);
  });

  it("uses an authorizeQuestion the app sets in place of the default, with the request, the record and the run", async () => {
    reset();
    const { invoice, run } = await asking();
    const staff = tables.Account.add({ name: "Staff" });
    const seen = [];
    kit.configure({
      authorizeQuestion: (req, record, asked) => {
        seen.push([req.account, record, asked.id, asked.connection.qubeId]);
        return record.number === "1001";
      },
    });
    answer(data({}));
    const res = await request(app(), answerForm(run, { choice: "use:1" }, staff));
    assert.strictEqual(res.status, 303);
    assert.deepStrictEqual(seen, [[staff, invoice, run.id, CONN]]);
  });

  it("lets only true through: a truthy answer is refused", async () => {
    reset();
    const { account, run } = await asking();
    kit.configure({ authorizeQuestion: (req, record) => record });
    assert.strictEqual((await request(app(), answerForm(run, { choice: "use:1" }, account))).status, 404);
    assert.strictEqual(fake.received.length, 0);
  });

  it("answers 403, logged, while neither authorizeQuestion nor currentAccount is set", async () => {
    reset();
    const { account, run } = await asking();
    kit.configure({ currentAccount: null });
    const res = await request(app(), answerForm(run, { choice: "use:1" }, account));
    assert.strictEqual(res.status, 403);
    assert.match(loggedText(), /neither authorizeQuestion nor currentAccount is set/);
    const search = await request(app(), { path: `/qube/questions/runs/${run.id}/search?field=customer&q=Riv`, headers: { "X-Test-Account": String(account.id) } });
    assert.deepStrictEqual([search.status, JSON.parse(search.text)], [403, []]);
    kit.configure({ authorizeQuestion: () => true });
    answer(data({}));
    assert.strictEqual((await request(app(), answerForm(run, { choice: "use:1" }, account))).status, 303);
  });

  it("answers 404 for a run that isn't there, whose operation isn't configured, or whose record findRecord can't find", async () => {
    reset();
    const { account, run, invoice } = await asking();
    for (const id of ["999", "abc"]) {
      assert.strictEqual((await request(app(), form(`/qube/questions/runs/${id}`, { choice: "x" }, account))).status, 404);
    }
    tables.Invoice.rows.delete(String(invoice.id));
    assert.strictEqual((await request(app(), answerForm(run, { choice: "use:1" }, account))).status, 404);
    tables.Invoice.rows.set(String(invoice.id), invoice);
    kit.configure({ operations: { sync_customer: support.SyncCustomer } });
    assert.strictEqual((await request(app(), answerForm(run, { choice: "use:1" }, account))).status, 404);
  });

  it("is behind the app's sign-in, and has no route for the old /:operation/:record_id URLs", async () => {
    reset();
    const { account, run } = await asking();
    assert.strictEqual((await request(app(), answerForm(run, { choice: "use:1" }, null))).status, 401);
    assert.strictEqual((await request(app(), form(`/qube/questions/create_invoice/${run.recordId}`, { choice: "use:1" }, account))).status, 404);
  });

  describe("GET /qube/questions/runs/:id/search", () => {
    function search(run, query, account) {
      return { path: `/qube/questions/runs/${run.id}/search?${new URLSearchParams(query)}`, headers: account ? { "X-Test-Account": String(account.id) } : {} };
    }

    it("returns the matches from the question's links.search", async () => {
      reset();
      const { account, run } = await asking();
      const matches = [{ value: "80000001-1", label: "Riverbend Electric", detail: "Austin" }];
      answer(data(matches));
      const res = await request(app(), search(run, { field: "customer", q: " Riv " }, account));
      assert.deepStrictEqual([res.status, JSON.parse(res.text)], [200, matches]);
      assert.deepStrictEqual([fake.received[0].query.field, fake.received[0].query.q, fake.received[0].query.prompt_token], ["customer", "Riv", "tok"]);
    });

    it("asks nothing for fewer than 2 or more than 100 characters, or a field name over 100", async () => {
      reset();
      const { account, run } = await asking();
      for (const query of [{ field: "customer", q: "R" }, { field: "customer", q: "R".repeat(101) }, { field: "f".repeat(101), q: "Riv" }, { field: "", q: "Riv" }]) {
        const res = await request(app(), search(run, query, account));
        assert.deepStrictEqual([res.status, JSON.parse(res.text)], [200, []]);
      }
      assert.strictEqual(fake.received.length, 0);
    });

    it("answers 409 when the question has no search link, and passes QuBe Sync's 4xx on, with no matches", async () => {
      reset();
      const { account, run, links } = await asking();
      answer(apiError(409, { code: "conflict" }));
      let res = await request(app(), search(run, { field: "customer", q: "Riv" }, account));
      assert.deepStrictEqual([res.status, JSON.parse(res.text)], [409, []]);
      await run.update({ links: { decisions: links.decisions, search: null } });
      res = await request(app(), search(run, { field: "customer", q: "Riv" }, account));
      assert.deepStrictEqual([res.status, JSON.parse(res.text)], [409, []]);
      assert.strictEqual(fake.received.length, 1);
    });

    it("answers [] with 404 for another account's run, or when authorizeQuestion says no", async () => {
      reset();
      const { account, run } = await asking();
      const other = tables.Account.add();
      let res = await request(app(), search(run, { field: "customer", q: "Riv" }, other));
      assert.deepStrictEqual([res.status, JSON.parse(res.text)], [404, []]);
      kit.configure({ authorizeQuestion: () => false });
      res = await request(app(), search(run, { field: "customer", q: "Riv" }, account));
      assert.deepStrictEqual([res.status, JSON.parse(res.text)], [404, []]);
      assert.strictEqual(fake.received.length, 0);
    });
  });
});

describe("express: retry_start", () => {
  async function unconfirmed() {
    const made = await fixtures();
    answer(apiError(500, "boom"));
    await assert.rejects(support.CreateInvoice.start(made.invoice, made.connection));
    fake.received = [];
    const run = await kit.Run.latestFor(made.invoice, "create_invoice");
    return { ...made, run };
  }

  function retry(run, account) {
    return form(`/qube/runs/${run.id}/retry_start`, {}, account, { Referer: `/invoices/${run.recordId}` });
  }

  it("POST /qube/runs/:id/retry_start resends the start with its reference, keeps QuBe Sync's answer and goes back with 303", async () => {
    reset();
    const { account, run } = await unconfirmed();
    answer(data({ id: "run-q-1", state: "running" }, 201));
    const res = await request(app(), retry(run, account));
    assert.deepStrictEqual([res.status, res.headers.location], [303, `/invoices/${run.recordId}`]);
    assert.strictEqual(fake.received[0].headers["idempotency-key"], run.reference);
    const after = await reload(run);
    assert.deepStrictEqual([after.qubeRunId, after.state], ["run-q-1", "running"]);
  });

  it("goes back with the run failed when QuBe Sync refuses it, or still unconfirmed when there's no answer", async () => {
    reset();
    const { account, run } = await unconfirmed();
    answer(apiError(500, "again"));
    assert.strictEqual((await request(app(), retry(run, account))).status, 303);
    assert.strictEqual((await reload(run)).state, "starting");
    assert.match(loggedText(), new RegExp(`run ${run.id}'s start retry didn't go through \\(APIError\\)`));
    answer(apiError(422, { code: "invalid_input" }));
    assert.strictEqual((await request(app(), retry(run, account))).status, 303);
    assert.strictEqual((await reload(run)).state, "failed");
  });

  it("answers 409 for a run that isn't starting", async () => {
    reset();
    const { account, run } = await fixtures();
    const res = await request(app(), retry(run, account));
    assert.deepStrictEqual([res.status, res.text], [409, kit.NOT_STARTING]);
    assert.strictEqual(fake.received.length, 0);
  });

  it("answers 404 for another account's run, logged, or one that isn't there, and sends nothing", async () => {
    reset();
    const { run } = await unconfirmed();
    const other = tables.Account.add();
    assert.strictEqual((await request(app(), retry(run, other))).status, 404);
    assert.match(loggedText(), new RegExp(`refused a start retry for run ${run.id}: authorizeQuestion said no`));
    assert.strictEqual((await request(app(), form("/qube/runs/999/retry_start", {}, other))).status, 404);
    assert.strictEqual(fake.received.length, 0);
  });

  it("is behind the app's sign-in", async () => {
    reset();
    const { run } = await unconfirmed();
    assert.strictEqual((await request(app(), retry(run, null))).status, 401);
  });
});

describe("express: mounting", () => {
  it("serves the routes relative to where they're mounted, and passes settings to configure", async () => {
    reset();
    const account = tables.Account.add();
    const made = express();
    made.use("/app", qube.webhooks({ enqueue: () => {} }));
    made.use((req, res, next) => {
      req.account = account;
      next();
    });
    made.use("/app", qube.connect(kit.settings()));
    answer(data({ id: "q-1", links: { onboarding: "https://qubesync.com/onboard/q-1" } }, 201));
    const res = await request(made, form("/app/quickbooks/connections", {}, account));
    assert.strictEqual(res.status, 303);
    assert.throws(() => qube.questions("nope"), /questions\(options\) takes an object/);
  });
});
