"use strict";

// qubesync/kit/store-tests: the checks a store has to pass, for memoryStore() and for your app's
// own. Run them from a test file of their own, with node:test:
//
//   const storeTests = require("qubesync/kit/store-tests");
//   storeTests(async () => makeMyStore(await freshDatabase()));
//
// makeStore is called once per test and resolves to an empty store. Each check is about the
// store's part (rows, keys, transactions, locks, notifications) and the kit's link rules on top
// of it, so every store behaves alike. options.describe and options.it replace node:test's.
// options.query(store, sql) resolves to the rows of a query on the store's database: with it, the
// sync status SQL conditions are checked too (options.dialect, default "postgres").

const assert = require("assert");

const { StoreConflict } = require("./errors");
const { STORE_METHODS } = require("./store");

class StoreTestAccount {
  constructor(id) {
    this.id = id;
  }
}
class StoreTestCustomer extends StoreTestAccount {}
class StoreTestItem extends StoreTestAccount {}
class StoreTestInvoice extends StoreTestAccount {}

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 10));

async function rejectsConflict(fn) {
  await assert.rejects(fn, (err) => err instanceof StoreConflict);
}

function storeTests(makeStore, options) {
  const nodeTest = require("node:test");
  const describe = (options && options.describe) || nodeTest.describe;
  const it = (options && options.it) || nodeTest.it;

  async function withConnection(store, fields = {}) {
    return store.createConnection({ ownerType: "StoreTestAccount", ownerId: "1", status: "connected", qubeId: null, ...fields });
  }

  async function withRun(store, connection, fields = {}) {
    return store.createRun({
      connectionId: connection.id,
      operation: "create_invoice",
      recordType: "Invoice",
      recordId: "7",
      reference: `ref-${Math.random().toString(36).slice(2)}`,
      state: "starting",
      revision: 0,
      ...fields,
    });
  }

  describe("store: its methods", () => {
    it("has every method a store has", async () => {
      const store = await makeStore();
      for (const name of STORE_METHODS) assert.strictEqual(typeof store[name], "function", `${name} is missing`);
    });
  });

  describe("store: connections", () => {
    it("creates a row with its defaults and timestamps, and reads it back by its id as a string", async () => {
      const store = await makeStore();
      const made = await store.createConnection({ ownerType: "StoreTestAccount", ownerId: "1", name: null });
      assert.ok(made.id !== null && made.id !== undefined);
      assert.strictEqual(made.status, "pending");
      assert.strictEqual(made.qubeId, null);
      assert.strictEqual(made.revision, null);
      assert.ok(made.createdAt instanceof Date && made.updatedAt instanceof Date);
      const found = await store.getConnection(String(made.id));
      assert.strictEqual(String(found.id), String(made.id));
      assert.strictEqual(found.ownerType, "StoreTestAccount");
      assert.strictEqual(found.ownerId, "1");
    });

    it("answers null for an id that isn't there, or isn't an id at all", async () => {
      const store = await makeStore();
      await withConnection(store);
      for (const id of ["0", "999999999", "abc", "1; DROP TABLE qube_connections", ""]) {
        assert.strictEqual(await store.getConnection(id), null, `getConnection(${JSON.stringify(id)})`);
        assert.strictEqual(await store.getRun(id), null, `getRun(${JSON.stringify(id)})`);
      }
    });

    it("updates a row and answers it as written, or null for one that isn't there", async () => {
      const store = await makeStore();
      const made = await withConnection(store);
      const updated = await store.updateConnection(made.id, { qubeId: "q-1", status: "stalled", stallReason: "not_checking_in", revision: 3 });
      assert.strictEqual(updated.qubeId, "q-1");
      assert.strictEqual(updated.stallReason, "not_checking_in");
      assert.strictEqual(updated.revision, 3);
      assert.strictEqual((await store.getConnection(made.id)).status, "stalled");
      assert.strictEqual(await store.updateConnection("999999999", { status: "connected" }), null);
    });

    it("keeps qubeId unique, and lets any number of rows have none", async () => {
      const store = await makeStore();
      await withConnection(store, { qubeId: "q-1" });
      await rejectsConflict(() => withConnection(store, { qubeId: "q-1" }));
      await withConnection(store);
      await withConnection(store);
    });

    it("lists an owner's connections, newest first, and no one else's", async () => {
      const store = await makeStore();
      const first = await withConnection(store);
      await tick();
      const second = await withConnection(store);
      await withConnection(store, { ownerId: "2" });
      await withConnection(store, { ownerType: "Shop" });
      const listed = await store.ownedBy("StoreTestAccount", "1");
      assert.deepStrictEqual(listed.map((row) => String(row.id)), [String(second.id), String(first.id)]);
    });
  });

  describe("store: runs", () => {
    it("creates a row with its defaults, and keeps the JSON columns as they were written", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      const made = await store.createRun({
        connectionId: connection.id,
        operation: "create_invoice",
        recordType: "Invoice",
        recordId: "7",
        reference: "ref-1",
      });
      assert.strictEqual(made.state, "starting");
      assert.strictEqual(made.revision, 0);
      for (const field of ["qubeRunId", "input", "outcome", "error", "cancelReason", "endedAt", "question", "links", "runUrl", "cancelUrl"]) {
        assert.strictEqual(made[field], null, field);
      }
      const input = { operation: "invoice.create", params: { lines: [{ amount: 1.5 }], memo: "é ✓" } };
      const question = { token: "tok", choices: [{ id: "a", label: "A", fields: [] }] };
      const endedAt = new Date("2026-10-25T12:00:00.000Z");
      await store.updateRun(made.id, { input, error: "Customer not found", question, links: { decisions: "d", search: null }, endedAt });
      const found = await store.getRun(String(made.id));
      assert.deepStrictEqual(found.input, input);
      assert.strictEqual(found.error, "Customer not found");
      assert.deepStrictEqual(found.question, question);
      assert.deepStrictEqual(found.links, { decisions: "d", search: null });
      assert.strictEqual(found.endedAt.getTime(), endedAt.getTime());
      await store.updateRun(made.id, { error: { code: "x", message: "m", detail: "d" }, question: null });
      const again = await store.getRun(made.id);
      assert.deepStrictEqual(again.error, { code: "x", message: "m", detail: "d" });
      assert.strictEqual(again.question, null);
    });

    it("keeps reference unique", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      await withRun(store, connection, { reference: "ref-1" });
      await rejectsConflict(() => withRun(store, connection, { reference: "ref-1" }));
    });

    it("finds a record's newest run of an operation, and nothing for another record or operation", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      await withRun(store, connection);
      await tick();
      const newest = await withRun(store, connection);
      await withRun(store, connection, { operation: "sync_customer" });
      await withRun(store, connection, { recordId: "8" });
      await withRun(store, connection, { recordType: "Estimate" });
      assert.strictEqual(String((await store.latestRun("Invoice", "7", "create_invoice")).id), String(newest.id));
      assert.strictEqual(await store.latestRun("Invoice", "9", "create_invoice"), null);
    });

    it("finds a record's newest run of an operation on one connection, with connectionId", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      const other = await withConnection(store, { ownerId: "2" });
      const mine = await withRun(store, connection);
      await tick();
      const theirs = await withRun(store, other);
      const on = (c) => store.latestRun("Invoice", "7", "create_invoice", { connectionId: c.id });
      assert.strictEqual(String((await on(connection)).id), String(mine.id));
      assert.strictEqual(String((await on(other)).id), String(theirs.id));
      assert.strictEqual(String((await store.latestRun("Invoice", "7", "create_invoice", {})).id), String(theirs.id));
      const third = await withConnection(store, { ownerId: "3" });
      assert.strictEqual(await on(third), null);
    });
  });

  describe("store: transactions and locks", () => {
    it("rolls back what a transaction wrote when its function throws, and keeps it when it returns", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      await assert.rejects(
        store.transaction(async (tx) => {
          await tx.updateConnection(connection.id, { status: "stalled" });
          await tx.createRun({ connectionId: connection.id, operation: "x", recordType: "Invoice", recordId: "7", reference: "rolled-back" });
          throw new Error("boom");
        }),
        /boom/
      );
      assert.strictEqual((await store.getConnection(connection.id)).status, "connected");
      assert.strictEqual(await store.latestRun("Invoice", "7", "x"), null);

      const kept = await store.transaction((tx) => tx.updateConnection(connection.id, { status: "setup_cancelled" }));
      assert.strictEqual(kept.status, "setup_cancelled");
      assert.strictEqual((await store.getConnection(connection.id)).status, "setup_cancelled");
    });

    it("rolls a nested transaction back alone, and the outer one with everything in it", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      await store.transaction(async (tx) => {
        await tx.updateConnection(connection.id, { name: "outer" });
        await assert.rejects(
          tx.transaction(async (inner) => {
            await inner.updateConnection(connection.id, { status: "stalled" });
            throw new Error("inner");
          }),
          /inner/
        );
      });
      const after = await store.getConnection(connection.id);
      assert.strictEqual(after.name, "outer");
      assert.strictEqual(after.status, "connected");

      await assert.rejects(
        store.transaction(async (tx) => {
          await tx.transaction((inner) => inner.updateConnection(connection.id, { status: "stalled" }));
          throw new Error("outer");
        }),
        /outer/
      );
      assert.strictEqual((await store.getConnection(connection.id)).status, "connected");
    });

    it("hands withRunLock and withConnectionLock the row as it is now, or null", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      const made = await withRun(store, connection);
      await store.updateRun(made.id, { revision: 4 });
      await store.withRunLock(String(made.id), async (tx, row) => {
        assert.strictEqual(row.revision, 4);
        await tx.updateRun(row.id, { revision: 5 });
      });
      assert.strictEqual((await store.getRun(made.id)).revision, 5);
      await store.withConnectionLock(String(connection.id), async (tx, row) => {
        assert.strictEqual(row.status, "connected");
      });
      assert.strictEqual(await store.withRunLock("999999999", async (tx, row) => row), null);
      assert.strictEqual(await store.withConnectionLock("999999999", async (tx, row) => row), null);
    });

    it("rolls back what a lock's function wrote when it throws", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      const made = await withRun(store, connection);
      await assert.rejects(
        store.withRunLock(made.id, async (tx) => {
          await tx.updateRun(made.id, { revision: 9 });
          throw new Error("boom");
        }),
        /boom/
      );
      assert.strictEqual((await store.getRun(made.id)).revision, 0);
    });

    for (const [name, lock] of [
      ["withRunLock", (store, row) => (fn) => store.withRunLock(row.run.id, fn)],
      ["withConnectionLock", (store, row) => (fn) => store.withConnectionLock(row.connection.id, fn)],
    ]) {
      it(`holds one ${name} at a time per row, and takes it again inside its own transaction`, async () => {
        const store = await makeStore();
        const connection = await withConnection(store);
        const run = await withRun(store, connection);
        const locked = lock(store, { run, connection });
        const order = [];
        const release = deferred();
        const first = locked(async (tx) => {
          order.push("first in");
          await release.promise;
          // Again, inside the transaction that holds it: no deadlock.
          await lock(tx, { run, connection })(async () => order.push("first again"));
          order.push("first out");
        });
        await tick();
        const second = locked(async () => order.push("second in"));
        await tick();
        assert.deepStrictEqual(order, ["first in"]);
        release.resolve();
        await Promise.all([first, second]);
        assert.deepStrictEqual(order, ["first in", "first again", "first out", "second in"]);
      });
    }
  });

  describe("store: notifications", () => {
    it("runs once per run and delivery id, and answers whether it ran", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      const run = await withRun(store, connection);
      const other = await withRun(store, connection);
      const ran = [];
      assert.strictEqual(await store.once(run.id, "d-1", async () => ran.push("first")), true);
      assert.strictEqual(await store.once(run.id, "d-1", async () => ran.push("again")), false);
      assert.strictEqual(await store.once(other.id, "d-1", async () => ran.push("other run")), true);
      assert.strictEqual(await store.once(run.id, "d-2", async () => ran.push("other delivery")), true);
      assert.deepStrictEqual(ran, ["first", "other run", "other delivery"]);
    });

    it("leaves nothing taken when the function throws, so the redelivery runs it", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      const run = await withRun(store, connection);
      await assert.rejects(store.once(run.id, "d-1", async () => Promise.reject(new Error("handler"))), /handler/);
      let ran = 0;
      assert.strictEqual(await store.once(run.id, "d-1", async () => (ran += 1)), true);
      assert.strictEqual(ran, 1);
    });

    it("takes it in the run lock's transaction: rolled back with it", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      const run = await withRun(store, connection);
      await assert.rejects(
        store.withRunLock(run.id, async (tx) => {
          await tx.once(run.id, "d-1", async () => {});
          throw new Error("after");
        }),
        /after/
      );
      let ran = 0;
      await store.withRunLock(run.id, (tx) => tx.once(run.id, "d-1", async () => (ran += 1)));
      assert.strictEqual(ran, 1);
    });
  });

  describe("store: QuickBooks records", () => {
    async function record(store, connection, fields) {
      return store.createQuickbooksRecord({ connectionId: connection.id, kind: "customer", list: "name", qbId: "80000001-1", ...fields });
    }

    it("creates rows with their defaults, finds them by any of their fields, and keeps their order", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      const first = await record(store, connection, { recordType: "Customer", recordId: "1", editSequence: "171", name: "Riverbend" });
      const second = await record(store, connection, { kind: "item_service", list: "item", qbId: "80000001-1" });
      assert.strictEqual(second.editSequence, null);
      assert.strictEqual(second.recordType, null);
      assert.strictEqual(second.recordId, null);
      const all = await store.findQuickbooksRecords({ connectionId: connection.id });
      assert.deepStrictEqual(all.map((row) => String(row.id)), [String(first.id), String(second.id)]);
      const byQbId = await store.findQuickbooksRecords({ connectionId: connection.id, qbId: "80000001-1" }, { limit: 1 });
      assert.strictEqual(byQbId.length, 1);
      const byRecord = await store.findQuickbooksRecords({ connectionId: connection.id, kind: "customer", recordType: "Customer", recordId: "1" });
      assert.strictEqual(byRecord[0].editSequence, "171");
      assert.strictEqual(byRecord[0].name, "Riverbend");
      assert.deepStrictEqual(await store.findQuickbooksRecords({ connectionId: connection.id, list: "account" }), []);
      const locked = await store.findQuickbooksRecords({ connectionId: connection.id, list: "item", qbId: "80000001-1" }, { limit: 1, lock: true });
      assert.strictEqual(String(locked[0].id), String(second.id));
    });

    it("keeps a qbId unique per connection and family, and a record's kind unique per connection", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      const other = await withConnection(store, { ownerId: "2" });
      await record(store, connection, { recordType: "Customer", recordId: "1" });
      await rejectsConflict(() => record(store, connection, { kind: "vendor" }));
      await rejectsConflict(() => record(store, connection, { qbId: "80000002-1", recordType: "Customer", recordId: "1" }));
      await record(store, other, { recordType: "Customer", recordId: "1" });
      await record(store, connection, { kind: "account", list: "account" });
      await record(store, connection, { kind: "vendor", qbId: "80000002-1", recordType: "Customer", recordId: "1" });
      // Rows with no record never clash on the record key.
      await record(store, connection, { qbId: "80000003-1" });
      await record(store, connection, { qbId: "80000004-1" });
    });

    it("updates and deletes a row", async () => {
      const store = await makeStore();
      const connection = await withConnection(store);
      const made = await record(store, connection);
      const updated = await store.updateQuickbooksRecord(made.id, { kind: "vendor", editSequence: "172", recordType: "Customer", recordId: "1" });
      assert.strictEqual(updated.kind, "vendor");
      assert.strictEqual(updated.editSequence, "172");
      await rejectsConflict(async () => {
        const second = await record(store, connection, { qbId: "80000002-1" });
        await store.updateQuickbooksRecord(second.id, { qbId: "80000001-1" });
      });
      await store.deleteQuickbooksRecord(made.id);
      assert.deepStrictEqual(await store.findQuickbooksRecords({ connectionId: connection.id, qbId: "80000001-1" }), []);
    });
  });

  describe("store: sync status on it", () => {
    const { SyncStatus } = require("./sync-status");

    async function connectionOn(store, fields) {
      const { Connection } = require("./records");
      return new Connection(await withConnection(store, fields), store);
    }

    it("reads the latest run and the newest link on the connection", async () => {
      const store = await makeStore();
      const connection = await connectionOn(store);
      const elsewhere = await connectionOn(store, { ownerId: "2" });
      const invoice = new StoreTestInvoice(7);
      const status = () => SyncStatus.for(connection, invoice, "create_invoice");
      assert.strictEqual((await status()).status, "not_sent");
      const run = await withRun(store, connection, { recordType: "StoreTestInvoice", state: "awaiting_input" });
      await withRun(store, elsewhere, { recordType: "StoreTestInvoice", state: "running" });
      assert.strictEqual((await status()).status, "needs_answer");
      await store.updateRun(run.id, { state: "completed", outcome: "added", endedAt: new Date() });
      await tick();
      await connection.link(invoice, { kind: "invoice", qbId: "T1" });
      const linked = await status();
      assert.deepStrictEqual([linked.status, linked.qbId], ["in_quickbooks", "T1"]);
      assert.strictEqual((await SyncStatus.for(elsewhere, invoice, "create_invoice")).status, "sending");
    });

    it("says failed after a link when the latest run failed since", async () => {
      const store = await makeStore();
      const connection = await connectionOn(store);
      const invoice = new StoreTestInvoice(7);
      await connection.link(invoice, { kind: "invoice", qbId: "T1" });
      await tick();
      await withRun(store, connection, { recordType: "StoreTestInvoice", state: "failed", endedAt: new Date(), error: "Refused" });
      const status = await SyncStatus.for(connection, invoice, "create_invoice");
      assert.deepStrictEqual([status.status, status.qbId, status.error, status.retry], ["failed", "T1", "Refused", false]);
    });

    // Only with options.query: a store without SQL (memoryStore) has no database to ask.
    const sqlIt = options && options.query ? it : () => {};
    sqlIt("has SQL conditions for list pages, one EXISTS each, on the store's database", async () => {
      const dialect = options.dialect || "postgres";
      const store = await makeStore();
      const query = (sql) => options.query(store, sql);
      await query("CREATE TABLE IF NOT EXISTS qube_store_test_invoices (id integer PRIMARY KEY)");
      await query("DELETE FROM qube_store_test_invoices");
      await query("INSERT INTO qube_store_test_invoices (id) VALUES (1), (2), (3), (4)");
      const connection = await connectionOn(store);
      const elsewhere = await connectionOn(store, { ownerId: "2" });
      await connection.link(new StoreTestInvoice(1), { kind: "invoice", qbId: "T1" });
      await elsewhere.link(new StoreTestInvoice(2), { kind: "invoice", qbId: "T2" });
      const run = (id, state, on = connection) => withRun(store, on, { recordType: "StoreTestInvoice", recordId: String(id), state });
      await run(2, "awaiting_input");
      await run(3, "running");
      await run(4, "starting");
      await run(4, "completed");
      await run(1, "awaiting_input", elsewhere);
      const scope = { recordType: "StoreTestInvoice", dialect, operation: "create_invoice" };
      const ids = async (condition) =>
        (await query(`SELECT id FROM qube_store_test_invoices WHERE ${condition} ORDER BY id`)).map((row) => Number(row.id));
      try {
        assert.deepStrictEqual(await ids(connection.inQuickbooksSql("qube_store_test_invoices", scope)), [1]);
        assert.deepStrictEqual(await ids(connection.notInQuickbooksSql("qube_store_test_invoices", scope)), [2, 3, 4]);
        assert.deepStrictEqual(await ids(connection.needingAnswerSql("qube_store_test_invoices", scope)), [2]);
        assert.deepStrictEqual(await ids(connection.sendingSql("qube_store_test_invoices", scope)), [3, 4]);
        assert.deepStrictEqual(await ids(elsewhere.needingAnswerSql("qube_store_test_invoices", scope)), [1]);
      } finally {
        await query("DROP TABLE qube_store_test_invoices");
      }
    });
  });

  describe("store: the kit's link rules on it", () => {
    async function connectionOn(store, fields) {
      const { Connection } = require("./records");
      return new Connection(await withConnection(store, fields), store);
    }

    it("links a record by kind, and reads it back both ways", async () => {
      const store = await makeStore();
      const connection = await connectionOn(store);
      const customer = new StoreTestCustomer(1);
      await connection.link(customer, { kind: "customer", qbId: "80000001-1", editSequence: "171", name: "Riverbend" });
      assert.strictEqual(await connection.qbIdFor(customer, { kind: "customer" }), "80000001-1");
      const row = await connection.quickbooksRecord("80000001-1", { kind: "customer" });
      assert.deepStrictEqual([row.kind, row.list, row.editSequence, row.name, row.recordType, row.recordId], ["customer", "name", "171", "Riverbend", "StoreTestCustomer", "1"]);
    });

    it("replaces a record's id for a kind, moves an id between records, and keeps connections apart", async () => {
      const store = await makeStore();
      const connection = await connectionOn(store);
      const second = await connectionOn(store, { ownerId: "2" });
      const a = new StoreTestCustomer(1);
      const b = new StoreTestCustomer(2);
      await connection.link(a, { kind: "customer", qbId: "Q1" });
      await connection.link(a, { kind: "customer", qbId: "Q2" });
      assert.strictEqual(await connection.qbIdFor(a, { kind: "customer" }), "Q2");
      await connection.link(b, { kind: "customer", qbId: "Q2" });
      assert.strictEqual(await connection.qbIdFor(a, { kind: "customer" }), null);
      assert.strictEqual(await connection.qbIdFor(b, { kind: "customer" }), "Q2");
      await second.link(a, { kind: "customer", qbId: "Q2" });
      assert.strictEqual(await second.qbIdFor(a, { kind: "customer" }), "Q2");
      assert.strictEqual((await store.findQuickbooksRecords({ connectionId: connection.id })).length, 1);
    });

    it("falls back within the item family, never the name family, and changes an item's kind", async () => {
      const store = await makeStore();
      const connection = await connectionOn(store);
      const item = new StoreTestItem(5);
      const contact = new StoreTestCustomer(1);
      await connection.link(item, { kind: "item_service", qbId: "I1" });
      assert.strictEqual(await connection.qbIdFor(item, { kind: "item" }), "I1");
      assert.strictEqual(await connection.qbIdFor(item, { kind: "item_non_inventory" }), "I1");
      await connection.link(item, { kind: "item_non_inventory", qbId: "I1" });
      assert.strictEqual((await connection.quickbooksRecord("I1")).kind, "item_non_inventory");
      await connection.link(contact, { kind: "customer", qbId: "N1" });
      assert.strictEqual(await connection.qbIdFor(contact, { kind: "vendor" }), null);
      await connection.link(contact, { kind: "account", qbId: "N1" });
      await assert.rejects(connection.quickbooksRecord("N1"), /more than one kind \(account, customer\)/);
    });
  });
}

module.exports = storeTests;
module.exports.storeTests = storeTests;
