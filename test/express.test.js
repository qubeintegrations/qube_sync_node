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

// The message a route sent the user back with, from its one-shot cookie, or null.
function errorCookie(res) {
  const cookies = [].concat(res.headers["set-cookie"] || []);
  const found = cookies.find((cookie) => cookie.startsWith("qube_error="));
  return found ? decodeURIComponent(found.split(";")[0].slice("qube_error=".length)) : null;
}

// Back to the page with that message.
function assertBackWith(res, message, location) {
  assert.strictEqual(res.status, 303);
  if (location) assert.strictEqual(res.headers.location, location);
  assert.strictEqual(errorCookie(res), message);
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

  it("POST /webhooks/qube/requests/:id verifies a plain request's delivery, enqueues it and answers 200", async () => {
    const deliveries = [];
    reset({ enqueue: (delivery) => deliveries.push(delivery) });
    const account = tables.Account.add();
    const connection = await makeConnection(account);
    const customer = tables.Customer.add({ name: "Northwind Builders" });
    const row = await kit.settings().store.createRequest({
      connectionId: connection.id,
      operation: "find_customer",
      recordType: "Customer",
      recordId: String(customer.id),
      reference: "find_customer-1-1",
    });
    const body = vectorBody("request: a page of a paginated query");
    const res = await request(app(), signedPost(`/webhooks/qube/requests/${row.id}`, body));
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(deliveries, [{ kind: "request", id: String(row.id), body }]);
    assert.strictEqual((await request(app(), signedPost(`/webhooks/qube/requests/${row.id}`, body, { "X-Qube-Signature": "t=1,v1=00" }))).status, 401);
  });

  it("answers 404 for a row that isn't there, once the signature checks out, and checks the signature first", async () => {
    const deliveries = [];
    reset({ enqueue: (delivery) => deliveries.push(delivery) });
    const body = vectorBody("workflow_run.completed");
    for (const path of ["/webhooks/qube/runs/999", "/webhooks/qube/runs/abc", "/webhooks/qube/connections/999", "/webhooks/qube/requests/999"]) {
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
        assert.strictEqual(logged()[logged().length - 1].text, `QuBe Sync: refused a webhook: ${reason} (${path}): ${kit.SIGNATURE_HINTS[reason]}`);
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
      ["POST", "/api/v2/connections", { webhook_url: `${WEBHOOK_URL}/connections/${connection.id}`, name: "Main file", type: "realtime" }],
    ]);
  });

  it("makes a standard connection when connectionType says so, and refuses any other type", async () => {
    reset({ connectionType: "standard" });
    const account = tables.Account.add();
    answer(onboarding());
    const res = await request(app(), form("/quickbooks/connections", {}, account));
    assert.strictEqual(res.status, 303);
    assert.strictEqual(fake.received[0].body.type, "standard");
    assert.throws(() => kit.configure({ connectionType: "fast" }), /connectionType is "realtime" or "standard"/);
  });

  it("with simulated=1 makes a simulated connection on a new row and goes back to the page, even with one waiting", async () => {
    reset();
    const account = tables.Account.add();
    await makeConnection(account, { qubeId: "q-waiting", status: "pending" });
    answer(data({ id: "conn-sim-1", type: "simulated", links: {} }, 201));
    const res = await request(app(), form("/quickbooks/connections", { simulated: "1", name: "Test file" }, account, { Referer: "/account" }));
    assert.deepStrictEqual([res.status, res.headers.location], [303, "/account"]);
    const [made] = await kit.Connection.ownedBy(account);
    assert.deepStrictEqual([made.qubeId, made.name], ["conn-sim-1", "Test file"]);
    assert.deepStrictEqual(fake.received.map((r) => [r.method, r.path, r.body]), [
      ["POST", "/api/v2/connections", { webhook_url: `${WEBHOOK_URL}/connections/${made.id}`, name: "Test file", type: "simulated" }],
    ]);
  });

  it("answers 404 for simulated=1 in production, asking QuBe Sync nothing", async () => {
    reset();
    const account = tables.Account.add();
    const before = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const res = await request(app(), form("/quickbooks/connections", { simulated: "1" }, account));
      assert.strictEqual(res.status, 404);
    } finally {
      if (before === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = before;
    }
    assert.strictEqual(fake.received.length, 0);
    assert.deepStrictEqual(await kit.Connection.ownedBy(account), []);
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
    const onboarding = await request(app(), form("/quickbooks/connections/1/onboarding", {}, tables.Account.add()));
    assert.strictEqual(onboarding.status, 500);
    assert.match(onboarding.text, /currentAccount isn't set yet/);
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
    assert.deepStrictEqual(fake.received[1].body, { webhook_url: connection.webhookUrl(), name: "Main", type: "realtime" });
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

describe("express: disconnect", () => {
  it("DELETE /quickbooks/connections/:id deletes QuBe Sync's connection, then the row, and goes back", async () => {
    reset();
    const { account, connection, run } = await fixtures();
    await run.update({ state: "completed" });
    answer({ status: 204 });
    const res = await request(app(), { method: "DELETE", path: `/quickbooks/connections/${connection.id}`, headers: { "X-Test-Account": String(account.id), Referer: "/settings" } });
    assert.strictEqual(res.status, 303);
    assert.strictEqual(res.headers.location, "/settings");
    assert.deepStrictEqual([fake.received[0].method, fake.received[0].path], ["DELETE", `/api/v2/connections/${CONN}`]);
    assert.strictEqual(await kit.Connection.get(connection.id), null);
    assert.strictEqual(await kit.Run.get(run.id), null);
  });

  it("POST /quickbooks/connections/:id/disconnect does the same, for an HTML form", async () => {
    reset();
    const { account, connection, run } = await fixtures();
    await run.update({ state: "failed" });
    answer({ status: 204 });
    const res = await request(app(), form(`/quickbooks/connections/${connection.id}/disconnect`, {}, account));
    assert.strictEqual(res.status, 303);
    assert.strictEqual(await kit.Connection.get(connection.id), null);
  });

  it("goes back saying why while a run hasn't ended, or when QuBe Sync doesn't answer", async () => {
    reset();
    const { account, connection, run } = await fixtures();
    let res = await request(app(), form(`/quickbooks/connections/${connection.id}/disconnect`, {}, account));
    assertBackWith(res, kit.t(kit.RUNS_GOING));
    assert.strictEqual(fake.received.length, 0);
    await run.update({ state: "completed" });
    answer({ destroy: true });
    res = await request(app(), form(`/quickbooks/connections/${connection.id}/disconnect`, {}, account));
    assertBackWith(res, kit.t(kit.DISCONNECT_NO_ANSWER));
    assert.ok(await kit.Connection.get(connection.id));
  });

  it("answers 404 for another account's connection, and is behind the app's sign-in", async () => {
    reset();
    const { connection } = await fixtures();
    const other = tables.Account.add();
    for (const id of [connection.id, 999, "abc"]) {
      const res = await request(app(), { method: "DELETE", path: `/quickbooks/connections/${id}`, headers: { "X-Test-Account": String(other.id) } });
      assert.strictEqual(res.status, 404, String(id));
    }
    assert.strictEqual((await request(app(), { method: "DELETE", path: `/quickbooks/connections/${connection.id}` })).status, 401);
    assert.strictEqual(fake.received.length, 0);
    assert.ok(await kit.Connection.get(connection.id));
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

  it("POST /qube/questions/runs/:id posts a rows field as each row's filled, asked columns, by row key", async () => {
    reset();
    const { account, run } = await asking();
    const rows = {
      id: "proceed",
      label: "Create or use these",
      fields: [
        {
          name: "records",
          type: "rows",
          columns: [
            { name: "action", type: "string" },
            { name: "list_id", type: "record" },
            { name: "item_type", type: "string" },
            { name: "income_account", type: "record" },
            { name: "asset_account", type: "record" },
          ],
          rows: [
            { key: "customer_ref", columns: ["action", "list_id"] },
            { key: "invoice_line_add.0.item_ref", columns: ["action", "list_id", "item_type", "income_account", "asset_account"] },
            { key: "invoice_line_add.1.item_ref", columns: ["action", "list_id", "income_account"], values: { item_type: "item_non_inventory" } },
          ],
        },
      ],
    };
    await run.update({ question: { ...question, choices: [...question.choices, rows] } });
    answer(data({ state: "running" }));
    const res = await request(
      app(),
      answerForm(
        run,
        {
          choice: "proceed",
          "data[records][customer_ref][action]": "use",
          "data[records][customer_ref][list_id]": "80000001-1",
          "data[records][customer_ref][item_type]": "item_service",
          "data[records][invoice_line_add.0.item_ref][action]": "create",
          "data[records][invoice_line_add.0.item_ref][list_id]": "",
          "data[records][invoice_line_add.0.item_ref][item_type]": "item_inventory",
          "data[records][invoice_line_add.0.item_ref][income_account]": "8000000A-1",
          "data[records][invoice_line_add.0.item_ref][asset_account]": "80000005-1",
          "data[records][invoice_line_add.1.item_ref][action]": "create",
          "data[records][invoice_line_add.1.item_ref][income_account]": "8000000A-1",
        },
        account
      )
    );
    assert.strictEqual(res.status, 303);
    assert.deepStrictEqual(fake.received[0].body, {
      choice: "proceed",
      data: {
        records: {
          customer_ref: { action: "use", list_id: "80000001-1" },
          "invoice_line_add.0.item_ref": { action: "create", item_type: "item_inventory", income_account: "8000000A-1", asset_account: "80000005-1" },
          "invoice_line_add.1.item_ref": { action: "create", income_account: "8000000A-1" },
        },
      },
    });
  });

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
    const after = await reload(run);
    assert.strictEqual(after.question, null);
    // Running again at once, not waiting on an answer until the Web Connector next polls.
    assert.strictEqual(after.state, "running");
    assert.strictEqual((await kit.SyncStatus.latest(tables.Invoice.find(run.recordId), "create_invoice")).status, "sending");
  });

  it("sends an unticked checkbox as false, and a number it can't read as typed", async () => {
    reset();
    const { account, run } = await asking();
    answer(data({}));
    await request(app(), answerForm(run, { choice: "add", "data[count]": "three" }, account));
    assert.deepStrictEqual(fake.received[0].body.data, { count: "three", taxable: false });
  });

  it("goes back saying the question changed for a choice it doesn't have, and for a run that has stopped asking", async () => {
    reset();
    const { account, run } = await asking();
    let res = await request(app(), answerForm(run, { choice: "nope" }, account));
    assertBackWith(res, kit.t(kit.QUESTION_CHANGED), `/invoices/${run.recordId}`);
    await run.update({ question: null, links: null });
    res = await request(app(), answerForm(run, { choice: "use:1" }, account));
    assertBackWith(res, kit.t(kit.QUESTION_CHANGED));
    assert.strictEqual(fake.received.length, 0);
  });

  it("forgets the question and goes back saying so when QuBe Sync says it was answered or asked again, or any other 400", async () => {
    for (const refusal of [apiError(409, { code: "conflict" }), apiError(400, { code: "not_awaiting_input" }), apiError(400, { code: "bad_request" })]) {
      reset();
      const { account, run } = await asking();
      answer(refusal);
      const res = await request(app(), answerForm(run, { choice: "use:1" }, account));
      assertBackWith(res, kit.t(kit.QUESTION_CHANGED));
      const after = await reload(run);
      assert.strictEqual(after.question, null);
      assert.strictEqual(after.state, "awaiting_input"); // a changed question leaves the state alone
    }
  });

  it("keeps the question and says why for a 422, and raises for anything else QuBe Sync answers", async () => {
    reset();
    const { account, run } = await asking();
    answer(apiError(422, { code: "invalid", detail: "count must be whole" }));
    let res = await request(app(), answerForm(run, { choice: "add", "data[count]": "1.5" }, account));
    assertBackWith(res, "That answer couldn't be used: count must be whole");
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

  it("raises naming the config file when authorizeQuestion is left to its default and currentAccount isn't set", async () => {
    reset();
    const { account, run } = await asking();
    kit.configure({ currentAccount: null });
    const expected = /currentAccount isn't set yet.*quickbooks-desktop\/config/;
    const res = await request(app(), answerForm(run, { choice: "use:1" }, account));
    assert.strictEqual(res.status, 500);
    assert.match(res.text, expected);
    const search = await request(app(), { path: `/qube/questions/runs/${run.id}/search?field=customer&q=Riv`, headers: { "X-Test-Account": String(account.id) } });
    assert.strictEqual(search.status, 500);
    assert.match(search.text, expected);
    await run.update({ state: "starting" });
    const retried = await request(app(), form(`/qube/runs/${run.id}/retry_start`, {}, account));
    assert.strictEqual(retried.status, 500);
    assert.match(retried.text, expected);
    assert.strictEqual(fake.received.length, 0);
    kit.configure({ authorizeQuestion: () => true });
    await run.update({ state: "awaiting_input" });
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

    it("passes a rows field's row on, and drops one over 200 characters", async () => {
      reset();
      const { account, run } = await asking();
      answer(data([]));
      answer(data([]));
      let res = await request(app(), search(run, { field: "records.list_id", q: "lone", row: "customer_ref" }, account));
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual([fake.received[0].query.field, fake.received[0].query.q, fake.received[0].query.row], ["records.list_id", "lone", "customer_ref"]);
      res = await request(app(), search(run, { field: "records.list_id", q: "lone", row: "r".repeat(201) }, account));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(fake.received[1].query.row, undefined);
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
    const account = tables.Account.add({ name: "Riverbend" });
    const connection = await makeConnection(account);
    const invoice = tables.Invoice.add({ accountId: account.id, number: "1001" });
    const made = { account, connection, invoice };
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

  it("goes back saying so for a run that isn't starting", async () => {
    reset();
    const { account, run } = await fixtures();
    const res = await request(app(), retry(run, account));
    assertBackWith(res, kit.t(kit.NOT_STARTING), `/invoices/${run.recordId}`);
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

describe("express: redeliver", () => {
  // A confirmed run gone quiet: QUIET_AFTER_SECONDS is 0 for the test, and a moment has passed.
  async function stuck(changes = {}) {
    const made = await fixtures();
    await made.run.update({ qubeRunId: "run-q-1", state: "running", ...changes });
    kit.Run.QUIET_AFTER_SECONDS = 0;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return { ...made, run: await reload(made.run) };
  }

  function redeliver(run, account) {
    return form(`/qube/runs/${run.id}/redeliver`, {}, account, { Referer: `/invoices/${run.recordId}` });
  }

  async function quietly(fn) {
    const quiet = kit.Run.QUIET_AFTER_SECONDS;
    try {
      await fn();
    } finally {
      kit.Run.QUIET_AFTER_SECONDS = quiet;
    }
  }

  it("POST /qube/runs/:id/redeliver asks QuBe Sync to send a stuck run's latest event again, and goes back", async () =>
    quietly(async () => {
      reset();
      const { account, run } = await stuck();
      answer(data({ run_id: "run-q-1", event: "workflow_run.awaiting_input", revision: 3, webhook_url: run.webhookUrl() }));
      const res = await request(app(), redeliver(run, account));
      assertBackWith(res, null, `/invoices/${run.recordId}`);
      assert.deepStrictEqual(fake.received.map((r) => [r.method, r.path]), [["POST", `/api/v2/connections/${CONN}/workflow-runs/run-q-1/redeliver`]]);
    }));

  it("takes a run awaiting a question it never received, and refuses one with its question or not quiet", async () =>
    quietly(async () => {
      reset();
      const { account, run } = await stuck({ state: "awaiting_input" });
      answer(data({ run_id: "run-q-1" }));
      assertBackWith(await request(app(), redeliver(run, account)), null);
      await run.update({ question: { token: "t", choices: [] } });
      assertBackWith(await request(app(), redeliver(run, account)), kit.t(kit.NOT_QUIET));
      await run.update({ question: null });
      kit.Run.QUIET_AFTER_SECONDS = 600;
      assertBackWith(await request(app(), redeliver(run, account)), kit.t(kit.NOT_QUIET));
      assert.strictEqual(fake.received.length, 1);
    }));

  it("goes back saying why for QuBe Sync's 409 and 429, and for no answer; raises for anything else", async () =>
    quietly(async () => {
      reset();
      const { account, run } = await stuck();
      answer(apiError(409, { code: "nothing_to_redeliver" }));
      assertBackWith(await request(app(), redeliver(run, account)), kit.t(kit.REDELIVERY_REFUSED[409]));
      answer(apiError(429, { code: "rate_limited" }));
      assertBackWith(await request(app(), redeliver(run, account)), kit.t(kit.REDELIVERY_REFUSED[429]));
      answer({ destroy: true });
      assertBackWith(await request(app(), redeliver(run, account)), kit.t(kit.NO_ANSWER));
      answer(apiError(500, "boom"));
      assert.strictEqual((await request(app(), redeliver(run, account))).status, 500);
    }));

  it("answers 404 for another account's run, and is behind the app's sign-in", async () =>
    quietly(async () => {
      reset();
      const { run } = await stuck();
      const other = tables.Account.add();
      assert.strictEqual((await request(app(), redeliver(run, other))).status, 404);
      assert.match(loggedText(), new RegExp(`refused a redelivery for run ${run.id}: authorizeQuestion said no`));
      assert.strictEqual((await request(app(), redeliver(run, null))).status, 401);
      assert.strictEqual(fake.received.length, 0);
    }));
});

describe("express: takeError", () => {
  // The record's page: the message once, through the kit's HTML.
  function page(made) {
    made.get("/invoices/:id", (req, res) => res.type("text/html").send(kit.renderRunStatus(null, { error: qube.takeError(req, res) })));
    return made;
  }

  it("shows the message a route went back with once, from a cookie", async () => {
    reset();
    const { account, run } = await fixtures();
    const made = app();
    const back = await request(made, form(`/qube/runs/${run.id}/retry_start`, {}, account, { Referer: `/invoices/${run.recordId}` }));
    const cookie = back.headers["set-cookie"][0].split(";")[0];
    assert.match(back.headers["set-cookie"][0], /Path=\/; .*HttpOnly; SameSite=Lax/);
    const shown = await request(page(express()), { path: `/invoices/${run.recordId}`, headers: { cookie } });
    assert.strictEqual(shown.text, `<p class="qube-error" role="alert">${kit.escapeHtml(kit.t(kit.NOT_STARTING))}</p>`);
    assert.match(shown.headers["set-cookie"][0], /^qube_error=; .*Expires=Thu, 01 Jan 1970/);
    const again = await request(page(express()), { path: `/invoices/${run.recordId}` });
    assert.strictEqual(again.text, "");
  });

  it("keeps it in the session when there is one, and in req.flash when there's that", async () => {
    reset();
    const { account, run } = await fixtures();
    const session = {};
    const flashed = [];
    for (const middleware of [
      (req, res, next) => ((req.session = session), next()),
      (req, res, next) => ((req.flash = (key, value) => (value === undefined ? flashed.splice(0).map((f) => f[1]) : flashed.push([key, value]))), next()),
    ]) {
      const made = express();
      made.use(middleware);
      made.use((req, res, next) => ((req.account = account), next()));
      made.use(qube.questions());
      page(made);
      const back = await request(made, form(`/qube/runs/${run.id}/retry_start`, {}, account, { Referer: `/invoices/${run.recordId}` }));
      assert.strictEqual(back.status, 303);
      assert.strictEqual(back.headers["set-cookie"], undefined);
      const shown = await request(made, { path: `/invoices/${run.recordId}` });
      assert.ok(shown.text.includes(kit.escapeHtml(kit.t(kit.NOT_STARTING))));
      assert.strictEqual((await request(made, { path: `/invoices/${run.recordId}` })).text, "");
    }
    assert.deepStrictEqual(session, {});
  });
});

describe("express: redirectBack", () => {
  it("goes back to the page with the message for takeError", async () => {
    const made = express();
    made.post("/start", (req, res) => qube.redirectBack(req, res, "Connect first."));
    made.get("/invoices/1", (req, res) => res.type("text/html").send(kit.renderRunStatus(null, { error: qube.takeError(req, res) })));
    const back = await request(made, { method: "POST", path: "/start", headers: { Referer: "/invoices/1" } });
    assert.strictEqual(back.status, 303);
    assert.strictEqual(back.headers.location, "/invoices/1");
    const cookie = back.headers["set-cookie"][0].split(";")[0];
    const shown = await request(made, { path: "/invoices/1", headers: { cookie } });
    assert.strictEqual(shown.text, '<p class="qube-error" role="alert">Connect first.</p>');
    made.post("/fine", (req, res) => qube.redirectBack(req, res));
    const fine = await request(made, { method: "POST", path: "/fine", headers: { Referer: "https://elsewhere.example/x" } });
    assert.strictEqual(fine.headers.location, "/");
    assert.strictEqual(fine.headers["set-cookie"], undefined);
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
