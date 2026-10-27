"use strict";

// memoryStore(): a store kept in this process's memory, for tests and trying the kit out. It
// keeps the same unique keys as schema.sql (a write that breaks one throws StoreConflict), rolls
// a transaction back when its function throws (a nested one is a savepoint), holds a lock per
// run, request and connection, and keeps the JSON columns as text, so a row reads back as an SQL store
// would hand it. Everything is lost when the process ends: never use it in production.

const { StoreConflict } = require("./errors");
const { JSON_COLUMNS } = require("./store");

const TABLES = ["connections", "runs", "notifications", "quickbooksRecords", "syncMarks", "requests", "requestDeliveries"];
const DATE_COLUMNS = ["createdAt", "updatedAt", "endedAt", "startedAt"];
// Tables whose rows have no updatedAt.
const INSERT_ONLY = ["notifications", "requestDeliveries"];

// An id from a URL is a string: the memory store's ids are whole numbers, so anything else is
// no row, as an SQL store's lookup of "abc" in a bigint column should be.
function idFrom(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /^[1-9]\d{0,15}$/.test(text) ? Number(text) : null;
}

function same(a, b) {
  if (a === null || a === undefined) return b === null || b === undefined;
  if (b === null || b === undefined) return false;
  return String(a) === String(b);
}

function text(value) {
  return value === null || value === undefined ? null : String(value);
}

function isRunOf(row, recordType, recordId, operation) {
  return same(row.recordType, recordType) && same(row.recordId, recordId) && row.operation === String(operation);
}

// Any connection when none is asked for.
function isOnConnection(row, connectionId) {
  return connectionId === undefined || connectionId === null || same(row.connectionId, connectionId);
}

// Newest first: created_at, then id, both descending.
function newestFirst(a, b) {
  const byTime = b.createdAt.getTime() - a.createdAt.getTime();
  return byTime !== 0 ? byTime : b.id - a.id;
}

// A row as it's kept: the JSON columns as text, dates as numbers.
function stored(row) {
  const kept = { ...row };
  for (const column of JSON_COLUMNS) {
    if (column in kept) kept[column] = kept[column] === null || kept[column] === undefined ? null : JSON.stringify(kept[column]);
  }
  for (const column of DATE_COLUMNS) {
    if (kept[column] instanceof Date) kept[column] = kept[column].getTime();
    else if (column in kept && kept[column] !== null && kept[column] !== undefined) kept[column] = new Date(kept[column]).getTime();
  }
  return kept;
}

// A row as it's read: a copy, the JSON parsed, the dates Dates.
function loaded(kept) {
  if (!kept) return null;
  const row = { ...kept };
  for (const column of JSON_COLUMNS) {
    if (column in row) row[column] = row[column] === null ? null : JSON.parse(row[column]);
  }
  for (const column of DATE_COLUMNS) {
    if (column in row) row[column] = row[column] === null || row[column] === undefined ? null : new Date(row[column]);
  }
  return row;
}

class MemoryStore {
  #state;
  #tx;

  constructor(state, tx) {
    this.#state = state || {
      tables: Object.fromEntries(TABLES.map((name) => [name, new Map()])),
      ids: Object.fromEntries(TABLES.map((name) => [name, 0])),
      locks: new Map(),
    };
    this.#tx = tx || null;
  }

  // -------------------------------------------------------------------------
  // Transactions and locks

  async transaction(fn) {
    const tx = { undo: [], held: new Set(this.#tx ? this.#tx.held : []) };
    const view = new MemoryStore(this.#state, tx);
    try {
      const result = await fn(view);
      // Committed into the transaction around it, if any: rolling that one back undoes this too.
      if (this.#tx) this.#tx.undo.push(...tx.undo);
      return result;
    } catch (err) {
      for (const undo of tx.undo.reverse()) undo();
      throw err;
    }
  }

  async withConnectionLock(id, fn) {
    return this.#locked(`connection:${id}`, (tx) => tx.getConnection(id).then((row) => fn(tx, row)));
  }

  async withRunLock(id, fn) {
    return this.#locked(`run:${id}`, (tx) => tx.getRun(id).then((row) => fn(tx, row)));
  }

  async withRequestLock(id, fn) {
    return this.#locked(`request:${id}`, (tx) => tx.getRequest(id).then((row) => fn(tx, row)));
  }

  // fn in a transaction holding key's lock, released once it has committed or rolled back. A
  // transaction that holds it already takes it again.
  async #locked(key, fn) {
    if (this.#tx && this.#tx.held.has(key)) return this.transaction(fn);
    const release = await this.#acquire(key);
    try {
      return await this.transaction((tx) => {
        tx.#tx.held.add(key);
        return fn(tx);
      });
    } finally {
      release();
    }
  }

  async #acquire(key) {
    const locks = this.#state.locks;
    const before = locks.get(key) || Promise.resolve();
    let release;
    const mine = new Promise((resolve) => {
      release = resolve;
    });
    const tail = before.then(() => mine);
    locks.set(key, tail);
    await before;
    return () => {
      release();
      if (locks.get(key) === tail) locks.delete(key);
    };
  }

  // -------------------------------------------------------------------------
  // Writes, each undone when its transaction rolls back

  #table(name) {
    return this.#state.tables[name];
  }

  #put(name, kept) {
    const table = this.#table(name);
    const before = table.get(kept.id);
    table.set(kept.id, kept);
    if (this.#tx) this.#tx.undo.push(() => (before ? table.set(kept.id, before) : table.delete(kept.id)));
  }

  #remove(name, id) {
    const table = this.#table(name);
    const before = table.get(id);
    if (!before) return;
    table.delete(id);
    if (this.#tx) this.#tx.undo.push(() => table.set(id, before));
  }

  #insert(name, row) {
    this.#state.ids[name] += 1;
    const now = new Date();
    const kept = stored({ ...row, id: this.#state.ids[name], createdAt: now, ...(INSERT_ONLY.includes(name) ? {} : { updatedAt: now }) });
    this.#check(name, kept);
    this.#put(name, kept);
    return loaded(kept);
  }

  #update(name, id, changes) {
    const key = idFrom(id);
    const before = key === null ? null : this.#table(name).get(key);
    if (!before) return null;
    const { id: _id, createdAt: _createdAt, ...rest } = changes || {};
    const kept = { ...before, ...stored({ ...rest, updatedAt: new Date() }) };
    this.#check(name, kept);
    this.#put(name, kept);
    return loaded(kept);
  }

  #rows(name, test) {
    return [...this.#table(name).values()].filter(test);
  }

  #get(name, id) {
    const key = idFrom(id);
    return key === null ? null : loaded(this.#table(name).get(key));
  }

  // The unique keys schema.sql has. NULLs never clash, as in SQL.
  #check(name, kept) {
    const clash = (test) => [...this.#table(name).values()].some((other) => other.id !== kept.id && test(other));
    const conflict = (what) => {
      throw new StoreConflict(`QuBe Sync (memory store): ${what} is taken`);
    };
    if (name === "connections" && kept.qubeId !== null && clash((o) => same(o.qubeId, kept.qubeId))) {
      conflict(`qube_connections.qube_id ${kept.qubeId}`);
    }
    if (name === "runs" && clash((o) => same(o.reference, kept.reference))) conflict(`qube_runs.reference ${kept.reference}`);
    if (name === "notifications" && clash((o) => same(o.runId, kept.runId) && same(o.deliveryId, kept.deliveryId))) {
      conflict(`qube_notifications (run_id, delivery_id) ${kept.runId}, ${kept.deliveryId}`);
    }
    if (name === "syncMarks" && clash((o) => same(o.connectionId, kept.connectionId) && o.workflow === kept.workflow)) {
      conflict(`qube_sync_marks (connection_id, workflow) ${kept.connectionId}, ${kept.workflow}`);
    }
    if (name === "requests" && clash((o) => same(o.reference, kept.reference))) conflict(`qube_requests.reference ${kept.reference}`);
    if (name === "requestDeliveries" && clash((o) => same(o.requestId, kept.requestId) && o.dedupeKey === kept.dedupeKey)) {
      conflict(`qube_request_deliveries (request_id, dedupe_key) ${kept.requestId}, ${kept.dedupeKey}`);
    }
    if (name === "quickbooksRecords") {
      if (clash((o) => same(o.connectionId, kept.connectionId) && o.list === kept.list && o.qbId === kept.qbId)) {
        conflict(`qube_quickbooks_records (connection_id, list, qb_id) ${kept.list} ${kept.qbId}`);
      }
      const hasRecord = kept.recordType !== null && kept.recordId !== null;
      const sameRecord = (o) => o.kind === kept.kind && o.recordType === kept.recordType && o.recordId === kept.recordId;
      if (hasRecord && clash((o) => same(o.connectionId, kept.connectionId) && sameRecord(o))) {
        conflict(`qube_quickbooks_records (connection_id, kind, record) ${kept.kind} ${kept.recordType} ${kept.recordId}`);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Connections

  async createConnection(fields) {
    const { ownerType, ownerId, qubeId = null, name = null, status = "pending", stallReason = null, revision = null } = fields;
    return this.#insert("connections", {
      ownerType: text(ownerType),
      ownerId: text(ownerId),
      qubeId: text(qubeId),
      name,
      status,
      stallReason,
      revision,
    });
  }

  async getConnection(id) {
    return this.#get("connections", id);
  }

  async updateConnection(id, changes) {
    return this.#update("connections", id, changes);
  }

  async ownedBy(ownerType, ownerId) {
    return [...this.#table("connections").values()]
      .filter((row) => same(row.ownerType, ownerType) && same(row.ownerId, ownerId))
      .map(loaded)
      .sort(newestFirst);
  }

  // -------------------------------------------------------------------------
  // Runs

  async createRun(fields) {
    const { connectionId, operation, recordType, recordId, reference, ...rest } = fields;
    return this.#insert("runs", {
      connectionId,
      operation,
      recordType: text(recordType),
      recordId: text(recordId),
      reference,
      qubeRunId: null,
      input: null,
      revision: 0,
      state: "starting",
      outcome: null,
      error: null,
      cancelReason: null,
      endedAt: null,
      question: null,
      links: null,
      runUrl: null,
      cancelUrl: null,
      ...rest,
    });
  }

  async getRun(id) {
    return this.#get("runs", id);
  }

  async updateRun(id, changes) {
    return this.#update("runs", id, changes);
  }

  async latestRun(recordType, recordId, operation, options) {
    const { connectionId } = options || {};
    const rows = [...this.#table("runs").values()]
      .filter((row) => isRunOf(row, recordType, recordId, operation) && isOnConnection(row, connectionId))
      .map(loaded)
      .sort(newestFirst);
    return rows[0] || null;
  }

  // -------------------------------------------------------------------------
  // Notifications

  async once(runId, deliveryId, fn) {
    return this.transaction(async (tx) => {
      const taken = [...tx.#table("notifications").values()].some((row) => same(row.runId, runId) && same(row.deliveryId, deliveryId));
      if (taken) return false;
      tx.#insert("notifications", { runId, deliveryId: String(deliveryId) });
      await fn();
      return true;
    });
  }

  // -------------------------------------------------------------------------
  // QuickBooks records

  async findQuickbooksRecords(where, options) {
    const { limit } = options || {};
    const keys = ["connectionId", "kind", "list", "qbId", "recordType", "recordId"].filter((key) => where[key] !== undefined);
    const rows = [...this.#table("quickbooksRecords").values()]
      .filter((row) => keys.every((key) => same(row[key], where[key])))
      .sort((a, b) => a.id - b.id)
      .map(loaded);
    return limit === undefined ? rows : rows.slice(0, limit);
  }

  async createQuickbooksRecord(fields) {
    const { connectionId, kind, list, qbId, editSequence = null, name = null, recordType = null, recordId = null } = fields;
    return this.#insert("quickbooksRecords", {
      connectionId,
      kind,
      list,
      qbId: text(qbId),
      editSequence: text(editSequence),
      name,
      recordType: text(recordType),
      recordId: text(recordId),
    });
  }

  async updateQuickbooksRecord(id, changes) {
    const kept = { ...changes };
    for (const key of ["qbId", "editSequence", "recordType", "recordId"]) if (key in kept) kept[key] = text(kept[key]);
    return this.#update("quickbooksRecords", id, kept);
  }

  async deleteQuickbooksRecord(id) {
    const key = idFrom(id);
    if (key !== null) this.#remove("quickbooksRecords", key);
  }

  // -------------------------------------------------------------------------
  // Disconnecting and pruning

  // The row and everything kept against it: runs (with their notifications), requests (with
  // their deliveries), QuickBooks ids and sync marks.
  async deleteConnection(id) {
    const key = idFrom(id);
    if (key === null || !this.#table("connections").get(key)) return false;
    const on = (row) => same(row.connectionId, key);
    for (const run of this.#rows("runs", on)) this.#removeRun(run.id);
    for (const request of this.#rows("requests", on)) this.#removeRequest(request.id);
    for (const row of this.#rows("quickbooksRecords", on)) this.#remove("quickbooksRecords", row.id);
    for (const row of this.#rows("syncMarks", on)) this.#remove("syncMarks", row.id);
    this.#remove("connections", key);
    return true;
  }

  async hasWorkGoing(connectionId, { endedStates }) {
    const on = (row) => same(row.connectionId, connectionId);
    const runs = this.#rows("runs", (row) => on(row) && !endedStates.includes(row.state));
    return runs.length > 0 || this.#rows("requests", (row) => on(row) && row.endedAt === null).length > 0;
  }

  async pruneRuns({ states, before, limit }) {
    const cutoff = before.getTime();
    const rows = this.#rows("runs", (row) => states.includes(row.state) && (row.endedAt === null ? row.updatedAt : row.endedAt) < cutoff)
      .sort((a, b) => a.id - b.id)
      .slice(0, limit);
    for (const row of rows) this.#removeRun(row.id);
    return rows.length;
  }

  async pruneRequests({ before, limit }) {
    const cutoff = before.getTime();
    const rows = this.#rows("requests", (row) => row.endedAt !== null && row.endedAt < cutoff)
      .sort((a, b) => a.id - b.id)
      .slice(0, limit);
    for (const row of rows) this.#removeRequest(row.id);
    return rows.length;
  }

  #removeRun(id) {
    for (const row of this.#rows("notifications", (n) => same(n.runId, id))) this.#remove("notifications", row.id);
    this.#remove("runs", id);
  }

  #removeRequest(id) {
    for (const row of this.#rows("requestDeliveries", (d) => same(d.requestId, id))) this.#remove("requestDeliveries", row.id);
    this.#remove("requests", id);
  }

  // -------------------------------------------------------------------------
  // Sync marks

  async getSyncMark(connectionId, workflow) {
    const [row] = this.#rows("syncMarks", (o) => same(o.connectionId, connectionId) && o.workflow === String(workflow));
    return loaded(row || null);
  }

  // Never moves it back.
  async advanceSyncMark(connectionId, workflow, startedAt) {
    const at = new Date(startedAt);
    const [row] = this.#rows("syncMarks", (o) => same(o.connectionId, connectionId) && o.workflow === String(workflow));
    if (!row) return this.#insert("syncMarks", { connectionId, workflow: String(workflow), startedAt: at });
    if (row.startedAt < at.getTime()) return this.#update("syncMarks", row.id, { startedAt: at });
    return loaded(row);
  }

  // -------------------------------------------------------------------------
  // Plain requests

  async createRequest(fields) {
    const { connectionId, operation, recordType, recordId, reference, ...rest } = fields;
    return this.#insert("requests", {
      connectionId,
      operation,
      recordType: text(recordType),
      recordId: text(recordId),
      reference,
      qubeId: null,
      state: "queued",
      params: null,
      error: null,
      pagesAnswered: 0,
      lastPage: null,
      endedAt: null,
      ...rest,
    });
  }

  async getRequest(id) {
    return this.#get("requests", id);
  }

  async updateRequest(id, changes) {
    return this.#update("requests", id, changes);
  }

  async latestRequest(recordType, recordId, operation, options) {
    const { connectionId } = options || {};
    const rows = this.#rows("requests", (row) => isRunOf(row, recordType, recordId, operation) && isOnConnection(row, connectionId))
      .map(loaded)
      .sort(newestFirst);
    return rows[0] || null;
  }

  // Inserts the delivery unless its key is taken: whether it did.
  async takeRequestDelivery(requestId, dedupeKey, { page = null, state }) {
    const taken = this.#rows("requestDeliveries", (row) => same(row.requestId, requestId) && row.dedupeKey === String(dedupeKey));
    if (taken.length > 0) return false;
    this.#insert("requestDeliveries", { requestId, dedupeKey: String(dedupeKey), page, state: String(state) });
    return true;
  }

  async findRequestDeliveries(requestId) {
    return this.#rows("requestDeliveries", (row) => same(row.requestId, requestId))
      .sort((a, b) => a.id - b.id)
      .map(loaded);
  }
}

/** A store kept in this process's memory: for tests, never production. */
function memoryStore() {
  return new MemoryStore();
}

module.exports = { memoryStore, MemoryStore };
