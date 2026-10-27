"use strict";

const { randomUUID } = require("crypto");

const { client, isRefused } = require("./client");
const { NotConnected } = require("./errors");
const { Connection, QueuedRequest, recordKey, blank } = require("./records");
const { settings } = require("./settings");

// The request fields the job writes once a delivery is applied.
const REQUEST_EVENT_FIELDS = Object.freeze(["qubeId", "state", "error", "pagesAnswered", "lastPage", "endedAt"]);
const FINAL_STATES = Object.freeze(["error", "timed_out", "discarded"]);

// One v2 operation your app queues itself, with no workflow, and what it does with that
// request's webhooks. Subclass it once per request, list it in the operations setting by its
// slug, and see the README's "Plain requests".
//
//   class FindCustomer extends PlainRequest {
//     static operation = "customer.query";
//     static slug = "find_customer";
//     params() { return { full_name: this.record.name }; }
//     async answered(event) { ... }
//   }
//
//   const row = await FindCustomer.queue(customer, connection);
class PlainRequest {
  // The QueuedRequest for record on connection. While the last one hasn't ended it's returned
  // (row.reused), sent again first if QuBe Sync never confirmed it.
  static async queue(record, connection) {
    if (!PlainRequest.#madeByQubeSync(connection)) {
      throw new NotConnected(
        `QuBe Sync: ${this.name}.queue needs a connection QuBe Sync has made (one with a qubeId): the customer finishes onboarding first`
      );
    }

    const on = connection instanceof Connection ? connection : new Connection(connection);
    const { row, reused, paramsError } = await PlainRequest.#claim.call(this, record, on);
    if (paramsError) throw paramsError;

    const queued = new QueuedRequest(row, on.store, on);
    if (reused) {
      queued.reused = true;
      return this.retryQueue(queued);
    }
    return PlainRequest.#sendQueue.call(this, queued);
  }

  // Sends a queue that got no answer again, with the same params and Idempotency-Key.
  static async retryQueue(queued) {
    if (!blank(queued.qubeId)) return queued;
    if (queued.state !== "queued") {
      throw new TypeError(`QuBe Sync: request ${queued.id} is ${queued.state}: only a queue that got no answer is sent again`);
    }
    return PlainRequest.#sendQueue.call(this, queued);
  }

  // Under the connection row's lock, so a double click finds the same row.
  static async #claim(record, connection) {
    const [type, id] = recordKey(record);
    return connection.store.withConnectionLock(connection.id, async (tx) => {
      const going = await tx.latestRequest(type, id, this.slug, { connectionId: connection.id });
      if (going && blank(going.endedAt)) return { row: going, reused: true };

      const fields = {
        connectionId: connection.id,
        operation: this.slug,
        recordType: type,
        recordId: id,
        reference: `${this.slug}-${id}-${randomUUID()}`,
        state: "queued",
      };
      const unsaved = new QueuedRequest(fields, tx, new Connection({ ...connection }, tx));
      let params;
      try {
        // As JSON reads it back, so a resend sends exactly what the first did.
        params = asJson(await new this(record, unsaved).params());
      } catch (err) {
        return { row: await tx.createRequest({ ...fields, state: "failed", endedAt: new Date() }), paramsError: err };
      }
      return { row: await tx.createRequest({ ...fields, params }) };
    });
  }

  static async #sendQueue(queued) {
    let answer;
    try {
      const options = { webhookUrl: queued.webhookUrl(), idempotencyKey: queued.reference };
      if (this.method) options.method = this.method;
      if (this.path) options.path = this.path;
      answer = await client().queue(this.operation, queued.connection.qubeId, queued.params || {}, options);
    } catch (err) {
      // A 4xx but 409 (the key in use by a call still in flight): nothing was queued.
      if (isRefused(err) && err.status !== 409) await queued.update({ state: "failed", endedAt: new Date() });
      throw err;
    }
    const id = answer !== null && typeof answer === "object" && !blank(answer.id) ? String(answer.id) : null;
    // Its webhooks may have come first and saved the id already.
    const row = await queued.store.withRequestLock(queued.id, (tx, locked) => (blank(locked.qubeId) ? tx.updateRequest(queued.id, { qubeId: id }) : locked));
    Object.assign(queued, row);
    return queued;
  }

  static #madeByQubeSync(connection) {
    return connection !== null && typeof connection === "object" && !blank(connection.id) && !blank(connection.qubeId);
  }

  // Write it to load the record your own way; left out, the findRecord setting finds it.
  static async findRecord(id) {
    throw new Error(`${this.name}.findRecord(${JSON.stringify(id)}) isn't written: leave it out to find the record with the findRecord setting`);
  }

  /** The request's record: findRecord when the class writes one, else the findRecord setting's. */
  static async recordFor(queued) {
    const record =
      this.findRecord === PlainRequest.findRecord ? await settings().findRecord(queued.recordType, queued.recordId) : await this.findRecord(String(queued.recordId));
    return record === undefined ? null : record;
  }

  constructor(record, queuedRequest) {
    this.record = record;
    this.queuedRequest = queuedRequest || null;
  }

  get connection() {
    return this.queuedRequest ? this.queuedRequest.connection : null;
  }

  // Inside a handler, the request lock's transaction.
  get store() {
    return this.queuedRequest ? this.queuedRequest.store : settings().store;
  }

  /** The operation's params, from the record. */
  params() {
    throw new Error(`${this.constructor.name}'s params isn't written yet`);
  }

  /** One answered page: event.responseJson.data, event.page. */
  async answered(event) {
    this.logEvent(event);
  }

  /** Every page 1..N answered. Called once. */
  async done() {}

  /** error or discarded: event.error.user_message is safe to show. */
  async failed(event) {
    this.logEvent(event);
  }

  /** QuBe Sync keeps trying: show event.error.user_message, never resend. */
  async retrying(event) {
    this.logEvent(event);
  }

  /** QuickBooks may have applied it. A query can be queued again; check a write first. */
  async timedOut(event) {
    return this.failed(event);
  }

  // One webhook, from the job, under the row's lock. Deliveries come at least once, in any order.
  async handle(event) {
    const base = this.queuedRequest.store;
    const applied = await base.withRequestLock(this.queuedRequest.id, async (tx, row) => {
      if (!row) return null;
      const connection = await tx.getConnection(row.connectionId);
      this.queuedRequest = new QueuedRequest(row, tx, connection ? new Connection(connection, tx) : null);
      await this.#apply(event, tx);
      return { row: { ...this.queuedRequest }, connection };
    });
    if (!applied) {
      console.warn(`QuBe Sync: dropped ${event.event || event.type}: request ${this.queuedRequest.id} isn't there (deleted since, so it can't be applied)`);
      return;
    }
    const { row, connection } = applied;
    this.queuedRequest = new QueuedRequest(row, base, connection ? new Connection(connection, base) : null);
  }

  logEvent(event) {
    const error = isObject(event.error) ? event.error : null;
    const code = error ? ` ${error.error_code || error.error_type}` : "";
    const line = `QuBe Sync: ${this.constructor.name} ${this.record && this.record.id} (request ${this.queuedRequest && this.queuedRequest.id}): ${event.state} page ${pageOf(event)}${code}`;
    if (event.state === "response_received") console.log(line);
    else console.warn(line);
  }

  async #apply(event, tx) {
    const row = this.queuedRequest;
    if (!this.#thisRequest(event)) {
      console.warn(`QuBe Sync: ${this.constructor.name} request ${row.id} skipped ${event.type} ${JSON.stringify(event.body && event.body.id)}: not this request`);
      return;
    }
    const key = blank(event.dedupeKey) ? "" : String(event.dedupeKey);
    if (!(await tx.takeRequestDelivery(row.id, key, { page: pageOf(event), state: String(event.state) }))) return;

    if (blank(row.qubeId)) row.qubeId = event.id;
    if (event.state === "response_received") await this.#pageAnswered(event, tx);
    else if (event.state === "retryable") await this.#retryable(event, tx);
    else if (FINAL_STATES.includes(event.state)) await this.#final(event);
    else console.warn(`QuBe Sync: ${this.constructor.name} request ${row.id}: unknown state ${JSON.stringify(event.state)}`);

    const changes = {};
    for (const field of REQUEST_EVENT_FIELDS) changes[field] = row[field] === undefined ? null : row[field];
    Object.assign(row, await tx.updateRequest(row.id, changes));
  }

  // Request events carry no connection id: the id is checked once the row has one.
  #thisRequest(event) {
    if (event.type !== "request") return false;
    const { qubeId } = this.queuedRequest;
    return blank(qubeId) || event.id === qubeId;
  }

  async #pageAnswered(event, tx) {
    const row = this.queuedRequest;
    if (event.iterationState === "done" || event.iterationState === "not_applicable") row.lastPage = pageOf(event);
    if (!row.ended()) row.state = "response_received";
    await this.answered(event);

    const deliveries = await tx.findRequestDeliveries(row.id);
    const pages = new Set(deliveries.filter((d) => d.state === "response_received" && d.page !== null).map((d) => d.page));
    row.pagesAnswered = pages.size;
    if (row.ended() || blank(row.lastPage)) return;
    const inRange = [...pages].filter((page) => page >= 1 && page <= row.lastPage).length;
    if (inRange !== row.lastPage) return;

    row.endedAt = new Date();
    await this.done();
  }

  async #retryable(event, tx) {
    const row = this.queuedRequest;
    const page = pageOf(event);
    const settled = (await tx.findRequestDeliveries(row.id)).some((d) => d.page === page && d.state !== "retryable");
    if (settled) {
      console.log(`QuBe Sync: ${this.constructor.name} request ${row.id} page ${page}: skipped a retryable that came after its answer`);
      return;
    }
    if (!row.ended()) {
      row.state = "retryable";
      row.error = event.error;
    }
    await this.retrying(event);
  }

  async #final(event) {
    const row = this.queuedRequest;
    if (!row.ended()) {
      row.state = event.state;
      row.error = event.error;
      row.endedAt = new Date();
    }
    if (event.state === "timed_out") await this.timedOut(event);
    else await this.failed(event);
  }
}

// An answer that wasn't paged is page 1.
function pageOf(event) {
  return Number.isInteger(event.page) ? event.page : 1;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asJson(value) {
  return value === undefined ? null : JSON.parse(JSON.stringify(value));
}

module.exports = { PlainRequest };
