"use strict";

// qubesync/kit without a framework: the settings, connections and their QuickBooks ids,
// adoption, the job for a run's and a connection's events, starting and retrying a run, the run's
// status, and the HTML. The routes are test/express.test.js's; the store's own part is
// test/store.test.js's.

const { describe, it: nodeIt } = require("node:test");
const assert = require("node:assert");
const util = require("node:util");

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
  calls,
  CreateInvoice,
  SyncCustomer,
  Events,
  reset,
  makeConnection,
  makeRun,
  reload,
  vectorBody,
  runBody,
  qubeConnectionFor,
  API_KEY,
  SECRET,
  CONN,
  WEBHOOK_URL,
} = support;

const it = (name, fn) => support.it(nodeIt, name, fn);

// The fixtures most tests start from: an account, its connection, an invoice and a run of it.
async function fixtures() {
  const account = tables.Account.add({ name: "Riverbend" });
  const connection = await makeConnection(account);
  const invoice = tables.Invoice.add({ accountId: account.id, number: "1001" });
  const run = await makeRun(invoice, connection);
  return { account, connection, invoice, run };
}

// An account's connection and an invoice with no run yet.
async function unsent() {
  const account = tables.Account.add({ name: "Riverbend" });
  const connection = await makeConnection(account);
  const invoice = tables.Invoice.add({ accountId: account.id, number: "1001" });
  return { account, connection, invoice };
}

// The job, as the queue runs it, for one of run's events; resolves to the run as it is after.
async function runEvent(run, name, changes = {}) {
  await kit.run({ kind: "run", id: String(run.id), body: runBody(name, run, changes) });
  return reload(run);
}

async function connectionEvent(connection, name, changes = {}) {
  await kit.run({ kind: "connection", id: String(connection.id), body: vectorBody(name, changes) });
  return kit.Connection.get(connection.id);
}

describe("kit: settings", () => {
  it("an unset setting throws NotConfigured, naming the config file", () => {
    kit.resetSettings();
    for (const key of ["store", "operations", "connectionEvents", "currentAccount"]) {
      assert.throws(
        () => kit.settings()[key],
        (err) => err instanceof kit.NotConfigured && err.message.includes(`${key} isn't set yet`) && err.message.includes("quickbooks-desktop/config")
      );
    }
  });

  it("the secrets and URLs come from the environment at first use, and say where to set them", () => {
    kit.resetSettings();
    const saved = { ...process.env };
    try {
      delete process.env.QUBE_API_KEY;
      delete process.env.QUBE_WEBHOOK_SECRET;
      delete process.env.QUBE_WEBHOOK_URL;
      delete process.env.QUBE_URL;
      assert.throws(() => kit.settings().apiKey, /Set QUBE_API_KEY in the environment, or apiKey with configure\(\.\.\.\) in your app's quickbooks-desktop\/config/);
      assert.throws(() => kit.settings().webhookSecret, /QUBE_WEBHOOK_SECRET/);
      assert.throws(() => kit.settings().webhookUrl, /QUBE_WEBHOOK_URL/);
      assert.strictEqual(kit.settings().baseUrl, "https://qubesync.com");
      process.env.QUBE_API_KEY = "sk_from_env";
      process.env.QUBE_URL = "https://staging.example.com";
      process.env.QUBE_WEBHOOK_URL = "https://app.example.com/webhooks/qube///";
      assert.strictEqual(kit.settings().apiKey, "sk_from_env");
      assert.strictEqual(kit.settings().baseUrl, "https://staging.example.com");
      assert.strictEqual(kit.settings().webhookUrl, "https://app.example.com/webhooks/qube");
    } finally {
      process.env = saved;
    }
  });

  it("has the defaults qube_rails has", () => {
    kit.resetSettings();
    assert.strictEqual(kit.settings().jobAttempts, 10);
    assert.strictEqual(kit.DEFAULT_JOB_ATTEMPTS, 10);
    assert.strictEqual(typeof kit.settings().authorizeQuestion, "function");
    assert.strictEqual(typeof kit.settings().enqueue, "function");
  });

  it("hides the secrets from inspection and JSON", () => {
    reset();
    const settings = kit.settings();
    const shown = [util.inspect(settings), JSON.stringify(settings), String(settings), util.inspect(kit.client())].join(" ");
    assert.ok(!shown.includes(API_KEY), shown);
    assert.ok(!shown.includes(SECRET), shown);
    assert.match(util.inspect(settings), /create_invoice/);
    assert.match(util.inspect(settings), /apiKey: '\[set\]'/);
  });

  it("checks what it's given", () => {
    reset();
    assert.throws(() => kit.configure({ authorizeQuestions: () => true }), /doesn't know the setting "authorizeQuestions"/);
    assert.throws(() => kit.configure({ operations: { invoice: CreateInvoice } }), /static slug is "create_invoice": they must match/);
    assert.throws(() => kit.configure({ operations: { create_invoice: class {} } }), /must be a class that extends Operation/);
    assert.throws(() => kit.configure({ connectionEvents: CreateInvoice }), /extends ConnectionEvents/);
    assert.throws(() => kit.configure({ store: { getRun() {} } }), /store is missing transaction, createConnection/);
    assert.throws(() => kit.configure({ jobAttempts: 0 }), /jobAttempts is a whole number of 1 or more/);
    assert.throws(() => kit.configure({ jobAttempts: 1.5 }), /jobAttempts/);
    assert.throws(() => kit.configure({ currentAccount: "me" }), /currentAccount must be a function/);
    assert.throws(() => kit.configure({ webhookSecret: [] }), /webhookSecret/);
    assert.throws(() => kit.configure({ pruneRunsAfter: kit.DAY_MS - 1 }), /pruneRunsAfter is null or milliseconds of a day or more/);
    assert.throws(() => kit.configure({ pruneRunsAfter: "90 days" }), /pruneRunsAfter/);
    class NoOperation extends kit.PlainRequest {
      static slug = "no_operation";
    }
    assert.throws(() => kit.configure({ operations: { no_operation: NoOperation } }), /needs a static operation/);
    // A Map works as well as an object, and a later configure keeps what it leaves out.
    kit.configure({ operations: new Map([["create_invoice", CreateInvoice]]), jobAttempts: 3 });
    assert.strictEqual(kit.settings().operationClass("create_invoice"), CreateInvoice);
    assert.strictEqual(kit.settings().operationClass("sync_customer"), null);
    assert.strictEqual(kit.settings().connectionEvents, Events);
    assert.strictEqual(kit.settings().jobAttempts, 3);
    // A plain request goes in the same map, and each lookup finds only its own kind.
    kit.configure({ operations: { create_invoice: CreateInvoice, find_customer: support.FindCustomer }, pruneRunsAfter: 30 * kit.DAY_MS });
    assert.strictEqual(kit.settings().requestClass("find_customer"), support.FindCustomer);
    assert.strictEqual(kit.settings().operationClass("find_customer"), null);
    assert.strictEqual(kit.settings().requestClass("create_invoice"), null);
    assert.strictEqual(kit.settings().pruneRunsAfter, 30 * kit.DAY_MS);
    kit.configure({ pruneRunsAfter: null });
    assert.strictEqual(kit.settings().pruneRunsAfter, null);
  });

  it("makes a new client when the settings change", () => {
    reset();
    const first = kit.client();
    assert.strictEqual(kit.client(), first);
    kit.configure({ baseUrl: "http://127.0.0.1:1" });
    assert.notStrictEqual(kit.client(), first);
    assert.strictEqual(kit.client().baseUrl, "http://127.0.0.1:1");
  });

  it("names a record's type by its class, or by the recordType setting, and refuses an unsaved one", () => {
    reset();
    const account = tables.Account.add();
    assert.deepStrictEqual(kit.recordKey(account), ["Account", "1"]);
    assert.throws(() => kit.recordKey({ id: 1 }), (err) => err instanceof kit.NotConfigured && /Set recordType/.test(err.message));
    assert.throws(() => kit.recordKey(new support.Account()), /has no id yet: save it first/);
    kit.configure({ recordType: (record) => record.model });
    assert.deepStrictEqual(kit.recordKey({ model: "Shop", id: "uuid-1" }), ["Shop", "uuid-1"]);
  });
});

describe("kit: Connection", () => {
  it("builds its webhook URL from the webhookUrl setting and its own id", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    assert.strictEqual(connection.webhookUrl(), `${WEBHOOK_URL}/connections/${connection.id}`);
  });

  it("is not checking in only when stalled for that reason", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    assert.strictEqual(connection.notCheckingIn(), false);
    await connection.update({ status: "stalled", stallReason: "quickbooks_unavailable" });
    assert.strictEqual(connection.notCheckingIn(), false);
    await connection.update({ stallReason: "not_checking_in" });
    assert.strictEqual(connection.notCheckingIn(), true);
    assert.strictEqual(connection.connected(), false);
  });

  it("lists an owner's connections, whatever its key's type", async () => {
    reset();
    const account = tables.Account.add();
    const first = await makeConnection(account, { qubeId: "q-1" });
    const second = await makeConnection(account, { qubeId: "q-2" });
    await makeConnection(tables.Account.add(), { qubeId: "q-3" });
    const listed = await kit.Connection.ownedBy(Object.assign(new support.Account(), { id: "1" }));
    assert.deepStrictEqual(listed.map((c) => c.id).sort(), [first.id, second.id].sort());
  });

  it("links a record's QuickBooks id by kind, and reads it back both ways, through findRecord", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    const customer = tables.Customer.add({ name: "Riverbend Electric" });
    const row = await connection.link(customer, { kind: "customer", qbId: "80000001-1738310400", editSequence: 171, name: "Riverbend Electric" });
    assert.deepStrictEqual([row.kind, row.list, row.qbId, row.editSequence, row.name], ["customer", "name", "80000001-1738310400", "171", "Riverbend Electric"]);
    assert.strictEqual(await connection.qbIdFor(customer, { kind: "customer" }), "80000001-1738310400");
    assert.strictEqual(await connection.findLinked("80000001-1738310400", { kind: "customer" }), customer);
    assert.strictEqual(await connection.findLinked("80000001-1738310400"), customer);
    assert.strictEqual(await connection.findLinked("nope"), null);
    assert.strictEqual((await connection.quickbooksRecord("80000001-1738310400", { kind: "vendor" })).kind, "customer");
  });

  it("moves a qbId between records, and logs it", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    const first = tables.Customer.add();
    const second = tables.Customer.add();
    await connection.link(first, { kind: "customer", qbId: "Q1" });
    await connection.link(second, { kind: "customer", qbId: "Q1" });
    assert.strictEqual(await connection.qbIdFor(first, { kind: "customer" }), null);
    assert.strictEqual(await connection.findLinked("Q1", { kind: "customer" }), second);
    assert.match(loggedText(), /warn QuBe Sync: connection \d+: customer Q1 moved from Customer 1 to Customer 2/);
  });

  it("replaces a record's id for a kind when it's linked again, and logs a replace that takes another row", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    const a = tables.Customer.add();
    const b = tables.Customer.add();
    await connection.link(a, { kind: "customer", qbId: "Q1" });
    await connection.link(a, { kind: "customer", qbId: "Q2", editSequence: "9" });
    assert.strictEqual(await connection.qbIdFor(a, { kind: "customer" }), "Q2");
    await connection.link(b, { kind: "customer", qbId: "Q3" });
    await connection.link(a, { kind: "customer", qbId: "Q3" });
    assert.match(loggedText(), /Customer 1's customer Q2 replaced by Q3/);
    assert.strictEqual(await connection.quickbooksRecord("Q2"), null);
  });

  it("finds an EntityRef's id with no kind, and asks for a kind when the id is in two families", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    const customer = tables.Customer.add();
    await connection.link(customer, { kind: "customer", qbId: "80000001-1" });
    assert.strictEqual(await connection.findLinked("80000001-1"), customer);
    await connection.link(tables.Invoice.add(), { kind: "account", qbId: "80000001-1" });
    await assert.rejects(connection.findLinked("80000001-1"), (err) => err instanceof TypeError && /linked as more than one kind \(account, customer\): pass kind/.test(err.message));
    assert.strictEqual(await connection.findLinked("80000001-1", { kind: "vendor" }), customer);
  });

  it("raises for qbIdFor when the family has several links and none is that kind", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    const item = tables.Customer.add();
    await connection.link(item, { kind: "item_service", qbId: "I1" });
    await connection.link(item, { kind: "item_inventory", qbId: "I2" });
    await assert.rejects(connection.qbIdFor(item, { kind: "item" }), /linked as more than one kind \(item_inventory, item_service\)/);
  });

  it("refuses a link without a qbId", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    await assert.rejects(connection.link(tables.Customer.add(), { kind: "customer", qbId: null }), /link needs a qbId/);
  });

  it("tries a link once more when another worker's write clashes with it", async () => {
    const store = reset();
    const connection = await makeConnection(tables.Account.add());
    const customer = tables.Customer.add();
    const real = store.createQuickbooksRecord.bind(store);
    let clashes = 0;
    // The first create finds the row another worker just wrote.
    store.transaction = ((transaction) =>
      function (fn) {
        return transaction.call(store, (tx) => {
          if (clashes === 0) {
            tx.createQuickbooksRecord = async (fields) => {
              clashes += 1;
              await real(fields);
              throw new kit.StoreConflict("taken");
            };
          }
          return fn(tx);
        });
      })(store.transaction);
    const row = await connection.link(customer, { kind: "customer", qbId: "Q1" });
    assert.strictEqual(clashes, 1);
    assert.strictEqual(row.qbId, "Q1");
  });

  it("finds its owner with the findRecord setting", async () => {
    reset();
    const account = tables.Account.add();
    const connection = await makeConnection(account);
    assert.strictEqual(await connection.owner(), account);
    kit.configure({ findRecord: null });
    await assert.rejects((await kit.Connection.get(connection.id)).owner(), (err) => err instanceof kit.NotConfigured && /findRecord isn't set yet/.test(err.message));
  });

  it("keeps two connections on one account apart: their runs and their links", async () => {
    reset();
    const account = tables.Account.add();
    const first = await makeConnection(account, { qubeId: "q-1" });
    const second = await makeConnection(account, { qubeId: "q-2" });
    const customer = tables.Customer.add();
    await first.link(customer, { kind: "customer", qbId: "Q1" });
    await second.link(customer, { kind: "customer", qbId: "Q9" });
    assert.strictEqual(await first.qbIdFor(customer, { kind: "customer" }), "Q1");
    assert.strictEqual(await second.qbIdFor(customer, { kind: "customer" }), "Q9");
    const invoice = tables.Invoice.add();
    const run = await makeRun(invoice, second);
    assert.strictEqual(run.connection.qubeId, "q-2");
  });
});

describe("kit: adopting QuBe Sync's connection for a row without a qubeId", () => {
  async function row(fields = {}) {
    reset();
    const made = await kit.Connection.create(tables.Account.add(), fields);
    return made;
  }

  it("adopts the one connection made for the row: its webhook URL, never connected, made after it", async () => {
    const connection = await row();
    answer(data([qubeConnectionFor(connection)]));
    assert.strictEqual(await connection.adoptQubeConnection(), "conn-q-lost");
    assert.strictEqual((await kit.Connection.get(connection.id)).qubeId, "conn-q-lost");
    assert.deepStrictEqual([fake.received[0].method, fake.received[0].path], ["GET", "/api/v2/connections"]);
  });

  it("skips a connection made before the row (a row id used again)", async () => {
    const connection = await row();
    answer(data([qubeConnectionFor(connection, { created_at: new Date(Date.now() - 3600 * 1000).toISOString() })]));
    assert.strictEqual(await connection.adoptQubeConnection(), null);
    assert.strictEqual(connection.qubeId, null);
  });

  it("allows five minutes of clock difference", async () => {
    const connection = await row();
    answer(data([qubeConnectionFor(connection, { created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString() })]));
    assert.strictEqual(await connection.adoptQubeConnection(), "conn-q-lost");
  });

  it("never adopts a connection with no created_at (an older server), and logs it", async () => {
    const connection = await row();
    answer(data([qubeConnectionFor(connection, { created_at: null })]));
    assert.strictEqual(await connection.adoptQubeConnection(), null);
    assert.match(loggedText(), /carry no created_at, so none is adopted/);
  });

  it("skips a standard connection that has connected", async () => {
    const connection = await row();
    answer(data([qubeConnectionFor(connection, { type: "standard", last_connected_at: "2026-10-25T12:00:00Z" })]));
    assert.strictEqual(await connection.adoptQubeConnection(), null);
  });

  it("adopts a simulated connection, which has a last_connected_at from the moment it's made", async () => {
    const connection = await row();
    answer(data([qubeConnectionFor(connection, { type: "simulated", last_connected_at: new Date().toISOString() })]));
    assert.strictEqual(await connection.adoptQubeConnection(), "conn-q-lost");
    assert.strictEqual((await kit.Connection.get(connection.id)).qubeId, "conn-q-lost");
  });

  it("skips one whose name isn't the row's, and takes any name when the row has none", async () => {
    let connection = await row({ name: "Second file" });
    answer(data([qubeConnectionFor(connection, { name: "Other file" })]));
    assert.strictEqual(await connection.adoptQubeConnection(), null);
    connection = await row();
    answer(data([qubeConnectionFor(connection, { name: "Any file" })]));
    assert.strictEqual(await connection.adoptQubeConnection(), "conn-q-lost");
  });

  it("skips one with another webhook URL, and matches one written with a trailing slash", async () => {
    let connection = await row();
    answer(data([qubeConnectionFor(connection, { webhook_url: "https://elsewhere.example/webhooks/qube/connections/1" })]));
    assert.strictEqual(await connection.adoptQubeConnection(), null);
    connection = await row();
    answer(data([qubeConnectionFor(connection, { webhook_url: `${connection.webhookUrl()}/` })]));
    assert.strictEqual(await connection.adoptQubeConnection(), "conn-q-lost");
  });

  it("adopts none, and says so, when two could be the row's", async () => {
    const connection = await row();
    answer(data([qubeConnectionFor(connection), qubeConnectionFor(connection, { id: "conn-q-2" })]));
    assert.strictEqual(await connection.adoptQubeConnection(), null);
    assert.match(loggedText(), /has no qube_id and 2 of QuBe Sync's connections could be its; adopted none/);
  });

  it("asks nothing for a row that has its qubeId", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    assert.strictEqual(await connection.adoptQubeConnection(), CONN);
    assert.strictEqual(fake.received.length, 0);
  });
});

describe("kit: a connection's events", () => {
  it("applies each of the four events to the row, then hands it to the app's class with its owner", async () => {
    reset();
    const account = tables.Account.add();
    const connection = await makeConnection(account, { status: "pending" });
    let row = await connectionEvent(connection, "connection.connected", { revision: 1 });
    assert.deepStrictEqual([row.status, row.revision], ["connected", 1]);
    row = await connectionEvent(connection, "connection.stalled", { revision: 2 });
    assert.deepStrictEqual([row.status, row.stallReason], ["stalled", "not_checking_in"]);
    row = await connectionEvent(connection, "connection.resumed", { revision: 3 });
    assert.deepStrictEqual([row.status, row.stallReason], ["connected", null]);
    row = await connectionEvent(connection, "connection.setup_cancelled", { revision: 4 });
    assert.strictEqual(row.status, "setup_cancelled");
    assert.deepStrictEqual(calls, [
      ["connected", connection.id, account.id, "connected"],
      ["stalled", connection.id, account.id, "not_checking_in"],
      ["resumed", connection.id, account.id, null],
      ["setupCancelled", connection.id, account.id, "setup_cancelled"],
    ]);
  });

  it("skips an event whose connection id isn't the row's qubeId, and one that isn't a connection's", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add(), { qubeId: "someone-elses" });
    const row = await connectionEvent(connection, "connection.connected");
    assert.strictEqual(row.revision, null);
    await connectionEvent(connection, "workflow_run.completed");
    assert.deepStrictEqual(calls, []);
    assert.match(loggedText(), new RegExp(`skipped connection.connected for "${CONN}": not this connection`));
    assert.match(loggedText(), /skipped workflow_run.completed for null: not this connection/);
  });

  it("applies an event only when it's newer than the last applied", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    await connectionEvent(connection, "connection.resumed", { revision: 5 });
    await connectionEvent(connection, "connection.stalled", { revision: 4 }); // late
    await connectionEvent(connection, "connection.resumed", { revision: 5 }); // a retry
    assert.deepStrictEqual(calls.map((c) => c[0]), ["resumed"]);
    assert.strictEqual((await kit.Connection.get(connection.id)).status, "connected");
  });

  it("throws NotReady for a row with no qubeId that QuBe Sync has no connection for, and the job retries it", async () => {
    reset();
    const connection = await kit.Connection.create(tables.Account.add());
    answer(data([]));
    await assert.rejects(connectionEvent(connection, "connection.connected"), (err) => err instanceof kit.NotReady && /has no qubeId yet/.test(err.message));
    kit.configure({ jobAttempts: 2 });
    const waits = [];
    answer(data([]), data([qubeConnectionFor(connection, { id: CONN })]));
    await kit.job({ kind: "connection", id: String(connection.id), body: vectorBody("connection.connected") }, { sleep: async (ms) => waits.push(ms) });
    assert.deepStrictEqual(waits, [kit.retryWait(1)]);
    assert.strictEqual((await kit.Connection.get(connection.id)).status, "connected");
  });

  it("adopts QuBe Sync's connection made with the row's webhook URL, then applies the event", async () => {
    reset();
    const connection = await kit.Connection.create(tables.Account.add());
    answer(data([qubeConnectionFor(connection, { id: CONN })]));
    const row = await connectionEvent(connection, "connection.connected");
    assert.deepStrictEqual([row.qubeId, row.status], [CONN, "connected"]);
    assert.strictEqual(calls.length, 1);
  });

  it("saves what the handler wrote with the revision, or neither when it throws", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    kit.configure({
      connectionEvents: class extends kit.ConnectionEvents {
        async connected() {
          this.connection.name = "Renamed";
          await this.connection.link(tables.Customer.add(), { kind: "customer", qbId: "Q1" });
          throw new Error("handler");
        }
      },
    });
    await assert.rejects(connectionEvent(connection, "connection.connected", { revision: 1 }), /handler/);
    const row = await kit.Connection.get(connection.id);
    assert.deepStrictEqual([row.revision, row.name], [null, null]);
    assert.strictEqual(await row.quickbooksRecord("Q1"), null);
  });

  it("throws naming the config file when connectionEvents isn't set", async () => {
    reset();
    const connection = await makeConnection(tables.Account.add());
    kit.configure({ connectionEvents: null });
    await assert.rejects(connectionEvent(connection, "connection.connected"), (err) => err instanceof kit.NotConfigured && /connectionEvents isn't set yet/.test(err.message));
  });

  it("logs in the base handlers, a stall as a warning", async () => {
    reset({ connectionEvents: class Plain extends kit.ConnectionEvents {} });
    const connection = await makeConnection(tables.Account.add());
    await connectionEvent(connection, "connection.connected", { revision: 1 });
    await connectionEvent(connection, "connection.stalled", { revision: 2 });
    assert.ok(logged().some((l) => l.level === "log" && /connection \d+: connection.connected \(revision 1\)/.test(l.text)));
    assert.ok(logged().some((l) => l.level === "warn" && /connection \d+: connection.stalled \(revision 2\)/.test(l.text)));
  });
});

describe("kit: a run's events", () => {
  it("hands a completed run to ended with the record, the run and its connection, and keeps the ending on the run", async () => {
    reset();
    const { connection, invoice, run } = await fixtures();
    const after = await runEvent(run, "workflow_run.completed", { revision: 4 });
    assert.deepStrictEqual(calls, [["ended", "used_existing", run.id, connection.id]]);
    assert.strictEqual(invoice.status, "sent");
    assert.deepStrictEqual([after.revision, after.state, after.outcome], [4, "completed", "used_existing"]);
    assert.ok(after.endedAt instanceof Date);
  });

  it("hands a failed or cancelled run to failed, keeping its error and its reason", async () => {
    reset();
    const { run } = await fixtures();
    let after = await runEvent(run, "workflow_run.failed", { revision: 2 });
    assert.strictEqual(after.error, JSON.parse(vectorBody("workflow_run.failed")).error);
    after = await runEvent(run, "workflow_run.cancelled", { revision: 3 });
    assert.deepStrictEqual(calls, [["failed", "workflow_run.failed"], ["failed", "workflow_run.cancelled"]]);
    assert.deepStrictEqual([after.state, after.cancelReason], ["cancelled", "The customer was merged in our CRM."]);
  });

  it("keeps an error that's a code, message and detail as the event carried it", async () => {
    reset();
    const { run } = await fixtures();
    const error = { code: "customer_not_found", message: "Customer not found", detail: "No customer named Riverbend" };
    const after = await runEvent(run, "workflow_run.failed", { revision: 1, error });
    assert.deepStrictEqual(after.error, error);
    assert.strictEqual(after.summaryText(), "Failed: Customer not found");
    assert.strictEqual(after.errorDetail(), "No customer named Riverbend");
  });

  it("keeps an ending even when the app's handler writes nothing", async () => {
    reset();
    const { connection } = await fixtures();
    const customer = tables.Customer.add({ name: "Riverbend Electric" });
    const sync = await makeRun(customer, connection, { operation: "sync_customer" });
    const after = await runEvent(sync, "workflow_run.failed", { revision: 1 });
    assert.deepStrictEqual([after.state, after.summaryText().startsWith("Failed: Five renames")], ["failed", true]);
    assert.ok(logged().some((l) => l.level === "warn" && /SyncCustomer 1 \(run \d+\): workflow_run.failed/.test(l.text)));
  });

  it("skips an event whose reference isn't the run's, or whose connection_id isn't its connection's, or that has none", async () => {
    reset();
    const { run } = await fixtures();
    let after = await runEvent(run, "workflow_run.completed", { reference: "create_invoice-1-earlier", revision: 9 });
    assert.strictEqual(after.revision, 0);
    assert.match(loggedText(), /skipped workflow_run.completed for "create_invoice-1-earlier" on ".*": not this run/);
    after = await runEvent(run, "workflow_run.completed", { connection_id: "someone-elses", revision: 9 });
    assert.match(loggedText(), /on "someone-elses": not this run/);
    after = await runEvent(run, "connection.connected", { reference: null });
    assert.strictEqual(after.revision, 0);
    assert.deepStrictEqual(calls, []);
  });

  it("applies an event only when it's newer than the last applied", async () => {
    reset();
    const { run } = await fixtures();
    await runEvent(run, "workflow_run.failed", { revision: 5 });
    await runEvent(run, "workflow_run.completed", { revision: 3 }); // an older one, late
    const after = await runEvent(run, "workflow_run.failed", { revision: 5 }); // a retry
    assert.deepStrictEqual(calls, [["failed", "workflow_run.failed"]]);
    assert.strictEqual(after.revision, 5);
  });

  it("takes a notification once by its delivery_id, whatever its revision", async () => {
    reset();
    const { run } = await fixtures();
    await runEvent(run, "workflow_run.notification", { revision: 2 });
    await runEvent(run, "workflow_run.notification", { revision: 2 }); // a retry
    const after = await runEvent(run, "workflow_run.notification", { revision: 1, delivery_id: "d-2" });
    assert.deepStrictEqual(calls, [["notification", "0196a1c0-0000-7000-8000-00000000d001"], ["notification", "d-2"]]);
    assert.strictEqual(after.revision, 0);
  });

  it("leaves a notification untaken when its handler throws, so the redelivery runs it, and keeps two runs' ids apart", async () => {
    reset();
    const { connection, invoice, run } = await fixtures();
    let fail = true;
    const original = CreateInvoice.prototype.notification;
    CreateInvoice.prototype.notification = async function (event) {
      if (fail) throw new Error("handler");
      return original.call(this, event);
    };
    try {
      await assert.rejects(runEvent(run, "workflow_run.notification"), /handler/);
      fail = false;
      await runEvent(run, "workflow_run.notification");
      const other = await makeRun(invoice, connection);
      await runEvent(other, "workflow_run.notification");
      assert.strictEqual(calls.length, 2);
    } finally {
      CreateInvoice.prototype.notification = original;
    }
  });

  it("keeps a question on the run with its links, and a newer event that isn't one forgets it", async () => {
    reset();
    const { run } = await fixtures();
    let after = await runEvent(run, "workflow_run.awaiting_input", { revision: 6 });
    assert.ok(after.question.token && after.question.choices && after.question.message);
    assert.deepStrictEqual(Object.keys(after.links), ["decisions", "search"]);
    assert.deepStrictEqual([after.revision, after.state], [6, "awaiting_input"]);
    assert.strictEqual(after.summaryText(), "Waiting for your answer");
    after = await runEvent(run, "workflow_run.completed", { revision: 7 });
    assert.strictEqual(after.question, null);
    assert.strictEqual(after.links, null);
  });

  it("leaves the question alone for an awaiting_input retry with no prompt", async () => {
    reset();
    const { run } = await fixtures();
    await runEvent(run, "workflow_run.awaiting_input", { revision: 6 });
    const after = await runEvent(run, "workflow_run.awaiting_input", { revision: 7, prompt: null });
    assert.notStrictEqual(after.question, null);
  });

  it("keeps nothing on the app's record", async () => {
    reset();
    const { invoice, run } = await fixtures();
    await runEvent(run, "workflow_run.awaiting_input", { revision: 1 });
    assert.deepStrictEqual(Object.keys(invoice), ["id", "accountId", "number"]);
  });

  it("saves what the handler wrote through the run lock with the revision, or neither when it throws", async () => {
    reset();
    const { run } = await fixtures();
    const original = CreateInvoice.prototype.ended;
    CreateInvoice.prototype.ended = async function (event) {
      await original.call(this, event);
      throw new Error("after the link");
    };
    try {
      await assert.rejects(runEvent(run, "workflow_run.completed", { revision: 4, output: { record: { txn_id: "T1" } } }), /after the link/);
    } finally {
      CreateInvoice.prototype.ended = original;
    }
    const after = await reload(run);
    assert.deepStrictEqual([after.revision, after.state], [0, "running"]);
    assert.strictEqual(await after.connection.quickbooksRecord("T1"), null);
    await runEvent(run, "workflow_run.completed", { revision: 4, output: { record: { txn_id: "T1", ref_number: "1001" } } });
    assert.strictEqual((await after.connection.quickbooksRecord("T1", { kind: "invoice" })).name, "1001");
  });

  it("finds the record with the findRecord setting when the operation has no findRecord", async () => {
    reset();
    const { connection } = await fixtures();
    const customer = tables.Customer.add({ name: "Riverbend Electric" });
    const sync = await makeRun(customer, connection, { operation: "sync_customer" });
    await runEvent(sync, "workflow_run.completed", { revision: 1 });
    assert.deepStrictEqual(calls, [["ended", customer]]);
  });

  it("drops a delivery whose record was deleted, with a warning, rather than throwing for ever", async () => {
    reset();
    const { invoice, run } = await fixtures();
    tables.Invoice.rows.delete(String(invoice.id));
    await runEvent(run, "workflow_run.completed");
    assert.deepStrictEqual(calls, []);
    assert.match(loggedText(), new RegExp(`warn QuBe Sync: dropped workflow_run.completed: run ${run.id}'s Invoice ${invoice.id} isn't there`));
  });

  it("drops a delivery for a run or connection deleted since, and throws for an operation taken out", async () => {
    reset();
    const { run } = await fixtures();
    await kit.run({ kind: "run", id: "0", body: vectorBody("workflow_run.completed") });
    await kit.run({ kind: "connection", id: "999", body: vectorBody("connection.connected") });
    assert.match(loggedText(), /run 0 isn't there/);
    assert.match(loggedText(), /connection 999 isn't there/);
    kit.configure({ operations: { sync_customer: SyncCustomer } });
    await assert.rejects(runEvent(run, "workflow_run.completed"), (err) => err instanceof kit.UnknownOperation);
    await assert.rejects(kit.run({ kind: "account", id: "1", body: "{}" }), /a run, a connection or a request, not "account"/);
  });

  it("logs in the base handlers until an operation fills them in", async () => {
    reset();
    const { connection } = await fixtures();
    const customer = tables.Customer.add();
    const sync = await makeRun(customer, connection, { operation: "sync_customer" });
    await runEvent(sync, "workflow_run.notification");
    await runEvent(sync, "workflow_run.cancelled", { revision: 2 });
    assert.ok(logged().some((l) => l.level === "log" && /SyncCustomer 1 \(run \d+\): workflow_run.notification/.test(l.text)));
    assert.ok(logged().some((l) => l.level === "warn" && /workflow_run.cancelled/.test(l.text)));
  });
});

describe("kit: the job", () => {
  it("retries a delivery whose work threw, with a growing wait, and gives up after jobAttempts, logged", async () => {
    reset({ jobAttempts: 3 });
    const { run } = await fixtures();
    kit.configure({ operations: { sync_customer: SyncCustomer } }); // the run's operation, taken out
    const waits = [];
    const delivery = { kind: "run", id: String(run.id), body: runBody("workflow_run.completed", run) };
    await assert.rejects(kit.job(delivery, { sleep: async (ms) => waits.push(ms) }), kit.UnknownOperation);
    assert.deepStrictEqual(waits, [kit.retryWait(1), kit.retryWait(2)]);
    assert.deepStrictEqual([kit.retryWait(1), kit.retryWait(2), kit.retryWait(3)], [3000, 18000, 83000]);
    assert.match(loggedText(), new RegExp(`error QuBe Sync: gave up on a webhook for run ${run.id} after 3 attempts: UnknownOperation`));
  });

  it("the default enqueue runs each delivery in this process after the response, and warns once", async () => {
    reset();
    const { run } = await fixtures();
    kit.configure({ enqueue: null });
    const body = runBody("workflow_run.completed", run, { revision: 1 });
    await kit.settings().enqueue({ kind: "run", id: String(run.id), body });
    assert.deepStrictEqual(calls, []); // after the response
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.strictEqual(calls.length, 1);
    assert.strictEqual((await reload(run)).revision, 1);
  });
});

describe("kit: receiveWebhook", () => {
  it("answers 413 for a body over 5 MB, and 400 for a signed body that isn't a JSON object", async () => {
    reset({ enqueue: () => {} });
    const { run } = await fixtures();
    const big = Buffer.alloc(kit.MAX_BODY_BYTES + 1, 32);
    assert.deepStrictEqual(await kit.receiveWebhook({ kind: "run", id: run.id, body: big, signature: support.sign(big.toString()) }), { status: 413 });
    assert.deepStrictEqual(await kit.receiveWebhook({ kind: "run", id: run.id, body: "[1]", signature: support.sign("[1]") }), { status: 400 });
    await assert.rejects(kit.receiveWebhook({ kind: "run", id: run.id, body: { parsed: true }, signature: "x" }), /already parsed/);
  });
});

describe("kit: receiveWebhook's refusals", () => {
  it("logs the reason, the path and what to check, never the secret or the body", async () => {
    reset({ enqueue: () => {} });
    const { run } = await fixtures();
    const body = runBody("workflow_run.completed", run);
    const cases = [
      [support.sign(body, "whsec_someone_else"), "mismatch", /QUBE_WEBHOOK_SECRET .*`qube env --write \.env`/],
      [support.sign(body, SECRET, 1000), "stale", /Check the clock/],
      [undefined, "missing", /isn't from QuBe Sync/],
      ["nonsense", "malformed", /t=<seconds>,v1=<hex>, so it isn't from QuBe Sync/],
    ];
    for (const [signature, reason, hint] of cases) {
      const answered = await kit.receiveWebhook({ kind: "run", id: run.id, body, signature, path: `/webhooks/qube/runs/${run.id}` });
      assert.strictEqual(answered.status, 401);
      const line = logged()[logged().length - 1].text;
      assert.ok(line.startsWith(`QuBe Sync: refused a webhook: ${reason} (/webhooks/qube/runs/${run.id}): `), line);
      assert.match(line, hint);
    }
    await kit.receiveWebhook({ kind: "run", id: run.id, body, signature: "nonsense" });
    assert.ok(logged()[logged().length - 1].text.startsWith(`QuBe Sync: refused a webhook: malformed (run ${run.id}): `));
    assert.ok(!loggedText().includes(SECRET) && !loggedText().includes(run.reference));
  });
});

describe("kit: Operation.start", () => {
  it("writes the run first, starts it on the connection's qubeId, and keeps QuBe Sync's answer", async () => {
    reset();
    const { connection, invoice } = await unsent();
    let seen = null;
    answer({
      ...data({ id: "run-q-1", state: "running", links: { run: "https://qube.example/r/1", cancel: "https://qube.example/r/1/cancel" } }, 201),
      before: async () => {
        seen = await kit.Run.latestFor(invoice, "create_invoice");
      },
    });
    const run = await CreateInvoice.start(invoice, connection);
    assert.strictEqual(seen.state, "starting");
    assert.strictEqual(String(seen.id), String(run.id));
    const sent = fake.received[0];
    assert.strictEqual(sent.path, `/api/v2/connections/${CONN}/workflow-runs`);
    assert.strictEqual(sent.headers["idempotency-key"], run.reference);
    assert.match(run.reference, new RegExp(`^create_invoice-${invoice.id}-[0-9a-f-]{36}$`));
    assert.deepStrictEqual(sent.body, {
      workflow: "add_transaction",
      reference: run.reference,
      input: { operation: "invoice.create", params: { ref_number: "1001" } },
      webhook_url: `${WEBHOOK_URL}/runs/${run.id}`,
    });
    const row = await reload(run);
    assert.deepStrictEqual(
      [row.qubeRunId, row.state, row.runUrl, row.cancelUrl, row.operation, row.recordType, row.recordId],
      ["run-q-1", "running", "https://qube.example/r/1", "https://qube.example/r/1/cancel", "create_invoice", "Invoice", String(invoice.id)]
    );
    assert.deepStrictEqual(row.input, sent.body.input);
    assert.strictEqual(String(row.connectionId), String(connection.id));
  });

  it("keeps a state a webhook wrote before the answer came back", async () => {
    reset();
    const { connection, invoice } = await unsent();
    answer({
      ...data({ id: "run-q-1", state: "running" }, 201),
      before: async () => {
        const run = await kit.Run.latestFor(invoice, "create_invoice");
        await run.update({ state: "awaiting_input" });
      },
    });
    const run = await CreateInvoice.start(invoice, connection);
    assert.strictEqual(run.state, "awaiting_input");
    assert.strictEqual((await reload(run)).qubeRunId, "run-q-1");
  });

  it("refuses a connection QuBe Sync hasn't made yet, and writes no run", async () => {
    reset();
    const account = tables.Account.add();
    const connection = await kit.Connection.create(account);
    const invoice = tables.Invoice.add();
    await assert.rejects(CreateInvoice.start(invoice, connection), (err) => err instanceof kit.NotConnected && /needs a connection QuBe Sync has made/.test(err.message));
    await assert.rejects(CreateInvoice.start(invoice, null), kit.NotConnected);
    assert.strictEqual(await kit.Run.latestFor(invoice, "create_invoice"), null);
    assert.strictEqual(fake.received.length, 0);
  });

  it("marks the run failed and throws again when QuBe Sync refuses the start (a 4xx)", async () => {
    reset();
    const { connection, invoice } = await unsent();
    answer(apiError(422, { code: "invalid_input", message: "bad" }));
    await assert.rejects(CreateInvoice.start(invoice, connection), (err) => err instanceof kit.APIError && err.status === 422);
    const run = await kit.Run.latestFor(invoice, "create_invoice");
    assert.strictEqual(run.state, "failed");
    assert.strictEqual(run.summaryText(), "Failed: it couldn't be started");
  });

  it("throws RealtimeRequired, with QuBe Sync's detail, and marks the run failed, when the connection is standard", async () => {
    reset();
    const { connection, invoice } = await unsent();
    const detail = "Workflows run on realtime connections. This connection is standard: upgrade it.";
    answer(apiError(422, { code: "realtime_required", detail }));
    await assert.rejects(CreateInvoice.start(invoice, connection), (err) => err instanceof kit.RealtimeRequired && err.message === detail);
    assert.strictEqual((await kit.Run.latestFor(invoice, "create_invoice")).state, "failed");
  });

  it("marks the run failed when its input throws, before anything is sent", async () => {
    reset();
    const { connection, invoice } = await unsent();
    class Broken extends CreateInvoice {
      input() {
        throw new Error("no lines");
      }
    }
    await assert.rejects(Broken.start(invoice, connection), /no lines/);
    const failed = await kit.Run.latestFor(invoice, "create_invoice");
    assert.deepStrictEqual([failed.state, failed.input], ["failed", null]);
    assert.strictEqual(fake.received.length, 0);
    // Ended: the next start makes a new run.
    await assert.rejects(Broken.start(invoice, connection), /no lines/);
    assert.notStrictEqual(String((await kit.Run.latestFor(invoice, "create_invoice")).id), String(failed.id));
  });

  it("leaves the run starting, with its reference and input, when the start gets no answer (a 5xx)", async () => {
    reset();
    const { connection, invoice } = await unsent();
    answer(apiError(500, "boom"));
    await assert.rejects(CreateInvoice.start(invoice, connection), (err) => err.status === 500);
    const run = await kit.Run.latestFor(invoice, "create_invoice");
    assert.strictEqual(run.state, "starting");
    assert.deepStrictEqual(run.input, { operation: "invoice.create", params: { ref_number: "1001" } });
    assert.ok(run.reference);
    assert.strictEqual(run.qubeRunId, null);
  });

  it("returns the record's run that hasn't ended rather than starting another, and a new one once it has", async () => {
    reset();
    const { connection, invoice } = await unsent();
    answer(data({ id: "run-q-1", state: "running" }, 201));
    const first = await CreateInvoice.start(invoice, connection);
    assert.strictEqual(first.reused, false);
    const again = await CreateInvoice.start(invoice, connection);
    assert.deepStrictEqual([String(again.id), again.reused, again.reference], [String(first.id), true, first.reference]);
    assert.strictEqual(fake.received.length, 1);

    await first.update({ state: "completed", outcome: "added" });
    answer(data({ id: "run-q-2", state: "running" }, 201));
    const next = await CreateInvoice.start(invoice, connection);
    assert.notStrictEqual(String(next.id), String(first.id));
    assert.notStrictEqual(next.reference, first.reference);
    assert.strictEqual(next.reused, false);
  });

  it("resends an unconfirmed start it reuses, with the same reference and the stored input", async () => {
    reset();
    const { connection, invoice } = await unsent();
    answer(apiError(500, "boom"));
    await assert.rejects(CreateInvoice.start(invoice, connection), (err) => err.status === 500);
    invoice.number = "changed since";
    answer(data({ id: "run-q-1", state: "running" }, 201));
    const run = await CreateInvoice.start(invoice, connection);
    assert.strictEqual(run.reused, true);
    const sent = fake.received.filter((r) => r.method === "POST");
    assert.strictEqual(sent.length, 2);
    const [first, last] = [sent[0], sent[sent.length - 1]];
    assert.deepStrictEqual(last.body, first.body);
    assert.strictEqual(last.headers["idempotency-key"], first.headers["idempotency-key"]);
    assert.deepStrictEqual([run.qubeRunId, run.state], ["run-q-1", "running"]);
  });

  it("keeps runs on different connections apart", async () => {
    reset();
    const { account, connection, invoice } = await unsent();
    const second = await makeConnection(account, { qubeId: "conn-q-second" });
    answer(data({ id: "run-q-1", state: "running" }, 201));
    const here = await CreateInvoice.start(invoice, connection);
    const there = await CreateInvoice.start(invoice, second);
    assert.notStrictEqual(String(here.id), String(there.id));
    assert.strictEqual(there.reused, false);
  });

  it("finds one row for two starts at once (a double click), and sends one reference", async () => {
    reset();
    const { connection, invoice } = await unsent();
    answer(data({ id: "run-q-1", state: "running" }, 201));
    const [a, b] = await Promise.all([CreateInvoice.start(invoice, connection), CreateInvoice.start(invoice, connection)]);
    assert.strictEqual(String(a.id), String(b.id));
    assert.deepStrictEqual([a.reused, b.reused].sort(), [false, true]);
    const references = new Set(fake.received.map((r) => r.headers["idempotency-key"]));
    assert.strictEqual(references.size, 1);
  });

  it("leaves the run starting on a 409 (the reference in use by a call still in flight)", async () => {
    reset();
    const { connection, invoice } = await unsent();
    answer(apiError(409, { code: "idempotency_key_in_use" }));
    await assert.rejects(CreateInvoice.start(invoice, connection), (err) => err.status === 409);
    assert.strictEqual((await kit.Run.latestFor(invoice, "create_invoice")).state, "starting");
  });

  it("computes the input under the connection's lock, reading through its transaction", async () => {
    reset();
    const { connection, invoice } = await unsent();
    let seen = null;
    class Reading extends CreateInvoice {
      async input() {
        seen = [this.run.state, this.run.id, String(this.connection.id), this.store === this.connection.store];
        return { ref: this.record.number };
      }
    }
    answer(data({ id: "run-q-1", state: "running" }, 201));
    await Reading.start(invoice, connection);
    assert.deepStrictEqual(seen, ["starting", undefined, String(connection.id), true]);
  });

  it("leaves the run starting when the connection drops", async () => {
    reset();
    const { connection, invoice } = await unsent();
    answer({ destroy: true });
    await assert.rejects(CreateInvoice.start(invoice, connection), (err) => err.code === "ECONNRESET");
    assert.strictEqual((await kit.Run.latestFor(invoice, "create_invoice")).state, "starting");
  });
});

describe("kit: retryStart", () => {
  it("resends the same reference (as the Idempotency-Key), workflow, input and webhook URL", async () => {
    reset();
    const { connection, invoice } = await unsent();
    answer(apiError(500, "boom"));
    await assert.rejects(CreateInvoice.start(invoice, connection));
    const run = await kit.Run.latestFor(invoice, "create_invoice");
    answer(data({ id: "run-q-1", state: "running", links: { run: "r", cancel: "c" } }, 201));
    const retried = await run.retryStart();
    const [first, second] = fake.received;
    assert.deepStrictEqual(second.body, first.body);
    assert.strictEqual(second.headers["idempotency-key"], run.reference);
    assert.deepStrictEqual([retried.qubeRunId, retried.state, retried.runUrl], ["run-q-1", "running", "r"]);
  });

  it("throws RealtimeRequired and marks the run failed when the resent start is refused for a standard connection", async () => {
    reset();
    const { connection, invoice } = await unsent();
    answer(apiError(500, "boom"));
    await assert.rejects(CreateInvoice.start(invoice, connection));
    const run = await kit.Run.latestFor(invoice, "create_invoice");
    answer(apiError(422, { code: "realtime_required" }));
    await assert.rejects(run.retryStart(), (err) => err instanceof kit.RealtimeRequired && /this one is standard/.test(err.message));
    assert.strictEqual((await kit.Run.latestFor(invoice, "create_invoice")).state, "failed");
  });

  it("returns a run already answered as it is, and refuses one that failed", async () => {
    reset();
    const { run } = await fixtures();
    await run.update({ qubeRunId: "run-q-1" });
    assert.strictEqual(await run.retryStart(), run);
    await run.update({ qubeRunId: null, state: "failed" });
    await assert.rejects(run.retryStart(), /is failed: only a start that got no answer is sent again/);
    assert.strictEqual(fake.received.length, 0);
    kit.configure({ operations: { sync_customer: SyncCustomer } });
    await assert.rejects(run.retryStart(), kit.UnknownOperation);
  });
});

describe("kit: Run", () => {
  it("says where it stands in a sentence", async () => {
    reset();
    const { run } = await fixtures();
    const says = async (changes) => (await run.update(changes)).summaryText();
    assert.strictEqual(await says({ state: "starting" }), "Starting");
    assert.strictEqual(await says({ state: "running" }), "Running");
    assert.strictEqual(await says({ state: "awaiting_input" }), "Waiting for your answer");
    assert.strictEqual(await says({ state: "completed", outcome: "added" }), "Added to QuickBooks");
    assert.strictEqual(await says({ state: "completed", outcome: null }), "Done");
    assert.strictEqual(await says({ state: "completed", outcome: "completed" }), "Done");
    assert.strictEqual(await says({ state: "completed", outcome: "used_existing" }), "Done: Used existing");
    assert.strictEqual(await says({ state: "failed", outcome: "failed", error: "Name taken", endedAt: new Date() }), "Failed: Name taken");
    assert.strictEqual(await says({ state: "failed", outcome: "failed", error: null, endedAt: new Date() }), "Failed");
    assert.strictEqual(await says({ state: "failed", outcome: "duplicate_found", error: null, endedAt: new Date() }), "Failed: Duplicate found");
    assert.strictEqual(await says({ state: "cancelled", cancelReason: "Merged" }), "Cancelled: Merged");
    assert.strictEqual(await says({ state: "cancelled", cancelReason: " " }), "Cancelled: your app chose to stop");
  });

  it("reads a completed run whose outcome is cancelled as cancelled, not done", async () => {
    reset();
    const { run } = await fixtures();
    await run.update({ state: "completed", outcome: "cancelled" });
    assert.strictEqual(run.cancelled(), true);
    assert.strictEqual(run.ended(), true);
    assert.strictEqual(run.summaryText(), "Cancelled: your app chose to stop");
  });

  it("says a start QuBe Sync hasn't confirmed for a minute is unconfirmed, and a younger one is starting", async () => {
    reset();
    const { run } = await fixtures();
    await run.update({ state: "starting" });
    assert.strictEqual(run.unconfirmed(), false);
    const later = new Date(Date.now() + 61 * 1000);
    assert.strictEqual(run.unconfirmed(later), true);
    assert.strictEqual(run.summaryText(later), "Not confirmed by QuBe Sync yet");
  });

  it("looks stuck when confirmed, not ended, quiet for 10 minutes, and running or awaiting a question it never got", async () => {
    reset();
    const { run } = await fixtures();
    const later = new Date(Date.now() + 601 * 1000);
    assert.strictEqual(run.looksStuck(later), false); // no qubeRunId
    await run.update({ qubeRunId: "run-q-1" });
    assert.strictEqual(run.looksStuck(), false);
    assert.strictEqual(run.looksStuck(later), true);
    await run.update({ state: "awaiting_input" });
    assert.strictEqual(run.looksStuck(later), true);
    await run.update({ question: { token: "t", choices: [] } });
    assert.strictEqual(run.looksStuck(later), false);
    for (const state of ["starting", "completed", "failed", "cancelled"]) {
      await run.update({ state, question: null });
      assert.strictEqual(run.looksStuck(later), false, state);
    }
  });

  it("gives an error's detail only when it isn't its message", async () => {
    reset();
    const { run } = await fixtures();
    await run.update({ state: "failed", error: { message: "Same", detail: "Same" } });
    assert.strictEqual(run.errorDetail(), null);
    await run.update({ error: { detail: "Only a detail" } });
    assert.deepStrictEqual([run.errorMessage(), run.errorDetail()], ["Only a detail", null]);
    await run.update({ error: "A sentence" });
    assert.strictEqual(run.errorDetail(), null);
  });

  it("finds a record's newest run of an operation, and refuses a slug that isn't configured", async () => {
    reset();
    const { connection, invoice, run } = await fixtures();
    await new Promise((resolve) => setTimeout(resolve, 5));
    const newer = await makeRun(invoice, connection);
    assert.strictEqual((await kit.Run.latestFor(invoice, "create_invoice")).id, newer.id);
    assert.notStrictEqual(newer.id, run.id);
    assert.strictEqual(await kit.Run.latestFor(invoice, "sync_customer"), null);
    await assert.rejects(kit.Run.latestFor(invoice, "nope"), /no operation has the slug "nope"/);
  });
});

describe("kit: Operation helpers", () => {
  it("answered forgets the question only when its token is the one answered", async () => {
    reset();
    const { invoice, run } = await fixtures();
    await run.update({ state: "awaiting_input", question: { token: "tok-2", choices: [] }, links: { decisions: "d" } });
    const operation = new CreateInvoice(invoice, run);
    await operation.answered("tok-1");
    assert.strictEqual((await reload(run)).question.token, "tok-2");
    await operation.answered("tok-2");
    const after = await reload(run);
    assert.deepStrictEqual([after.question, after.links], [null, null]);
    assert.strictEqual(after.state, "awaiting_input"); // without taken, the next webhook says
  });

  it("answered with taken puts the run back to running, only while its token is the open question's", async () => {
    reset();
    const { invoice, run } = await fixtures();
    await run.update({ state: "awaiting_input", question: { token: "tok-2", choices: [] }, links: { decisions: "d" } });
    const operation = new CreateInvoice(invoice, run);
    await operation.answered("tok-1", { taken: true });
    assert.strictEqual((await reload(run)).state, "awaiting_input");
    await operation.answered("tok-2", { taken: true });
    const after = await reload(run);
    assert.deepStrictEqual([after.state, after.question], ["running", null]);
  });

  it("quickbooksRef refers by ListID when the record is linked on the run's connection, else by name, else null", async () => {
    reset();
    const { invoice, run, account } = await fixtures();
    const customer = tables.Customer.add({ name: "Riverbend Electric" });
    const operation = new CreateInvoice(invoice, run);
    assert.deepStrictEqual(await operation.quickbooksRef(customer, { kind: "customer", name: "Riverbend Electric" }), { full_name: "Riverbend Electric" });
    assert.strictEqual(await operation.quickbooksRef(null, { kind: "customer", name: "" }), null);
    const elsewhere = await makeConnection(account, { qubeId: "q-other" });
    await elsewhere.link(customer, { kind: "customer", qbId: "Q-other" });
    assert.deepStrictEqual(await operation.quickbooksRef(customer, { kind: "customer", name: "Riverbend Electric" }), { full_name: "Riverbend Electric" });
    await run.connection.link(customer, { kind: "customer", qbId: "Q1" });
    assert.deepStrictEqual(await operation.quickbooksRef(customer, { kind: "customer", name: "Riverbend Electric" }), { list_id: "Q1" });
  });

  it("linkReferences links each reference's record to the app record returned, by the record's own type, and skips the rest", async () => {
    reset();
    const { invoice, run } = await fixtures();
    const customer = tables.Customer.add();
    const item = tables.Customer.add();
    const event = {
      body: {},
      output: {
        references: {
          customer_ref: { kind: "customer", outcome: "found", record: { type: "customer", list_id: "C1", edit_sequence: "5", full_name: "Riverbend" } },
          "invoice_line_add.0.item_ref": { kind: "item", outcome: "found", record: { type: "item_service", list_id: "I1", full_name: "Labor" } },
          "invoice_line_add.1.item_ref": { kind: "item", outcome: "not_found", record: null },
          skipped_ref: { kind: "item", record: { type: "item_service", list_id: "I2" } },
        },
      },
    };
    const operation = new CreateInvoice(invoice, run);
    const seen = [];
    const linked = await operation.linkReferences(event, (path, entry) => {
      seen.push([path, entry.kind]);
      if (path === "customer_ref") return customer;
      if (path === "invoice_line_add.0.item_ref") return item;
      return null;
    });
    assert.deepStrictEqual(linked.map((row) => [row.kind, row.qbId]), [["customer", "C1"], ["item_service", "I1"]]);
    assert.deepStrictEqual(seen.map((s) => s[0]), ["customer_ref", "invoice_line_add.0.item_ref", "skipped_ref"]);
    assert.strictEqual(await run.connection.qbIdFor(item, { kind: "item" }), "I1");
    assert.deepStrictEqual(await operation.linkReferences({ output: null }, () => customer), []);
  });

  it("withoutNils drops null values at every depth, for a mapped operation's input", () => {
    const operation = new CreateInvoice({ id: 1 }, null);
    assert.deepStrictEqual(operation.withoutNils({ a: null, b: [1, null, { c: undefined, d: 2 }] }), { b: [1, { d: 2 }] });
  });

  it("an operation's unwritten parts say so", async () => {
    reset();
    class Bare extends kit.Operation {
      static workflow = "w";
      static slug = "bare";
    }
    assert.throws(() => new Bare({ id: 1 }, null).input(), /Bare's input isn't written yet/);
    await assert.rejects(Bare.findRecord("7"), /Bare.findRecord\("7"\) isn't written/);
  });
});

describe("kit: answers", () => {
  const choice = {
    id: "use",
    label: "Use it",
    fields: [
      { name: "count", type: "number" },
      { name: "rate", type: "number" },
      { name: "rush", type: "boolean" },
      { name: "note", type: "string" },
      { name: "blank", type: "string" },
      { name: "odd", type: "number" },
    ],
  };

  it("answerData takes each field as its type, nested or flat", () => {
    const flat = { choice: "use", "data[count]": " 3 ", "data[rate]": "1.5", "data[rush]": "true", "data[note]": " hi ", "data[blank]": " ", "data[odd]": "n/a" };
    const nested = { choice: "use", data: { count: "3", rate: "1.5", rush: "true", note: "hi", blank: "", odd: "n/a" } };
    const expected = { count: 3, rate: 1.5, rush: true, note: "hi", odd: "n/a" };
    assert.deepStrictEqual(kit.answerData(choice, flat), expected);
    assert.deepStrictEqual(kit.answerData(choice, nested), expected);
    assert.deepStrictEqual(kit.answerData(choice, {}), { rush: false });
  });

  it("refusalMessage reads errors.detail", () => {
    assert.strictEqual(kit.refusalMessage(new kit.APIError(422, JSON.stringify({ errors: { detail: "count must be whole" } }))), "QuBe Sync couldn't take that answer: count must be whole");
    assert.strictEqual(kit.refusalMessage(new kit.APIError(422, "<html>")), "QuBe Sync couldn't take that answer.");
  });
});

describe("kit: renderQuestion and renderRunStatus", () => {
  const question = {
    id: "ask_pick",
    token: "tok",
    kind: "pick",
    message: `Which <b>"customer"</b>?`,
    details: [{ label: "Name & co", value: "<script>x</script>" }],
    choices: [
      { id: "pick", label: "Pick 'one'", detail: "a > b", description: "desc", fields: [{ name: "customer", type: "record", label: "Customer", required: true }] },
      { id: "skip", label: "Skip", fields: [{ name: "why", type: "string" }, { name: "n", type: "number" }, { name: "b", type: "boolean" }] },
    ],
  };

  it("shows the run's question, with a form per choice posting to that run's route, escaping every value", async () => {
    reset();
    const { run } = await fixtures();
    await run.update({ question, links: { decisions: "d" } });
    const html = kit.renderQuestion(run, { mount: "/app/", csrfToken: `c"t`, nonce: "n<1" });
    const action = `/app/qube/questions/runs/${run.id}`;
    assert.ok(!html.includes("<b>"));
    assert.ok(!html.includes("<script>x"));
    assert.ok(html.includes("Which &lt;b&gt;&quot;customer&quot;&lt;/b&gt;?"));
    assert.ok(html.includes(`<th scope="row">Name &amp; co</th><td>&lt;script&gt;x&lt;/script&gt;</td>`));
    assert.strictEqual(html.split(`<form class="qube-choice" method="post" action="${action}">`).length - 1, 2);
    assert.strictEqual(html.match(/<input type="hidden" name="_csrf" value="c&quot;t">/g).length, 2);
    assert.ok(html.includes(`data-qube-search="${action}/search" data-qube-field="customer"`));
    assert.ok(html.includes(`<script nonce="n&lt;1">`));
    assert.ok(html.includes(kit.SEARCH_SCRIPT));
    assert.ok(html.includes(`Pick &#39;one&#39; <span class="qube-choice-detail">a &gt; b</span>`));
    assert.ok(html.includes(`<input type="text" id="qube-tok-1-why" name="data[why]">`));
    assert.ok(html.includes(`<input type="number" step="any" id="qube-tok-1-n" name="data[n]">`));
    assert.ok(html.includes(`<input type="checkbox" id="qube-tok-1-b" name="data[b]" value="true">`));
  });

  it("shows nothing for no run, or one that has stopped asking, and takes another CSRF field name", async () => {
    reset();
    const { run } = await fixtures();
    assert.strictEqual(kit.renderQuestion(null), "");
    assert.strictEqual(kit.renderQuestion(run), "");
    await run.update({ question });
    assert.ok(!kit.renderQuestion(run).includes("_csrf"));
    assert.ok(kit.renderQuestion(run, { csrfToken: "t", csrfField: "authenticity_token" }).includes(`name="authenticity_token" value="t"`));
  });

  it("shows the run's summary, and a failure's detail, escaped", async () => {
    reset();
    const { run } = await fixtures();
    await run.update({ state: "failed", outcome: "failed", endedAt: new Date(), error: { message: "Customer <missing>", detail: "No customer named Riverbend" } });
    const html = kit.renderRunStatus(run);
    assert.ok(html.startsWith(`<div class="qube-run-status qube-sync-failed qube-run-failed" data-qube-sync-status="failed">`));
    assert.ok(html.includes(`<p class="qube-run-summary">Failed: Customer &lt;missing&gt;</p>`));
    assert.ok(html.includes(`<p class="qube-run-error-detail">No customer named Riverbend</p>`));
    await run.update({ state: "completed", outcome: "cancelled", error: null });
    assert.ok(kit.renderRunStatus(run).includes(`qube-run-cancelled`));
    assert.ok(!kit.renderRunStatus(run).includes("qube-run-error-detail"));
    assert.strictEqual(kit.renderRunStatus(null), "");
  });

  it("shows a sync status's classes and summary, and nothing for not_sent", async () => {
    reset();
    const { connection, invoice, run } = await fixtures();
    assert.strictEqual(kit.renderRunStatus(await connection.syncStatus(tables.Invoice.add(), "create_invoice")), "");
    await run.update({ state: "completed", outcome: "added", endedAt: new Date() });
    await connection.link(invoice, { kind: "invoice", qbId: "T1" });
    const html = kit.renderRunStatus(await connection.syncStatus(invoice, "create_invoice"));
    assert.ok(html.startsWith(`<div class="qube-run-status qube-sync-in_quickbooks qube-run-completed" data-qube-sync-status="in_quickbooks">`));
    assert.ok(html.includes(`<p class="qube-run-summary">Added to QuickBooks</p>`));
    await run.update({ state: "awaiting_input", question: { token: "t", message: "Which?", choices: [] } });
    const asking = await connection.syncStatus(invoice, "create_invoice");
    assert.ok(kit.renderQuestion(asking).includes(`<p class="qube-question-message">Which?</p>`));
  });

  it("offers to send a stuck run's latest news again, and only then", async () => {
    reset();
    const { run } = await fixtures();
    await run.update({ qubeRunId: "run-q-1" });
    assert.ok(!kit.renderRunStatus(run).includes("redeliver"));
    const later = new Date(Date.now() + 601 * 1000);
    const html = kit.renderRunStatus(run, { now: later, csrfToken: "t", mount: "/app" });
    assert.ok(html.includes(`<p class="qube-run-quiet">No news from QuBe Sync about it for a while.</p>`));
    assert.ok(html.includes(`<form class="qube-redeliver-form" method="post" action="/app/qube/runs/${run.id}/redeliver">`));
    assert.ok(html.includes(`<button type="submit" class="qube-redeliver">Send its latest news again</button>`));
    assert.ok(html.includes(`<input type="hidden" name="_csrf" value="t">`));
  });

  it("shows an error once, escaped, above whatever else it shows", async () => {
    reset();
    const { run } = await fixtures();
    assert.strictEqual(kit.renderRunStatus(null, { error: "<b>no</b>" }), `<p class="qube-error">&lt;b&gt;no&lt;/b&gt;</p>`);
    assert.ok(kit.renderRunStatus(run, { error: "Changed" }).startsWith(`<p class="qube-error">Changed</p>\n<div class="qube-run-status`));
    assert.strictEqual(kit.renderQuestion(run, { error: "Changed" }), `<p class="qube-error">Changed</p>`);
    assert.strictEqual(kit.renderRunStatus(run, { error: null }).includes("qube-error"), false);
  });

  it("offers to try an unconfirmed start again, and only then", async () => {
    reset();
    const { run } = await fixtures();
    await run.update({ state: "starting" });
    assert.ok(!kit.renderRunStatus(run).includes("retry_start"));
    const later = new Date(Date.now() + 61 * 1000);
    const html = kit.renderRunStatus(run, { now: later, csrfToken: "t", mount: "/app" });
    assert.ok(html.includes(`<form class="qube-retry-start-form" method="post" action="/app/qube/runs/${run.id}/retry_start">`));
    assert.ok(html.includes(`<input type="hidden" name="_csrf" value="t">`));
    assert.ok(html.includes(`Not confirmed by QuBe Sync yet`));
  });
});

describe("kit: sync status", () => {
  const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

  async function status(connection, invoice) {
    return connection.syncStatus(invoice, "create_invoice");
  }

  it("is not_sent with no run and no link, and refuses a slug that isn't configured", async () => {
    reset();
    const { connection, invoice } = await unsent();
    const found = await status(connection, invoice);
    assert.deepStrictEqual(found.toJSON(), { status: "not_sent", qbId: null, error: null, retry: false, unconfirmed: false, summaryText: null });
    await assert.rejects(connection.syncStatus(invoice, "nope"), /no operation has the slug "nope"/);
  });

  it("says sending or needs_answer while the latest run hasn't ended, whatever the link says", async () => {
    reset();
    const { connection, invoice, run } = await fixtures();
    await connection.link(invoice, { kind: "invoice", qbId: "T1" });
    for (const [state, expected] of [["starting", "sending"], ["running", "sending"], ["awaiting_input", "needs_answer"]]) {
      await run.update({ state });
      const found = await status(connection, invoice);
      assert.deepStrictEqual([found.status, found.qbId, found.retry], [expected, "T1", false], state);
    }
    await run.update({ state: "starting" });
    const later = await connection.syncStatus(invoice, "create_invoice", { now: new Date(Date.now() + 61 * 1000) });
    assert.deepStrictEqual([later.status, later.unconfirmed, later.summaryText], ["sending", true, "Not confirmed by QuBe Sync yet"]);
  });

  it("says failed or cancelled after the link, with retry only when there's no link", async () => {
    reset();
    const { connection, invoice, run } = await fixtures();
    await run.update({ state: "failed", endedAt: new Date(), error: { message: "Customer not found" } });
    let found = await status(connection, invoice);
    assert.deepStrictEqual([found.status, found.retry, found.error, found.summaryText], ["failed", true, { message: "Customer not found" }, "Failed: Customer not found"]);
    await run.update({ state: "cancelled", cancelReason: "asked" });
    found = await status(connection, invoice);
    assert.deepStrictEqual([found.status, found.retry, found.error], ["cancelled", true, null]);
    // A link made since the stop wins.
    await tick();
    await connection.link(invoice, { kind: "invoice", qbId: "T1" });
    found = await status(connection, invoice);
    assert.deepStrictEqual([found.status, found.qbId, found.summaryText, found.retry], ["in_quickbooks", "T1", "In QuickBooks", false]);
    // A stop since the link wins, and doesn't offer a retry (the record is in QuickBooks).
    await tick();
    const again = await makeRun(invoice, connection, { state: "failed" });
    await again.update({ endedAt: new Date() });
    found = await status(connection, invoice);
    assert.deepStrictEqual([found.status, found.qbId, found.retry], ["failed", "T1", false]);
  });

  it("says in_quickbooks with its qb_id when linked, and done for a completed run that linked nothing", async () => {
    reset();
    const { connection, invoice, run } = await fixtures();
    await run.update({ state: "completed", outcome: "added", endedAt: new Date() });
    let found = await status(connection, invoice);
    assert.deepStrictEqual([found.status, found.qbId, found.summaryText, found.retry], ["done", null, "Added to QuickBooks", false]);
    await connection.link(invoice, { kind: "invoice", qbId: "T1" });
    found = await status(connection, invoice);
    assert.deepStrictEqual([found.status, found.qbId, found.summaryText], ["in_quickbooks", "T1", "Added to QuickBooks"]);
    assert.strictEqual(String(found), "in_quickbooks");
  });

  it("is per connection, and latest reads it on the latest run's connection", async () => {
    reset();
    const { account, connection, invoice } = await unsent();
    const second = await makeConnection(account, { qubeId: "conn-q-second" });
    await connection.link(invoice, { kind: "invoice", qbId: "T1" });
    await tick();
    await makeRun(invoice, second, { state: "awaiting_input" });
    assert.strictEqual((await status(connection, invoice)).status, "in_quickbooks");
    assert.strictEqual((await status(second, invoice)).status, "needs_answer");
    const latest = await kit.SyncStatus.latest(invoice, "create_invoice");
    assert.deepStrictEqual([latest.status, String(latest.run.connectionId)], ["needs_answer", String(second.id)]);
    const none = await kit.SyncStatus.latest(tables.Invoice.add(), "create_invoice");
    assert.strictEqual(none.status, "not_sent");
  });

  it("has SQL conditions for list pages, with the values checked and inlined", async () => {
    reset();
    const { connection } = await unsent();
    const id = connection.id;
    assert.strictEqual(
      connection.inQuickbooksSql("invoices", { recordType: "Invoice" }),
      `EXISTS (SELECT 1 FROM qube_quickbooks_records WHERE qube_quickbooks_records.connection_id = ${id} AND qube_quickbooks_records.record_type = 'Invoice' AND qube_quickbooks_records.record_id = CAST(invoices.id AS VARCHAR(255)))`
    );
    assert.ok(connection.notInQuickbooksSql("i", { recordType: "Invoice", primaryKey: "uuid" }).startsWith("NOT EXISTS (SELECT 1 FROM qube_quickbooks_records WHERE"));
    assert.ok(connection.notInQuickbooksSql("i", { recordType: "Invoice", primaryKey: "uuid" }).endsWith("= CAST(i.uuid AS VARCHAR(255)))"));
    assert.strictEqual(
      connection.needingAnswerSql("app.invoices", { recordType: "Invoice", operation: "create_invoice", dialect: "sqlite" }),
      `EXISTS (SELECT 1 FROM qube_runs WHERE qube_runs.connection_id = ${id} AND qube_runs.record_type = 'Invoice' AND qube_runs.record_id = CAST(app.invoices.id AS VARCHAR(255)) AND qube_runs.operation = 'create_invoice' AND qube_runs.state IN ('awaiting_input'))`
    );
    assert.ok(connection.sendingSql("invoices", { recordType: "Invoice", operation: "create_invoice" }).endsWith("qube_runs.state IN ('starting', 'running'))"));
    assert.ok(connection.inQuickbooksSql("invoices", { recordType: "Invoice", dialect: "mysql" }).includes("= CAST(invoices.id AS CHAR))"));
    assert.ok(
      connection.inQuickbooksSql("invoices", { recordType: "Invoice", dialect: "mysql", collation: "utf8mb4_unicode_ci" }).includes(
        "= CONVERT(CAST(invoices.id AS CHAR) USING utf8mb4) COLLATE utf8mb4_unicode_ci)"
      )
    );
    for (const bad of [
      () => connection.inQuickbooksSql("invoices; DROP TABLE x", { recordType: "Invoice" }),
      () => connection.inQuickbooksSql("invoices", { recordType: "Invoice' OR '1'='1" }),
      () => connection.inQuickbooksSql("invoices", {}),
      () => connection.inQuickbooksSql("invoices", { recordType: "Invoice", primaryKey: "id)" }),
      () => connection.inQuickbooksSql("invoices", { recordType: "Invoice", dialect: "oracle" }),
      () => connection.sendingSql("invoices", { recordType: "Invoice" }),
      () => connection.inQuickbooksSql("invoices", { recordType: "Invoice", dialect: "mysql", collation: "x; --" }),
    ]) {
      assert.throws(bad, TypeError);
    }
  });
});

describe("kit: mapping helpers", () => {
  it("read past what's missing", () => {
    assert.strictEqual(kit.get({ a: { b: 1 } }, "a", "b"), 1);
    assert.strictEqual(kit.get({ a: null }, "a", "b"), undefined);
    assert.deepStrictEqual(kit.rows(null), []);
    assert.deepStrictEqual(kit.rows(new Set([1])), [1]);
    assert.strictEqual(kit.asNumber(" "), undefined);
    assert.strictEqual(kit.asNumber("2.5"), 2.5);
    assert.strictEqual(kit.asInteger("2.5"), 2);
    assert.strictEqual(kit.asDate(new Date("2026-10-25T12:00:00Z")), "2026-10-25");
    assert.deepStrictEqual(kit.withoutNils({ a: null, b: [1, null, { c: undefined, d: 2 }] }), { b: [1, { d: 2 }] });
  });
});

describe("kit: package", () => {
  it("has no dependencies, and Express only as an optional peer", () => {
    const pkg = require("../package.json");
    assert.strictEqual(pkg.dependencies, undefined);
    assert.ok(pkg.peerDependencies.express);
    assert.strictEqual(pkg.peerDependenciesMeta.express.optional, true);
    assert.strictEqual(require("qubesync/kit"), kit);
    assert.strictEqual(require("qubesync/kit/store-tests"), require("../kit/store-tests"));
    assert.strictEqual(require.resolve("qubesync/kit/schema.sql"), kit.SCHEMA_PATH);
    for (const name of ["./kit", "./kit/store-tests", "./express"]) {
      assert.deepStrictEqual(Object.keys(pkg.exports[name]), ["types", "import", "require"]);
    }
  });
});
