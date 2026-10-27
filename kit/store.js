"use strict";

// The store: where the kit keeps your customers' connections, the runs your app starts, the
// notifications each run's handler has taken, the QuickBooks ids your app learns, each sync's
// mark and any plain requests with the deliveries they've taken. Node has no
// standard ORM, so the kit defines what a store does and your app's store does it (the
// integration kit generates one for your database). memoryStore() is one, for tests, and
// schema.sql the tables an SQL store keeps them in.
//
// A store is plain reads and writes. What they mean (an id that moves between records, the item
// family's fallback, a notification taken once) is the kit's, above the store, so every store
// behaves alike. qubesync/kit/store-tests checks a store does its part.

// Every method a store has, each async.
const STORE_METHODS = Object.freeze([
  "transaction",
  "createConnection",
  "getConnection",
  "updateConnection",
  "ownedBy",
  "withConnectionLock",
  "createRun",
  "getRun",
  "updateRun",
  "latestRun",
  "withRunLock",
  "once",
  "findQuickbooksRecords",
  "createQuickbooksRecord",
  "updateQuickbooksRecord",
  "deleteQuickbooksRecord",
  "deleteConnection",
  "hasWorkGoing",
  "getSyncMark",
  "advanceSyncMark",
  "pruneRuns",
  "pruneRequests",
  "createRequest",
  "getRequest",
  "updateRequest",
  "latestRequest",
  "withRequestLock",
  "takeRequestDelivery",
  "findRequestDeliveries",
]);

// Each table's columns, by the field a row has in JavaScript: the same tables as qube_rails'
// migrations (schema.sql has them). input, error, question, links and params are JSON, kept as
// text.
const STORE_COLUMNS = Object.freeze({
  qube_connections: Object.freeze({
    id: "id",
    ownerType: "owner_type",
    ownerId: "owner_id",
    qubeId: "qube_id",
    name: "name",
    status: "status",
    stallReason: "stall_reason",
    revision: "revision",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }),
  qube_runs: Object.freeze({
    id: "id",
    connectionId: "connection_id",
    operation: "operation",
    recordType: "record_type",
    recordId: "record_id",
    reference: "reference",
    qubeRunId: "qube_run_id",
    input: "input",
    revision: "revision",
    state: "state",
    outcome: "outcome",
    error: "error",
    cancelReason: "cancel_reason",
    endedAt: "ended_at",
    question: "question",
    links: "links",
    runUrl: "run_url",
    cancelUrl: "cancel_url",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }),
  qube_notifications: Object.freeze({
    id: "id",
    runId: "run_id",
    deliveryId: "delivery_id",
    createdAt: "created_at",
  }),
  qube_quickbooks_records: Object.freeze({
    id: "id",
    connectionId: "connection_id",
    kind: "kind",
    list: "list",
    qbId: "qb_id",
    editSequence: "edit_sequence",
    name: "name",
    recordType: "record_type",
    recordId: "record_id",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }),
  qube_sync_marks: Object.freeze({
    id: "id",
    connectionId: "connection_id",
    workflow: "workflow",
    startedAt: "started_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }),
  qube_requests: Object.freeze({
    id: "id",
    connectionId: "connection_id",
    operation: "operation",
    recordType: "record_type",
    recordId: "record_id",
    reference: "reference",
    qubeId: "qube_id",
    state: "state",
    params: "params",
    error: "error",
    pagesAnswered: "pages_answered",
    lastPage: "last_page",
    endedAt: "ended_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }),
  qube_request_deliveries: Object.freeze({
    id: "id",
    requestId: "request_id",
    dedupeKey: "dedupe_key",
    page: "page",
    state: "state",
    createdAt: "created_at",
  }),
});

// The columns kept as JSON text: a run's, and a request's params and error.
const JSON_COLUMNS = Object.freeze(["input", "error", "question", "links", "params"]);

const NAME_KINDS = Object.freeze(["customer", "vendor", "employee", "other_name"]);

// The list family a kind's ids are unique within: "name" for customers, vendors, employees and
// other names; "item" for "item" and every item_* kind; for anything else (an account, a class, a
// transaction, a kind this version doesn't know) the kind itself. TxnIDs are taken as unique per
// transaction type until QuickBooks shows otherwise.
//
// QuickBooks makes a ListID unique within a list family, not within one kind (verified on
// QuickBooks Enterprise 24.0): customers, vendors, employees and other names share one counter,
// every item type shares another, and each other list (accounts, classes, terms...) has its own,
// while the same counter value turns up in several families.
function familyFor(kind) {
  const text = kind === null || kind === undefined ? "" : String(kind);
  if (NAME_KINDS.includes(text)) return "name";
  if (text === "item" || text.startsWith("item_")) return "item";
  return text;
}

// The methods value is missing, for the store setting's check.
function missingStoreMethods(value) {
  if (!value || (typeof value !== "object" && typeof value !== "function")) return STORE_METHODS.slice();
  return STORE_METHODS.filter((name) => typeof value[name] !== "function");
}

module.exports = { STORE_METHODS, STORE_COLUMNS, JSON_COLUMNS, NAME_KINDS, familyFor, missingStoreMethods };
