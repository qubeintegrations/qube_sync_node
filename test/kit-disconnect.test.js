"use strict";

// Disconnecting a connection, sync marks and opt-in pruning. The routes are
// test/express.test.js's.

const { describe, it: nodeIt } = require("node:test");
const assert = require("node:assert");

const support = require("./kit-support");
const { kit, fake, answer, data, apiError, tables, calls, CreateInvoice, Events, reset, makeConnection, makeRun, runBody } = support;

const it = (name, fn) => support.it(nodeIt, name, fn);

const DAY = kit.DAY_MS;

async function fixtures() {
  const account = tables.Account.add({ name: "Riverbend" });
  const connection = await makeConnection(account);
  const invoice = tables.Invoice.add({ accountId: account.id, number: "1001" });
  return { account, connection, invoice };
}

function store() {
  return kit.settings().store;
}

async function makeRequest(record, connection, fields = {}) {
  return store().createRequest({
    connectionId: connection.id,
    operation: "find_customer",
    recordType: record.constructor.name,
    recordId: String(record.id),
    reference: `find_customer-${record.id}-${Math.random()}`,
    ...fields,
  });
}

describe("kit: disconnectQuickbooks", () => {
  it("deletes QuBe Sync's connection, then the row with its runs, requests, links and sync marks, after disconnected()", async () => {
    const seen = [];
    class Cleanup extends Events {
      async disconnected() {
        // In the transaction, before the kit's rows go.
        seen.push([this.connection.id, (await this.store.getConnection(this.connection.id)) !== null]);
      }
    }
    reset({ connectionEvents: Cleanup });
    const { account, connection, invoice } = await fixtures();
    const other = await makeConnection(account, { qubeId: "conn-other" });
    const run = await makeRun(invoice, connection, { state: "completed" });
    await store().once(run.id, "d-1", async () => {});
    const request = await makeRequest(invoice, connection, { endedAt: new Date(), state: "response_received" });
    await store().takeRequestDelivery(request.id, "pr-1:response_received", { page: 1, state: "response_received" });
    await connection.link(invoice, { kind: "invoice", qbId: "T1" });
    await store().advanceSyncMark(connection.id, "add_transaction", new Date());
    await other.link(invoice, { kind: "invoice", qbId: "T1" });
    answer({ status: 204 });

    const result = await kit.disconnectQuickbooks({ request: { account }, id: String(connection.id) });

    assert.deepStrictEqual(result, { status: 303 });
    assert.deepStrictEqual([fake.received[0].method, fake.received[0].path], ["DELETE", `/api/v2/connections/${connection.qubeId}`]);
    assert.deepStrictEqual(seen, [[connection.id, true]]);
    assert.strictEqual(await store().getConnection(connection.id), null);
    assert.strictEqual(await store().getRun(run.id), null);
    assert.strictEqual(await store().getRequest(request.id), null);
    assert.deepStrictEqual(await store().findRequestDeliveries(request.id), []);
    assert.deepStrictEqual(await store().findQuickbooksRecords({ connectionId: connection.id }), []);
    assert.strictEqual(await store().getSyncMark(connection.id, "add_transaction"), null);
    // Another connection keeps its own.
    assert.strictEqual(await other.qbIdFor(invoice, { kind: "invoice" }), "T1");
  });

  it("counts a connection QuBe Sync no longer has (404) as gone", async () => {
    reset();
    const { account, connection } = await fixtures();
    answer(apiError(404, "not found"));
    assert.deepStrictEqual(await kit.disconnectQuickbooks({ request: { account }, id: connection.id }), { status: 303 });
    assert.strictEqual(await store().getConnection(connection.id), null);
  });

  it("asks QuBe Sync nothing for a row it never made", async () => {
    reset();
    const { account } = await fixtures();
    const pending = await kit.Connection.create(account);
    assert.deepStrictEqual(await kit.disconnectQuickbooks({ request: { account }, id: pending.id }), { status: 303 });
    assert.strictEqual(fake.received.length, 0);
    assert.strictEqual(await store().getConnection(pending.id), null);
  });

  it("refuses while a run or a request hasn't ended, and deletes nothing", async () => {
    reset();
    const { account, connection, invoice } = await fixtures();
    const run = await makeRun(invoice, connection, { state: "awaiting_input" });
    let result = await kit.disconnectQuickbooks({ request: { account }, id: connection.id });
    assert.deepStrictEqual(result, { status: 303, error: kit.RUNS_GOING });
    assert.strictEqual(kit.RUNS_GOING, "It has a run or request that hasn't ended: wait for it, or answer its question, first.");

    await run.update({ state: "completed" });
    await makeRequest(invoice, connection, { state: "retryable" });
    result = await kit.disconnectQuickbooks({ request: { account }, id: connection.id });
    assert.deepStrictEqual(result, { status: 303, error: kit.RUNS_GOING });
    assert.strictEqual(fake.received.length, 0);
    assert.ok(await store().getConnection(connection.id));
  });

  it("keeps everything and says so when QuBe Sync doesn't answer, and throws for anything else it answers", async () => {
    reset();
    const { account, connection } = await fixtures();
    answer({ destroy: true });
    const result = await kit.disconnectQuickbooks({ request: { account }, id: connection.id });
    assert.deepStrictEqual(result, { status: 303, error: kit.DISCONNECT_NO_ANSWER });
    assert.ok(await store().getConnection(connection.id));
    answer(apiError(403, "forbidden"));
    await assert.rejects(kit.disconnectQuickbooks({ request: { account }, id: connection.id }), (err) => err.status === 403);
    assert.ok(await store().getConnection(connection.id));
  });

  it("rolls everything back when disconnected() throws", async () => {
    class Broken extends Events {
      async disconnected() {
        throw new Error("app rows");
      }
    }
    reset({ connectionEvents: Broken });
    const { account, connection, invoice } = await fixtures();
    await connection.link(invoice, { kind: "invoice", qbId: "T1" });
    answer({ status: 204 });
    await assert.rejects(kit.disconnectQuickbooks({ request: { account }, id: connection.id }), /app rows/);
    assert.ok(await store().getConnection(connection.id));
    assert.strictEqual(await connection.qbIdFor(invoice, { kind: "invoice" }), "T1");
  });

  it("answers 404 for another account's connection or one that isn't there, and 401 with no account", async () => {
    reset();
    const { connection } = await fixtures();
    const other = tables.Account.add();
    for (const id of [connection.id, 999, "abc"]) {
      assert.deepStrictEqual(await kit.disconnectQuickbooks({ request: { account: other }, id }), { status: 404 }, String(id));
    }
    assert.deepStrictEqual(await kit.disconnectQuickbooks({ request: {}, id: connection.id }), { status: 401 });
    assert.strictEqual(fake.received.length, 0);
  });
});

describe("kit: sync marks", () => {
  it("advance to the run's created_at on every completed run, never back", async () => {
    reset();
    const { connection, invoice } = await fixtures();
    assert.strictEqual(await connection.lastSyncedAt("add_transaction"), null);
    const older = await makeRun(invoice, connection, { state: "running" });
    await new Promise((resolve) => setTimeout(resolve, 10));
    const newer = await makeRun(invoice, connection, { state: "running", reference: "newer" });

    await kit.run({ kind: "run", id: String(newer.id), body: runBody("workflow_run.completed", newer) });
    assert.strictEqual((await connection.lastSyncedAt("add_transaction")).getTime(), newer.createdAt.getTime());
    // Completing out of order leaves it where it is.
    await kit.run({ kind: "run", id: String(older.id), body: runBody("workflow_run.completed", older) });
    assert.strictEqual((await connection.lastSyncedAt("add_transaction")).getTime(), newer.createdAt.getTime());
    assert.strictEqual(await connection.lastSyncedAt("ensure_customer"), null);
  });

  it("don't move for a failed run, and an operation reads its own workflow's", async () => {
    reset();
    const { connection, invoice } = await fixtures();
    const run = await makeRun(invoice, connection);
    await kit.run({ kind: "run", id: String(run.id), body: runBody("workflow_run.failed", run) });
    assert.strictEqual(await connection.lastSyncedAt("add_transaction"), null);

    const done = await makeRun(invoice, connection, { reference: "done" });
    await kit.run({ kind: "run", id: String(done.id), body: runBody("workflow_run.completed", done) });
    const operation = new CreateInvoice(invoice, await kit.Run.get(done.id));
    assert.strictEqual((await operation.lastSyncedAt()).getTime(), done.createdAt.getTime());
    assert.ok(calls.some((call) => call[0] === "ended"));
  });
});

describe("kit: pruneRuns", () => {
  it("does nothing until pruneRunsAfter is set", async () => {
    reset();
    const { connection, invoice } = await fixtures();
    const run = await makeRun(invoice, connection, { state: "completed", endedAt: new Date(Date.now() - 400 * DAY) });
    assert.deepStrictEqual(await kit.pruneRuns(), { runs: 0, requests: 0 });
    assert.ok(await store().getRun(run.id));
  });

  it("deletes ended runs and requests older than the setting, with their notifications and deliveries, and keeps links and marks", async () => {
    reset({ pruneRunsAfter: 30 * DAY });
    const { connection, invoice } = await fixtures();
    const now = new Date();
    const later = new Date(now.getTime() + 40 * DAY);
    const oldDone = await makeRun(invoice, connection, { state: "completed", endedAt: now });
    await store().once(oldDone.id, "d-1", async () => {});
    // Failed before it started: no endedAt, so its updatedAt counts.
    const failedAtStart = await makeRun(invoice, connection, { state: "failed" });
    const going = await makeRun(invoice, connection, { state: "running" });
    const recent = await makeRun(invoice, connection, { state: "completed", endedAt: new Date(now.getTime() + 39 * DAY) });
    const oldRequest = await makeRequest(invoice, connection, { state: "response_received", endedAt: now });
    await store().takeRequestDelivery(oldRequest.id, "pr-1:response_received", { page: 1, state: "response_received" });
    const goingRequest = await makeRequest(invoice, connection, { state: "retryable" });
    await connection.link(invoice, { kind: "invoice", qbId: "T1" });
    await store().advanceSyncMark(connection.id, "add_transaction", now);

    assert.deepStrictEqual(await kit.pruneRuns({ now: later }), { runs: 2, requests: 1 });

    assert.strictEqual(await store().getRun(oldDone.id), null);
    assert.strictEqual(await store().getRun(failedAtStart.id), null);
    assert.ok(await store().getRun(going.id));
    assert.ok(await store().getRun(recent.id));
    assert.strictEqual(await store().once(oldDone.id, "d-1", async () => {}), true); // its notification went with it
    assert.strictEqual(await store().getRequest(oldRequest.id), null);
    assert.deepStrictEqual(await store().findRequestDeliveries(oldRequest.id), []);
    assert.ok(await store().getRequest(goingRequest.id));
    assert.strictEqual(await connection.qbIdFor(invoice, { kind: "invoice" }), "T1");
    assert.ok(await connection.lastSyncedAt("add_transaction"));
  });

  it("never prunes within a day of an ending, and works through more than one batch", async () => {
    reset({ pruneRunsAfter: DAY });
    const { connection, invoice } = await fixtures();
    const now = new Date();
    for (let i = 0; i < 501; i += 1) {
      await makeRun(invoice, connection, { state: "completed", endedAt: now, reference: `r-${i}` });
    }
    assert.deepStrictEqual(await kit.pruneRuns({ now: new Date(now.getTime() + DAY - 1000) }), { runs: 0, requests: 0 });
    assert.deepStrictEqual(await kit.pruneRuns({ now: new Date(now.getTime() + DAY + 1000) }), { runs: 501, requests: 0 });
  });

  it("asks QuBe Sync nothing", async () => {
    reset({ pruneRunsAfter: DAY });
    answer(data({}));
    await kit.pruneRuns();
    assert.strictEqual(fake.received.length, 0);
  });
});
