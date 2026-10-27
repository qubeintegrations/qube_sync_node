"use strict";

// Plain v2 requests (PlainRequest): queueing one under the connection's lock, and the job for its
// webhooks, taken once per page_request_id:state.

const { describe, it: nodeIt } = require("node:test");
const assert = require("node:assert");

const support = require("./kit-support");
const { kit, fake, answer, data, apiError, loggedText, tables, calls, FindCustomer, reset, makeConnection, vectorBody } = support;

const it = (name, fn) => support.it(nodeIt, name, fn);

const QUBE_ID = "0196a1c0-0000-7000-8000-00000000e001";

async function fixtures() {
  const account = tables.Account.add({ name: "Riverbend" });
  const connection = await makeConnection(account);
  const customer = tables.Customer.add({ name: "Northwind Builders" });
  return { account, connection, customer };
}

async function makeRequest(customer, connection, fields = {}) {
  const row = await kit.settings().store.createRequest({
    connectionId: connection.id,
    operation: "find_customer",
    recordType: "Customer",
    recordId: String(customer.id),
    reference: `find_customer-${customer.id}-${Math.random()}`,
    state: "queued",
    qubeId: QUBE_ID,
    params: { full_name: customer.name },
    ...fields,
  });
  return kit.QueuedRequest.load(row);
}

async function deliver(row, name, changes = {}) {
  await kit.run({ kind: "request", id: String(row.id), body: vectorBody(name, { id: QUBE_ID, ...changes }) });
  return kit.QueuedRequest.get(row.id);
}

function page(number, iterationState, state = "response_received") {
  return { page: number, page_request_id: `pr-${number}`, iteration_state: iterationState, state };
}

describe("kit: PlainRequest.queue", () => {
  it("writes the row first, queues the operation with its reference as the Idempotency-Key and its webhook URL", async () => {
    reset();
    const { connection, customer } = await fixtures();
    answer(data({ id: "req-q-1", state: "queued" }, 202));
    const queued = await FindCustomer.queue(customer, connection);
    assert.ok(queued instanceof kit.QueuedRequest);
    assert.strictEqual(queued.reused, false);
    const row = await kit.QueuedRequest.get(queued.id);
    assert.deepStrictEqual(
      [row.operation, row.recordType, row.recordId, row.qubeId, row.state, row.params, row.endedAt],
      ["find_customer", "Customer", String(customer.id), "req-q-1", "queued", { full_name: "Northwind Builders" }, null]
    );
    assert.match(row.reference, new RegExp(`^find_customer-${customer.id}-`));
    assert.strictEqual(row.webhookUrl(), `${support.WEBHOOK_URL}/requests/${row.id}`);
    const sent = fake.received[0];
    assert.strictEqual(sent.method, "GET");
    assert.strictEqual(sent.path, `/api/v2/connections/${connection.qubeId}/customers`);
    assert.strictEqual(sent.headers["idempotency-key"], row.reference);
    assert.deepStrictEqual(sent.query, { webhook_url: row.webhookUrl(), full_name: "Northwind Builders" });
  });

  it("returns the record's request that hasn't ended, queueing nothing new, and a new reference once it ends", async () => {
    reset();
    const { connection, customer } = await fixtures();
    answer(data({ id: "req-q-1", state: "queued" }, 202));
    const first = await FindCustomer.queue(customer, connection);
    await first.update({ state: "retryable" });
    const again = await FindCustomer.queue(customer, connection);
    assert.strictEqual(String(again.id), String(first.id));
    assert.strictEqual(again.reused, true);
    assert.strictEqual(fake.received.length, 1);

    await first.update({ state: "response_received", endedAt: new Date() });
    const later = await FindCustomer.queue(customer, connection);
    assert.notStrictEqual(String(later.id), String(first.id));
    assert.notStrictEqual(later.reference, first.reference);
  });

  it("sends an unconfirmed queue again with its own reference and params", async () => {
    reset();
    const { connection, customer } = await fixtures();
    answer(apiError(500, "boom"));
    await assert.rejects(FindCustomer.queue(customer, connection), (err) => err.status === 500);
    const first = await kit.QueuedRequest.get((await kit.settings().store.latestRequest("Customer", String(customer.id), "find_customer")).id);
    assert.deepStrictEqual([first.state, first.qubeId], ["queued", null]);

    customer.name = "Renamed since"; // the resend still sends what the first did
    fake.received = [];
    answer(data({ id: "req-q-1", state: "queued" }, 202));
    const again = await FindCustomer.queue(customer, connection);
    assert.strictEqual(String(again.id), String(first.id));
    assert.strictEqual(again.qubeId, "req-q-1");
    assert.strictEqual(fake.received.length, 1);
    assert.strictEqual(fake.received[0].headers["idempotency-key"], first.reference);
    assert.strictEqual(fake.received[0].query.full_name, "Northwind Builders");
    // Confirmed now: nothing is sent.
    await (await kit.QueuedRequest.get(first.id)).retryQueue();
    assert.strictEqual(fake.received.length, 1);
  });

  it("marks the row failed and throws when QuBe Sync refuses the queue (a 4xx)", async () => {
    reset();
    const { connection, customer } = await fixtures();
    answer(apiError(422, { detail: "bad params" }));
    await assert.rejects(FindCustomer.queue(customer, connection), (err) => err.status === 422);
    const row = await kit.settings().store.latestRequest("Customer", String(customer.id), "find_customer");
    assert.deepStrictEqual([row.state, row.qubeId], ["failed", null]);
    assert.ok(row.endedAt instanceof Date);
  });

  it("leaves a queue answered 409 (its key in use by the other click) queued", async () => {
    reset();
    const { connection, customer } = await fixtures();
    answer(apiError(409, "in use"));
    await assert.rejects(FindCustomer.queue(customer, connection), (err) => err.status === 409);
    const row = await kit.settings().store.latestRequest("Customer", String(customer.id), "find_customer");
    assert.deepStrictEqual([row.state, row.endedAt], ["queued", null]);
  });

  it("marks the row failed when its params throw, before anything is sent", async () => {
    reset();
    const { connection, customer } = await fixtures();
    class Broken extends FindCustomer {
      params() {
        throw new Error("no name");
      }
    }
    await assert.rejects(Broken.queue(customer, connection), /no name/);
    const row = await kit.settings().store.latestRequest("Customer", String(customer.id), "find_customer");
    assert.strictEqual(row.state, "failed");
    assert.strictEqual(fake.received.length, 0);
  });

  it("refuses a connection QuBe Sync hasn't made yet", async () => {
    reset();
    const { account, customer } = await fixtures();
    const pending = await kit.Connection.create(account);
    await assert.rejects(FindCustomer.queue(customer, pending), (err) => err instanceof kit.NotConnected);
  });

  it("finds one row for two queues at once (a double click)", async () => {
    reset();
    const { connection, customer } = await fixtures();
    answer(data({ id: "req-q-1", state: "queued" }, 202));
    const [a, b] = await Promise.all([FindCustomer.queue(customer, connection), FindCustomer.queue(customer, connection)]);
    assert.strictEqual(String(a.id), String(b.id));
  });
});

describe("kit: a plain request's webhooks", () => {
  it("hands an answer to answered, then done, and ends the row", async () => {
    reset();
    const { connection, customer } = await fixtures();
    const row = await deliver(await makeRequest(customer, connection), "request: an answer");
    assert.deepStrictEqual(calls, [
      ["answered", 1],
      ["done", 1],
    ]);
    assert.deepStrictEqual([row.state, row.pagesAnswered, row.lastPage, row.error], ["response_received", 1, 1, null]);
    assert.strictEqual(row.done(), true);
  });

  it("takes a delivery once, by page_request_id and state", async () => {
    reset();
    const { connection, customer } = await fixtures();
    const made = await makeRequest(customer, connection);
    await deliver(made, "request: an answer");
    await deliver(made, "request: an answer");
    assert.deepStrictEqual(calls, [
      ["answered", 1],
      ["done", 1],
    ]);
    assert.strictEqual((await kit.settings().store.findRequestDeliveries(made.id)).length, 1);
  });

  it("calls done once every page 1..N is in, whatever order they come in", async () => {
    reset();
    const { connection, customer } = await fixtures();
    const made = await makeRequest(customer, connection);
    await deliver(made, "request: a page of a paginated query", page(3, "done"));
    let row = await deliver(made, "request: a page of a paginated query", page(1, "continue"));
    assert.strictEqual(row.ended(), false);
    assert.deepStrictEqual([row.pagesAnswered, row.lastPage, row.state], [2, 3, "response_received"]);
    await deliver(made, "request: a page of a paginated query", page(2, "continue"));
    row = await deliver(made, "request: a page of a paginated query", page(2, "continue")); // a retry
    assert.deepStrictEqual(calls, [
      ["answered", 3],
      ["answered", 1],
      ["answered", 2],
      ["done", 3],
    ]);
    assert.strictEqual(row.done(), true);
  });

  it("keeps a retryable as not final, and skips one that comes after its page's answer", async () => {
    reset();
    const { connection, customer } = await fixtures();
    const made = await makeRequest(customer, connection);
    let row = await deliver(made, "request: QuickBooks refused it", page(1, "not_applicable", "retryable"));
    assert.deepStrictEqual([row.state, row.endedAt], ["retryable", null]);
    assert.ok(row.error.user_message);
    await deliver(made, "request: an answer", page(1, "not_applicable"));
    row = await deliver(made, "request: QuickBooks refused it", { ...page(1, "not_applicable", "retryable"), page_request_id: "pr-1-late" });
    assert.deepStrictEqual(calls, [
      ["retrying", 1],
      ["answered", 1],
      ["done", 1],
    ]);
    assert.strictEqual(row.state, "response_received");
  });

  it("ends the row on an error, keeping the error, and hands it to failed", async () => {
    reset();
    const { connection, customer } = await fixtures();
    const row = await deliver(await makeRequest(customer, connection), "request: QuickBooks refused it");
    assert.deepStrictEqual(calls, [["failed", "error"]]);
    assert.strictEqual(row.state, "error");
    assert.strictEqual(row.ended(), true);
    assert.strictEqual(row.error.error_code, 3100);
  });

  it("hands a timed_out to failed by default, and to timedOut when the class writes one", async () => {
    reset();
    const { connection, customer } = await fixtures();
    const row = await deliver(await makeRequest(customer, connection), "request: an answer that never came back");
    assert.deepStrictEqual(calls, [["failed", "timed_out"]]);
    assert.strictEqual(row.state, "timed_out");

    class Careful extends FindCustomer {
      async timedOut(event) {
        calls.push(["timedOut", event.state]);
      }
    }
    reset({ operations: { find_customer: Careful } });
    const again = await fixtures();
    await deliver(await makeRequest(again.customer, again.connection), "request: an answer that never came back");
    assert.deepStrictEqual(calls, [["timedOut", "timed_out"]]);
  });

  it("skips an event whose id isn't the row's qubeId, and one that isn't a request's", async () => {
    reset();
    const { connection, customer } = await fixtures();
    const made = await makeRequest(customer, connection);
    const row = await deliver(made, "request: an answer", { id: "someone-elses" });
    await kit.run({ kind: "request", id: String(made.id), body: vectorBody("workflow_run.completed") });
    assert.deepStrictEqual(calls, []);
    assert.strictEqual(row.state, "queued");
    assert.match(loggedText(), /skipped request "someone-elses": not this request/);
    assert.match(loggedText(), /skipped workflow_run .*not this request/);
  });

  it("takes the id from the first event when the queue's answer hasn't come back yet, and keeps it", async () => {
    reset();
    const { connection, customer } = await fixtures();
    const made = await makeRequest(customer, connection, { qubeId: null });
    const row = await deliver(made, "request: an answer");
    assert.deepStrictEqual([row.qubeId, row.state], [QUBE_ID, "response_received"]);
  });

  it("rolls the delivery back with the handler when it throws, so the retry runs it", async () => {
    class Flaky extends FindCustomer {
      async answered(event) {
        if (!Flaky.thrown) {
          Flaky.thrown = true;
          throw new Error("handler");
        }
        return super.answered(event);
      }
    }
    reset({ operations: { find_customer: Flaky } });
    const { connection, customer } = await fixtures();
    const made = await makeRequest(customer, connection);
    await assert.rejects(deliver(made, "request: an answer"), /handler/);
    assert.strictEqual((await kit.settings().store.findRequestDeliveries(made.id)).length, 0);
    const row = await deliver(made, "request: an answer");
    assert.strictEqual(row.done(), true);
  });

  it("drops a delivery for a request deleted since, and throws for a slug taken out", async () => {
    reset();
    const { connection, customer } = await fixtures();
    await kit.run({ kind: "request", id: "999", body: vectorBody("request: an answer") });
    assert.match(loggedText(), /request 999 isn't there/);
    const made = await makeRequest(customer, connection);
    kit.configure({ operations: { create_invoice: support.CreateInvoice } });
    await assert.rejects(deliver(made, "request: an answer"), (err) => err instanceof kit.UnknownOperation);
  });

  it("keeps no response body on the row", async () => {
    assert.ok(!Object.values(kit.STORE_COLUMNS.qube_requests).some((column) => /response/.test(column)));
  });
});
