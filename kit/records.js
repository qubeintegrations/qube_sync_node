"use strict";

// The kit's rows, with what they mean: Connection (qube_connections), Run (qube_runs) and
// QueuedRequest (qube_requests), each a row from the store with its methods. QuickBooks ids are kept through a connection (link,
// qbIdFor, findLinked, quickbooksRecord) as plain rows of qube_quickbooks_records.

const { client } = require("./client");
const { StoreConflict, UnknownOperation } = require("./errors");
const { settings } = require("./settings");
const { familyFor } = require("./store");

// The type and id a polymorphic column keeps for record: its type (the recordType setting, by
// default its class's name) and its id as a string, so an app's integer and UUID keys both fit.
function recordKey(record) {
  if (record === null || record === undefined) throw new TypeError("QuBe Sync: a record is needed here, not " + record);
  if (record.id === null || record.id === undefined || record.id === "") {
    throw new TypeError("QuBe Sync: this record has no id yet: save it first");
  }
  return [String(settings().recordType(record)), String(record.id)];
}

function blank(value) {
  return value === null || value === undefined || String(value) === "";
}

function hidden(object, name, value) {
  Object.defineProperty(object, name, { value, enumerable: false, writable: true, configurable: true });
}

function toDate(value) {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// An ISO 8601 time, or null for anything else.
function parseTime(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return null;
  return toDate(value);
}

function humanize(word) {
  const text = String(word === null || word === undefined ? "" : word).replace(/_/g, " ");
  return text === "" ? text : text[0].toUpperCase() + text.slice(1);
}

// Required when first used: sync-status requires this file.
function syncStatusModule() {
  return require("./sync-status");
}

function unknownSlug(operation) {
  return new TypeError(`QuBe Sync: no operation has the slug ${JSON.stringify(operation)} (the operations setting)`);
}

// ---------------------------------------------------------------------------

// One QuickBooks Desktop connection: a company file on a customer's computer, reached through
// the Web Connector. Its owner is the account (or shop, or whatever your app's customer is) that
// connected it, and an owner can have any number: two company files, or a new file after a
// reconnect.
//
// qubeId is QuBe Sync's id for it, null until QuBe Sync answers the create. status is "pending"
// until the setup ends, then "connected", "setup_cancelled" or "stalled" (with stallReason), kept
// up to date by its own webhooks (ConnectionEvents). revision is the last of those applied.
//
// The QuickBooks ids your app learns are kept against it, by list family (link, qbIdFor,
// findLinked), since a ListID is unique only within one list family of one company file.
class Connection {
  constructor(row, store) {
    Object.assign(this, row);
    hidden(this, "store", store || settings().store);
    hidden(this, "ownerLoaded", null);
  }

  /** The connection with that id, or null. */
  static async get(id, store) {
    const using = store || settings().store;
    const row = await using.getConnection(id);
    return row ? new Connection(row, using) : null;
  }

  /** The connections owner has, newest first, whatever its key's type. */
  static async ownedBy(owner, store) {
    const using = store || settings().store;
    const [type, id] = recordKey(owner);
    return (await using.ownedBy(type, id)).map((row) => new Connection(row, using));
  }

  /** A new row for owner, "pending", with no qubeId: what Connect writes before asking QuBe Sync. */
  static async create(owner, { name = null } = {}, store) {
    const using = store || settings().store;
    const [type, id] = recordKey(owner);
    return new Connection(await using.createConnection({ ownerType: type, ownerId: id, name, status: "pending" }), using);
  }

  /** Where its events go: QUBE_WEBHOOK_URL/connections/<id>. */
  webhookUrl() {
    return `${settings().webhookUrl}/connections/${encodeURIComponent(String(this.id))}`;
  }

  connected() {
    return this.status === "connected";
  }

  // Stalled because the Web Connector isn't checking in (the QuickBooks computer is off, or the
  // Web Connector closed), rather than because it can't open QuickBooks.
  notCheckingIn() {
    return this.status === "stalled" && this.stallReason === "not_checking_in";
  }

  /** The account (or whatever your app's customer is) that connected it: the findRecord setting's. */
  async owner() {
    if (!this.ownerLoaded) this.ownerLoaded = Promise.resolve(settings().findRecord(this.ownerType, this.ownerId));
    return this.ownerLoaded;
  }

  /** Writes changes to its row, and takes the row as written. */
  async update(changes) {
    const row = await this.store.updateConnection(this.id, changes);
    if (row) Object.assign(this, row);
    return this;
  }

  /** record's newest run of operation on this connection, or null. */
  async latestRun(record, operation) {
    const [type, id] = recordKey(record);
    const row = await this.store.latestRun(type, id, String(operation), { connectionId: this.id });
    return row ? new Run(row, this.store, this) : null;
  }

  /** When its last completed run of workflow started, or null before one: a sync's next since. */
  async lastSyncedAt(workflow) {
    const mark = await this.store.getSyncMark(this.id, String(workflow));
    return mark ? toDate(mark.startedAt) : null;
  }

  // Deletes the row with its runs, requests, QuickBooks ids and sync marks, after your
  // connectionEvents class's disconnected(), all in one transaction. disconnectQuickbooks deletes
  // QuBe Sync's connection first.
  async disconnect() {
    await this.store.transaction(async (tx) => {
      const Events = settings().connectionEvents;
      await new Events(new Connection({ ...this }, tx)).disconnected();
      await tx.deleteConnection(this.id);
    });
  }

  /** Where record stands with QuickBooks here for operation: a SyncStatus, never stored. */
  async syncStatus(record, operation, options) {
    if (!settings().operationClass(operation)) throw unknownSlug(operation);
    return syncStatusModule().SyncStatus.for(this, record, operation, options);
  }

  // SQL conditions for your list pages (README, "Sync status"): table's rows with a link here,
  // without one, waiting for an answer, or on their way.
  inQuickbooksSql(table, options) {
    return syncStatusModule().inQuickbooksSql(this, table, options);
  }

  notInQuickbooksSql(table, options) {
    return syncStatusModule().notInQuickbooksSql(this, table, options);
  }

  needingAnswerSql(table, options) {
    return syncStatusModule().needingAnswerSql(this, table, options);
  }

  sendingSql(table, options) {
    return syncStatusModule().sendingSql(this, table, options);
  }

  // For a row without a qubeId: QuBe Sync's connection made for it, when a create landed but its
  // id was never saved (it didn't commit, or the process died between the call and the save).
  // Saves and returns the id, or null, so a second connection is never made for one row.
  //
  // It lists the app's connections (GET /api/v2/connections, which isn't paged) and adopts one
  // only when exactly one has this row's webhook URL, is unclaimed (it has never connected, or
  // it's simulated: a simulated connection connects as it's made), was made at or after this row
  // (its created_at), and has the row's name when the row has one. So a row id used again (MySQL 5.7 after a restart, a restored database) never takes
  // an old connection. A connection with no created_at (a server from before v2 sent it) is never
  // adopted. The listing only runs for a row without an id, which is rare.
  async adoptQubeConnection() {
    if (!blank(this.qubeId)) return this.qubeId;

    const answer = await client().listConnections();
    const listed = (Array.isArray(answer) ? answer : []).filter((made) => made !== null && typeof made === "object");
    if (listed.some((made) => blank(made.created_at) && this.#sameUrl(made))) {
      console.warn(
        `QuBe Sync: connection ${this.id}: QuBe Sync's connections carry no created_at, so none is adopted; a new one is made instead`
      );
    }
    const candidates = listed.filter((made) => this.#madeForThisRow(made));
    if (candidates.length > 1) {
      console.warn(
        `QuBe Sync: connection ${this.id} has no qube_id and ${candidates.length} of QuBe Sync's connections could be its; adopted none`
      );
      return null;
    }
    const found = candidates[0];
    if (!found) return null;

    console.log(`QuBe Sync: connection ${this.id} adopted QuBe Sync's connection ${found.id}, made for it before its id was saved`);
    await this.update({ qubeId: String(found.id) });
    return this.qubeId;
  }

  // Keeps record's QuickBooks id for kind ("invoice", "customer", "item_service"...) on this
  // connection, with its EditSequence and its name (FullName, or RefNumber), and returns the row.
  // A record has one id per kind, so linking it again replaces its id. An id already linked in
  // that kind's family (familyFor) to another of your records moves to this one, and that's
  // logged: the same QuickBooks record can stand for one of yours at a time. The same record and
  // id linked with another kind of the family (an item converted from service to non-inventory)
  // changes the row's kind.
  async link(record, { kind, qbId, editSequence = null, name = null } = {}) {
    const kindText = blank(kind) ? "" : String(kind);
    const qbIdText = blank(qbId) ? "" : String(qbId);
    if (qbIdText === "") throw new TypeError("QuBe Sync: link needs a qbId");

    const list = familyFor(kindText);
    const [type, id] = recordKey(record);
    for (let attempt = 1; ; attempt += 1) {
      try {
        // A transaction (a savepoint inside a caller's, such as the job's run lock), so a
        // unique-key race can be tried again.
        return await this.store.transaction(async (tx) => {
          const lock = { limit: 1, lock: true };
          const [taken] = await tx.findQuickbooksRecords({ connectionId: this.id, list, qbId: qbIdText }, lock);
          const [mine] = await tx.findQuickbooksRecords({ connectionId: this.id, kind: kindText, recordType: type, recordId: id }, lock);
          if (this.#replaced(mine, taken)) {
            console.log(`QuBe Sync: connection ${this.id}: ${type} ${id}'s ${kindText} ${mine.qbId} replaced by ${qbIdText}`);
            await tx.deleteQuickbooksRecord(mine.id);
          }
          if (this.#moved(taken, [type, id])) {
            console.warn(`QuBe Sync: connection ${this.id}: ${kindText} ${qbIdText} moved from ${taken.recordType} ${taken.recordId} to ${type} ${id}`);
          }
          const fields = { kind: kindText, list, qbId: qbIdText, recordType: type, recordId: id };
          if (editSequence !== null && editSequence !== undefined) fields.editSequence = String(editSequence);
          if (name !== null && name !== undefined) fields.name = name;
          const row = taken || mine;
          if (row) return tx.updateQuickbooksRecord(row.id, fields);
          return tx.createQuickbooksRecord({ connectionId: this.id, editSequence: null, name: null, ...fields });
        });
      } catch (err) {
        // Another worker linked the same record or id at the same moment: once more, now it's
        // there to find.
        if (err instanceof StoreConflict && attempt < 2) continue;
        throw err;
      }
    }
  }

  // record's QuickBooks id for kind on this connection, or null: its link of that kind, else,
  // outside the name family, its one link in that kind's family (an item linked as item_service,
  // asked for as item or item_non_inventory). In the name family each kind is its own QuickBooks
  // record (a customer and a vendor are two names), so a customer's id is never handed out as a
  // vendor's. Throws a TypeError when the family has several and none is that kind.
  async qbIdFor(record, { kind } = {}) {
    const [type, id] = recordKey(record);
    const mine = { connectionId: this.id, recordType: type, recordId: id };
    const [exact] = await this.store.findQuickbooksRecords({ ...mine, kind: blank(kind) ? "" : String(kind) }, { limit: 1 });
    const family = familyFor(kind);
    if (exact || family === "name") return exact ? exact.qbId : null;

    const row = await this.#onlyOne({ ...mine, list: family }, `${type} ${id}'s ${kind}`);
    return row ? row.qbId : null;
  }

  /** Your record linked to that QuickBooks id (the findRecord setting's), or null. */
  async findLinked(qbId, { kind } = {}) {
    const row = await this.quickbooksRecord(qbId, { kind });
    if (!row || blank(row.recordType)) return null;
    const record = await settings().findRecord(row.recordType, row.recordId);
    return record === undefined ? null : record;
  }

  // The row for that QuickBooks id (with its kind, editSequence and name), or null. With a kind,
  // it's looked up in that kind's family; without one, in every family, and an id found in more
  // than one (the same counter value is a customer and an account) throws a TypeError, so the
  // caller says which kind it means.
  async quickbooksRecord(qbId, { kind } = {}) {
    const where = { connectionId: this.id, qbId: String(qbId) };
    if (kind !== null && kind !== undefined) {
      const [row] = await this.store.findQuickbooksRecords({ ...where, list: familyFor(kind) }, { limit: 1 });
      return row || null;
    }
    return this.#onlyOne(where, `QuickBooks id ${qbId}`);
  }

  // The record's own link is a different row from the one holding this qbId, so it gives way.
  #replaced(mine, taken) {
    return Boolean(mine) && Boolean(taken) && String(taken.id) !== String(mine.id);
  }

  // This qbId was linked to another of your records.
  #moved(taken, to) {
    return Boolean(taken) && !blank(taken.recordId) && (taken.recordType !== to[0] || taken.recordId !== to[1]);
  }

  #sameUrl(made) {
    return String(made.webhook_url === null || made.webhook_url === undefined ? "" : made.webhook_url).replace(/\/$/, "") === this.webhookUrl();
  }

  #madeForThisRow(made) {
    if (blank(made.id)) return false;
    if (!this.#sameUrl(made)) return false;
    if (!this.#unclaimed(made)) return false;
    if (!blank(this.name) && made.name !== this.name) return false;

    const madeAt = parseTime(made.created_at);
    const rowAt = toDate(this.createdAt);
    if (!madeAt || !rowAt) return false;

    return madeAt.getTime() >= rowAt.getTime() - Connection.CLOCK_SKEW_SECONDS * 1000;
  }

  // Nobody can have set it up: it has never connected, or it's simulated and connected itself when
  // it was made. Either way, only the lost answer to the create carried its setup link.
  #unclaimed(made) {
    return made.last_connected_at === null || made.last_connected_at === undefined || made.type === "simulated";
  }

  async #onlyOne(where, what) {
    const rows = await this.store.findQuickbooksRecords(where, { limit: 2 });
    if (rows.length > 1) {
      const kinds = (await this.store.findQuickbooksRecords(where)).map((row) => row.kind).sort().join(", ");
      throw new TypeError(`QuBe Sync: ${what} is linked as more than one kind (${kinds}): pass kind`);
    }
    return rows[0] || null;
  }
}

// Clock difference allowed between this app and QuBe Sync.
Connection.CLOCK_SKEW_SECONDS = 5 * 60;

// ---------------------------------------------------------------------------

// One workflow run, of one operation, for one of your records, on one connection. Written before
// the run starts (Operation.start), so a webhook that arrives first finds it; its webhook URL is
// QUBE_WEBHOOK_URL/runs/<id>.
//
// reference is new for every run and sent with it, and every event is checked against it and the
// connection's qubeId. revision is the last event applied; state ("starting", then the run's own:
// "running", "awaiting_input", "completed", "failed", "cancelled") and outcome are the run's as of
// that event. question and links are the question it's asking, if any, for renderQuestion. input
// is what the run was started with. A start QuBe Sync refused (a 4xx), or whose input threw,
// leaves state "failed"; one that got no answer (a timeout, a 5xx, a dropped connection) stays
// "starting", for retryStart.
class Run {
  constructor(row, store, connection) {
    Object.assign(this, row);
    hidden(this, "store", store || settings().store);
    hidden(this, "connection", connection || null);
    // Set by Operation.start when it returned this run, one that hadn't ended. Not saved.
    hidden(this, "reused", false);
  }

  /** The run with that id, with its connection, or null. */
  static async get(id, store) {
    const using = store || settings().store;
    const row = await using.getRun(id);
    return row ? Run.load(row, using) : null;
  }

  /** A row from the store, with its connection. */
  static async load(row, store) {
    const using = store || settings().store;
    const connection = await using.getConnection(row.connectionId);
    return new Run(row, using, connection ? new Connection(connection, using) : null);
  }

  /** record's newest run of operation (a slug in the operations setting), or null. */
  static async latestFor(record, operation, store) {
    if (!settings().operationClass(operation)) throw unknownSlug(operation);
    const using = store || settings().store;
    const [type, id] = recordKey(record);
    const row = await using.latestRun(type, id, String(operation));
    return row ? Run.load(row, using) : null;
  }

  /** Writes changes to its row, and takes the row as written. */
  async update(changes) {
    const row = await this.store.updateRun(this.id, changes);
    if (row) Object.assign(this, row);
    return this;
  }

  // Sends a start that didn't get an answer again: same reference (the Idempotency-Key),
  // workflow, input and webhook URL, so QuBe Sync answers with the run the first one started, if
  // it did, instead of starting another. See Operation.retryStart.
  async retryStart() {
    const OperationClass = settings().operationClass(this.operation);
    if (!OperationClass) throw new UnknownOperation(`QuBe Sync: no operation has the slug ${JSON.stringify(this.operation)}`);
    return OperationClass.retryStart(this);
  }

  webhookUrl() {
    return `${settings().webhookUrl}/runs/${encodeURIComponent(String(this.id))}`;
  }

  /** Whether it has ended: completed, failed or cancelled. */
  ended() {
    return Run.ENDED_STATES.includes(this.state);
  }

  failed() {
    return this.state === "failed";
  }

  // Cancelled by your app (state "cancelled"), or a chart that ended on its own "cancelled"
  // outcome (the app chose to stop): neither is a success.
  cancelled() {
    return this.state === "cancelled" || (this.state === "completed" && this.outcome === "cancelled");
  }

  /** A start QuBe Sync hasn't confirmed for a minute: send it again with retryStart. */
  unconfirmed(now = new Date()) {
    const createdAt = toDate(this.createdAt);
    return this.state === "starting" && Boolean(createdAt) && createdAt.getTime() < now.getTime() - Run.UNCONFIRMED_AFTER_SECONDS * 1000;
  }

  // Confirmed, not ended, quiet for QUIET_AFTER_SECONDS, and running or waiting on a question
  // this app never received: its webhook may be lost, so the status offers to send it again.
  looksStuck(now = new Date()) {
    return this.#quietSince(now.getTime() - Run.QUIET_AFTER_SECONDS * 1000) && (this.state === "running" || this.#questionMissing());
  }

  #quietSince(ms) {
    const updatedAt = toDate(this.updatedAt);
    return !blank(this.qubeRunId) && !this.ended() && Boolean(updatedAt) && updatedAt.getTime() < ms;
  }

  #questionMissing() {
    return this.state === "awaiting_input" && !this.openQuestion();
  }

  // Where it stands, in one plain sentence for a person: "Added to QuickBooks", "Done",
  // "Failed: <message>", "Cancelled: <reason>", "Waiting for your answer", "Starting", "Not
  // confirmed by QuBe Sync yet" or "Running".
  summaryText(now = new Date()) {
    if (this.cancelled()) return `Cancelled: ${this.cancelReasonText()}`;

    switch (this.state) {
      case "starting":
        return this.unconfirmed(now) ? "Not confirmed by QuBe Sync yet" : "Starting";
      case "completed": {
        const outcome = blank(this.outcome) ? "" : String(this.outcome);
        if (outcome === "added") return "Added to QuickBooks";
        if (outcome === "" || outcome === "completed") return "Done";
        return `Done: ${humanize(outcome)}`;
      }
      case "failed": {
        const message = this.errorMessage();
        return message ? `Failed: ${message}` : "Failed";
      }
      case "awaiting_input":
        return "Waiting for your answer";
      default:
        return "Running";
    }
  }

  /** Why it was cancelled: the reason it carried, else what a cancelled outcome means. */
  cancelReasonText() {
    const reason = blank(this.cancelReason) ? "" : String(this.cancelReason).trim();
    return reason === "" ? "your app chose to stop" : reason;
  }

  // A failed run's message: its error's own (a sentence, or the message of a code, message and
  // detail), else its outcome in words, or null.
  errorMessage() {
    const { error } = this;
    let text = null;
    if (typeof error === "string") text = error;
    else if (error !== null && typeof error === "object" && !Array.isArray(error)) text = error.message || error.detail;
    text = blank(text) ? "" : String(text).trim();
    if (text !== "") return text;
    if (blank(this.outcome) && blank(this.endedAt)) return "it couldn't be started";

    return blank(this.outcome) || this.outcome === "failed" ? null : humanize(this.outcome);
  }

  /** The error's detail, when it carries one apart from its message. */
  errorDetail() {
    const { error } = this;
    if (error === null || typeof error !== "object" || Array.isArray(error)) return null;

    const detail = blank(error.detail) ? "" : String(error.detail).trim();
    return detail === "" || detail === this.errorMessage() ? null : detail;
  }

  /** The question it's asking, as its webhook's prompt had it, or null. */
  openQuestion() {
    const { question } = this;
    return question !== null && typeof question === "object" && !Array.isArray(question) ? question : null;
  }
}

Run.ENDED_STATES = Object.freeze(["completed", "failed", "cancelled"]);
// How long a start may go unconfirmed before the status says so and offers to send it again.
Run.UNCONFIRMED_AFTER_SECONDS = 60;
// How long a confirmed run may go without news before the status offers to resend its latest event.
Run.QUIET_AFTER_SECONDS = 10 * 60;

// ---------------------------------------------------------------------------

// One plain v2 request (PlainRequest.queue) for one of your records, on one connection. Written
// before it's sent; its webhook URL is QUBE_WEBHOOK_URL/requests/<id>.
//
// state: "queued", "retryable", "response_received", "error", "timed_out", "discarded", or
// "failed" (QuBe Sync refused the queue, or params threw). endedAt is set once it's over: every
// page answered, or a final error. It never keeps a response body.
class QueuedRequest {
  constructor(row, store, connection) {
    Object.assign(this, row);
    hidden(this, "store", store || settings().store);
    hidden(this, "connection", connection || null);
    // Set by PlainRequest.queue when it returned this row rather than queueing another. Not saved.
    hidden(this, "reused", false);
  }

  static async get(id, store) {
    const using = store || settings().store;
    const row = await using.getRequest(id);
    return row ? QueuedRequest.load(row, using) : null;
  }

  static async load(row, store) {
    const using = store || settings().store;
    const connection = await using.getConnection(row.connectionId);
    return new QueuedRequest(row, using, connection ? new Connection(connection, using) : null);
  }

  async update(changes) {
    const row = await this.store.updateRequest(this.id, changes);
    if (row) Object.assign(this, row);
    return this;
  }

  webhookUrl() {
    return `${settings().webhookUrl}/requests/${encodeURIComponent(String(this.id))}`;
  }

  ended() {
    return !blank(this.endedAt);
  }

  /** Every page answered. */
  done() {
    return this.ended() && this.state === "response_received";
  }

  // Sends a queue QuBe Sync never confirmed again: same params and Idempotency-Key.
  async retryQueue() {
    const RequestClass = settings().requestClass(this.operation);
    if (!RequestClass) throw new UnknownOperation(`QuBe Sync: no operation has the slug ${JSON.stringify(this.operation)}`);
    return RequestClass.retryQueue(this);
  }
}

module.exports = { Connection, Run, QueuedRequest, recordKey, blank, toDate };
