"use strict";

// Where one of your records stands with QuickBooks on one connection, for one operation, worked
// out from the kit's rows (its runs and its link): never stored. The README's "Sync status" has
// the rules.

const { Run, recordKey } = require("./records");

const STATUSES = Object.freeze(["not_sent", "sending", "needs_answer", "in_quickbooks", "done", "failed", "cancelled"]);

class SyncStatus {
  /** record's status on connection for operation (a slug). */
  static async for(connection, record, operation, { now = new Date() } = {}) {
    const run = await connection.latestRun(record, operation);
    const link = await newestLink(connection, record);
    return new SyncStatus(statusOf(run, link), run, link, now);
  }

  /** record's status on the connection its latest run of operation went out on; not_sent with no run. */
  static async latest(record, operation, { now = new Date(), store } = {}) {
    const run = await Run.latestFor(record, operation, store);
    if (!run || !run.connection) return new SyncStatus("not_sent", null, null, now);
    return SyncStatus.for(run.connection, record, operation, { now });
  }

  /** A run's status with no link looked up (what renderRunStatus makes of a bare Run). */
  static fromRun(run, { now = new Date() } = {}) {
    return new SyncStatus(statusOf(run || null, null), run || null, null, now);
  }

  constructor(status, run, link, now = new Date()) {
    this.status = status;
    this.run = run;
    this.link = link;
    this.qbId = link ? link.qbId : null;
    this.error = status === "failed" && run ? run.error : null;
    this.unconfirmed = status === "sending" && Boolean(run) && run.unconfirmed(now);
    // Starting again makes sense only when nothing in QuickBooks stands for the record.
    this.retry = (status === "failed" || status === "cancelled") && !link;
    this.summaryText = summaryOf(status, run, now);
  }

  toString() {
    return this.status;
  }

  toJSON() {
    const { status, qbId, error, retry, unconfirmed, summaryText } = this;
    return { status, qbId, error, retry, unconfirmed, summaryText };
  }
}

SyncStatus.STATUSES = STATUSES;

// The newest word wins: a run going, a stop since the link, the link, a run done, nothing.
function statusOf(run, link) {
  if (run && !run.ended()) return run.state === "awaiting_input" ? "needs_answer" : "sending";
  if (stoppedSinceLink(run, link)) return run.cancelled() ? "cancelled" : "failed";
  if (link) return "in_quickbooks";
  if (run && run.state === "completed") return "done";
  return "not_sent";
}

function stoppedSinceLink(run, link) {
  if (!run || !(run.failed() || run.cancelled())) return false;
  if (!link) return true;
  const ended = run.endedAt || run.updatedAt;
  return time(link.updatedAt) <= time(ended);
}

function summaryOf(status, run, now) {
  if (status === "not_sent") return null;
  if (status === "in_quickbooks" && (!run || run.state !== "completed")) return "In QuickBooks";
  return run.summaryText(now);
}

function time(value) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

async function newestLink(connection, record) {
  const [type, id] = recordKey(record);
  const rows = await connection.store.findQuickbooksRecords({ connectionId: connection.id, recordType: type, recordId: id });
  return rows.reduce((newest, row) => (newest && isOlder(row, newest) ? newest : row), null);
}

function isOlder(row, than) {
  const diff = time(row.updatedAt) - time(than.updatedAt);
  return diff < 0 || (diff === 0 && Number(row.id) < Number(than.id));
}

// ---------------------------------------------------------------------------
// SQL conditions for list pages: one EXISTS on the kit's tables per row of your table.

const DIALECTS = Object.freeze(["postgres", "mysql", "sqlite"]);
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_$]*(\.[A-Za-z_][A-Za-z0-9_$]*)?$/;
// Inlined as literals, so only characters that need no escaping on any database.
const SAFE_VALUE = /^[A-Za-z0-9_.:\-/ ]{1,255}$/;

function scopeSql(connection, table, options, { from, extra = [], negate = false }) {
  const { recordType, primaryKey = "id", dialect = "postgres", collation = null } = options || {};
  const where = [
    `${from}.connection_id = ${idLiteral(connection.id)}`,
    `${from}.record_type = ${literal(recordType, "recordType")}`,
    `${from}.record_id = ${idAsText(identifier(table, "table"), identifier(primaryKey, "primaryKey"), dialect, collation)}`,
    ...extra,
  ];
  return `${negate ? "NOT EXISTS" : "EXISTS"} (SELECT 1 FROM ${from} WHERE ${where.join(" AND ")})`;
}

function runScopeSql(connection, table, options, states) {
  const operation = literal((options || {}).operation, "operation");
  const inStates = states.map((state) => `'${state}'`).join(", ");
  return scopeSql(connection, table, options, {
    from: "qube_runs",
    extra: [`qube_runs.operation = ${operation}`, `qube_runs.state IN (${inStates})`],
  });
}

// Your primary key as the text record_id keeps (integer or UUID alike).
function idAsText(table, primaryKey, dialect, collation) {
  if (!DIALECTS.includes(dialect)) throw new TypeError(`QuBe Sync: dialect is one of ${DIALECTS.join(", ")}, not ${JSON.stringify(dialect)}`);
  const column = `${table}.${primaryKey}`;
  if (dialect !== "mysql") return `CAST(${column} AS VARCHAR(255))`;
  if (collation === null || collation === undefined) return `CAST(${column} AS CHAR)`;
  // MySQL casts in the connection's collation, which can clash with the column's.
  const name = identifier(collation, "collation");
  return `CONVERT(CAST(${column} AS CHAR) USING ${name.split("_")[0]}) COLLATE ${name}`;
}

function identifier(value, name) {
  if (typeof value !== "string" || !IDENTIFIER.test(value)) {
    throw new TypeError(`QuBe Sync: ${name} must be a plain SQL name (letters, digits, _), not ${JSON.stringify(value)}`);
  }
  return value;
}

function literal(value, name) {
  if (typeof value !== "string" || !SAFE_VALUE.test(value)) {
    throw new TypeError(`QuBe Sync: ${name} must be a string of letters, digits and _ . : - /, not ${JSON.stringify(value)}`);
  }
  return `'${value}'`;
}

function idLiteral(id) {
  const text = String(id);
  return /^\d{1,19}$/.test(text) ? text : literal(text, "the connection's id");
}

/** records in table with a QuickBooks link on connection. */
function inQuickbooksSql(connection, table, options) {
  return scopeSql(connection, table, options, { from: "qube_quickbooks_records" });
}

function notInQuickbooksSql(connection, table, options) {
  return scopeSql(connection, table, options, { from: "qube_quickbooks_records", negate: true });
}

/** records whose run of options.operation on connection waits for your user's answer. */
function needingAnswerSql(connection, table, options) {
  return runScopeSql(connection, table, options, ["awaiting_input"]);
}

/** records whose run of options.operation on connection is on its way (starting or running). */
function sendingSql(connection, table, options) {
  return runScopeSql(connection, table, options, ["starting", "running"]);
}

module.exports = { SyncStatus, STATUSES, inQuickbooksSql, notInQuickbooksSql, needingAnswerSql, sendingSql };
