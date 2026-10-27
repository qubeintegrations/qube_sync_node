// Type definitions for qubesync/kit: QuBe Sync's integration kit without a framework.

import type { APIError, Client, ConnectionEvent, NotificationEvent, RequestEvent, WebhookEvent, WorkflowRunEvent } from "../index";

export type { ConnectionEvent, NotificationEvent, RequestEvent, WebhookEvent, WorkflowRunEvent };
export { APIError } from "../index";

/** A webhook, as qubesync parses it. */
export type QubeEvent = WebhookEvent;

type Awaitable<T> = T | Promise<T>;
/** An id as a store keeps it: a number, or a string (a bigint from pg, a UUID). From a URL, always a string. */
export type RowId = string | number;

// ---------------------------------------------------------------------------
// Questions

/** Where a question is answered, and where its record field searches (while it has one). */
export interface QubeLinks {
  decisions: string | null;
  search?: string | null;
}

/** One choice: picked as it is, or once its fields are filled in. A record field's value comes from a search. */
export interface QubeChoice {
  id: string;
  label: string;
  description?: string | null;
  detail?: string | null;
  fields?: QubeField[];
}

export interface QubeField {
  name: string;
  /** string, number, boolean or record */
  type: string;
  label?: string | null;
  required?: boolean;
  kind?: string;
}

/** A question a run asks (event.prompt), as Operation's question keeps it on the run. */
export interface QubePrompt {
  id: string;
  token: string;
  kind: string;
  message?: string;
  details?: { label: string; value: string }[];
  choices?: QubeChoice[];
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// The store

/** A qube_connections row. */
export interface ConnectionRow {
  id: RowId;
  ownerType: string;
  ownerId: string;
  qubeId: string | null;
  name: string | null;
  /** pending, connected, setup_cancelled or stalled */
  status: string;
  /** not_checking_in or quickbooks_unavailable, while stalled */
  stallReason: string | null;
  revision: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A qube_runs row. input, error, question and links are JSON (kept as text). */
export interface RunRow {
  id: RowId;
  connectionId: RowId;
  operation: string;
  recordType: string;
  recordId: string;
  reference: string;
  qubeRunId: string | null;
  input: unknown;
  revision: number;
  /** starting, running, awaiting_input, completed, failed or cancelled */
  state: string;
  outcome: string | null;
  /** A sentence, or { code, message, detail }, as the failed event carried it. */
  error: unknown;
  cancelReason: string | null;
  endedAt: Date | null;
  question: QubePrompt | null;
  links: QubeLinks | null;
  runUrl: string | null;
  cancelUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A qube_sync_marks row: when the connection's last completed run of the workflow started. */
export interface SyncMarkRow {
  id: RowId;
  connectionId: RowId;
  workflow: string;
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** A qube_requests row: one plain v2 request. params and error are JSON. */
export interface QueuedRequestRow {
  id: RowId;
  connectionId: RowId;
  /** The PlainRequest's slug. */
  operation: string;
  recordType: string;
  recordId: string;
  /** The Idempotency-Key. */
  reference: string;
  qubeId: string | null;
  /** queued, retryable, response_received, error, timed_out, discarded, or failed (refused, or params threw). */
  state: string;
  params: unknown;
  error: unknown;
  pagesAnswered: number;
  lastPage: number | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A qube_request_deliveries row: a request webhook taken, by page_request_id:state. */
export interface RequestDeliveryRow {
  id: RowId;
  requestId: RowId;
  dedupeKey: string;
  page: number | null;
  state: string;
  createdAt: Date;
}

export interface NewQueuedRequest {
  connectionId: RowId;
  operation: string;
  recordType: string;
  recordId: string;
  reference: string;
  /** Default "queued". */
  state?: string;
  [field: string]: unknown;
}

/** A qube_quickbooks_records row. list is the kind's family (familyFor). */
export interface QuickbooksRecordRow {
  id: RowId;
  connectionId: RowId;
  kind: string;
  list: string;
  qbId: string;
  editSequence: string | null;
  name: string | null;
  recordType: string | null;
  recordId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewConnection {
  ownerType: string;
  ownerId: string;
  qubeId?: string | null;
  name?: string | null;
  /** Default "pending". */
  status?: string;
  stallReason?: string | null;
  revision?: number | null;
}

export interface NewRun {
  connectionId: RowId;
  operation: string;
  recordType: string;
  recordId: string;
  reference: string;
  /** Default "starting". */
  state?: string;
  /** Default 0. */
  revision?: number;
  [field: string]: unknown;
}

export interface NewQuickbooksRecord {
  connectionId: RowId;
  kind: string;
  list: string;
  qbId: string;
  editSequence?: string | null;
  name?: string | null;
  recordType?: string | null;
  recordId?: string | null;
}

/** Which QuickBooks records: connectionId and any of the others, each matched exactly (null matches null). */
export interface QuickbooksRecordWhere {
  connectionId: RowId;
  kind?: string;
  list?: string;
  qbId?: string;
  recordType?: string | null;
  recordId?: string | null;
}

export interface FindOptions {
  /** At most this many rows. */
  limit?: number;
  /** Lock the rows found for the rest of the transaction (SELECT ... FOR UPDATE). */
  lock?: boolean;
}

/**
 * Where the kit keeps connections, runs, notifications and QuickBooks ids: plain reads and writes,
 * each async. Rows come back as written, with the JSON columns parsed and the times as Dates. A
 * write that breaks a unique key (schema.sql's) throws StoreConflict. An id from a URL that isn't
 * a valid id finds nothing (null). qubesync/kit/store-tests checks a store does its part;
 * memoryStore() is one.
 */
export interface Store {
  /** fn in a transaction (a savepoint when called on a transaction's store), with the store bound to it; rolled back when fn throws. */
  transaction<T>(fn: (tx: Store) => Promise<T>): Promise<T>;

  createConnection(fields: NewConnection): Promise<ConnectionRow>;
  getConnection(id: RowId): Promise<ConnectionRow | null>;
  /** The row as written, or null when there's none. */
  updateConnection(id: RowId, changes: Partial<ConnectionRow>): Promise<ConnectionRow | null>;
  /** An owner's connections, newest first (createdAt, then id, descending). */
  ownedBy(ownerType: string, ownerId: string): Promise<ConnectionRow[]>;
  /** fn in a transaction holding the connection row's lock, with the row as it is now (null when there's none). Re-entrant within its transaction. */
  withConnectionLock<T>(id: RowId, fn: (tx: Store, row: ConnectionRow | null) => Promise<T>): Promise<T>;

  createRun(fields: NewRun): Promise<RunRow>;
  getRun(id: RowId): Promise<RunRow | null>;
  updateRun(id: RowId, changes: Partial<RunRow>): Promise<RunRow | null>;
  /** A record's newest run of an operation (createdAt, then id, descending), or null; with connectionId, on that connection only. */
  latestRun(recordType: string, recordId: string, operation: string, options?: { connectionId?: RowId }): Promise<RunRow | null>;
  /** fn in a transaction holding the run row's lock, with the row as it is now (null when there's none). Re-entrant within its transaction. */
  withRunLock<T>(id: RowId, fn: (tx: Store, row: RunRow | null) => Promise<T>): Promise<T>;

  /**
   * Runs fn unless the run has taken deliveryId already (qube_notifications), and resolves to whether
   * it ran. The row is written in the same transaction as fn: when fn throws, nothing is taken.
   */
  once(runId: RowId, deliveryId: string, fn: () => Promise<unknown>): Promise<boolean>;

  /** In id order. */
  findQuickbooksRecords(where: QuickbooksRecordWhere, options?: FindOptions): Promise<QuickbooksRecordRow[]>;
  createQuickbooksRecord(fields: NewQuickbooksRecord): Promise<QuickbooksRecordRow>;
  updateQuickbooksRecord(id: RowId, changes: Partial<QuickbooksRecordRow>): Promise<QuickbooksRecordRow | null>;
  deleteQuickbooksRecord(id: RowId): Promise<void>;

  /** Deletes the connection with its runs (and their notifications), requests (and their deliveries), QuickBooks ids and sync marks. Called inside a transaction. */
  deleteConnection(id: RowId): Promise<unknown>;
  /** Whether the connection has a run whose state isn't one of endedStates, or a request with no endedAt. */
  hasWorkGoing(connectionId: RowId, options: { endedStates: readonly string[] }): Promise<boolean>;

  getSyncMark(connectionId: RowId, workflow: string): Promise<SyncMarkRow | null>;
  /** Writes the mark, or moves it to startedAt when that's later: never back. */
  advanceSyncMark(connectionId: RowId, workflow: string, startedAt: Date): Promise<unknown>;

  /** Deletes up to limit runs in states whose COALESCE(endedAt, updatedAt) is before `before` (their notifications with them); resolves to how many. */
  pruneRuns(options: { states: readonly string[]; before: Date; limit: number }): Promise<number>;
  /** Deletes up to limit requests whose endedAt is before `before` (their deliveries with them); resolves to how many. */
  pruneRequests(options: { before: Date; limit: number }): Promise<number>;

  createRequest(fields: NewQueuedRequest): Promise<QueuedRequestRow>;
  getRequest(id: RowId): Promise<QueuedRequestRow | null>;
  updateRequest(id: RowId, changes: Partial<QueuedRequestRow>): Promise<QueuedRequestRow | null>;
  /** A record's newest request of a slug (createdAt, then id, descending), or null; with connectionId, on that connection only. */
  latestRequest(recordType: string, recordId: string, operation: string, options?: { connectionId?: RowId }): Promise<QueuedRequestRow | null>;
  /** fn in a transaction holding the request row's lock, with the row as it is now (null when there's none). Re-entrant within its transaction. */
  withRequestLock<T>(id: RowId, fn: (tx: Store, row: QueuedRequestRow | null) => Promise<T>): Promise<T>;
  /** Inserts the delivery unless (requestId, dedupeKey) is taken; resolves to whether it did. In the caller's transaction. */
  takeRequestDelivery(requestId: RowId, dedupeKey: string, fields: { page: number | null; state: string }): Promise<boolean>;
  /** A request's deliveries, in id order. */
  findRequestDeliveries(requestId: RowId): Promise<RequestDeliveryRow[]>;
}

/** A store kept in this process's memory: for tests and trying the kit out, never production. */
export declare function memoryStore(): Store;
/** Every method a store has. */
export declare const STORE_METHODS: readonly string[];
/** Each table's columns, by the field a row has in JavaScript: the tables schema.sql makes. */
export declare const STORE_COLUMNS: Readonly<
  Record<
    "qube_connections" | "qube_runs" | "qube_notifications" | "qube_quickbooks_records" | "qube_sync_marks" | "qube_requests" | "qube_request_deliveries",
    Readonly<Record<string, string>>
  >
>;
/** Where schema.sql is (also qubesync/kit/schema.sql). */
export declare const SCHEMA_PATH: string;
/** The list family a kind's ids are unique within: "name", "item", or the kind itself. */
export declare function familyFor(kind: string | null | undefined): string;

// ---------------------------------------------------------------------------
// Errors

/** A setting your app hasn't written, thrown the first time it's needed. */
export declare class NotConfigured extends Error {}
/** A run or request whose slug none of the operations setting has any more. */
export declare class UnknownOperation extends Error {}
/** A connection's event came before its qubeId was saved: the job throws it so the queue retries. */
export declare class NotReady extends Error {}
/** Operation.start was given a connection QuBe Sync hasn't made yet (no qubeId). */
export declare class NotConnected extends TypeError {}
/** An input's reference QuickBooks requires has no link and no name: thrown from input, so the start fails before anything is sent. */
export declare class MissingReference extends TypeError {}
/** A store's write broke a unique key. */
export declare class StoreConflict extends Error {}

// ---------------------------------------------------------------------------
// Settings

/** A verified delivery, as enqueue is given it and run takes it. body is the raw body, as text. */
export interface QubeDelivery {
  kind: "run" | "connection" | "request";
  id: string;
  body: string;
}

/** A record of your app's: anything with an id. */
export interface QubeRecord {
  id: string | number;
  [field: string]: any;
}

/** An Operation subclass: what the operations setting lists. */
export type OperationClass = (new (record: any, run: Run) => Operation) & {
  readonly slug: string;
  readonly workflow: string;
  findRecord(id: string): Promise<any>;
  recordFor(run: Run): Promise<any>;
  retryStart(run: Run): Promise<Run>;
};

/** A PlainRequest subclass: the operations setting lists these too. */
export type PlainRequestClass = (new (record: any, queuedRequest: QueuedRequest) => PlainRequest) & {
  readonly slug: string;
  /** The v2 operation id, such as "customer.query". */
  readonly operation: string;
  findRecord(id: string): Promise<any>;
  recordFor(queuedRequest: QueuedRequest): Promise<any>;
  retryQueue(queuedRequest: QueuedRequest): Promise<QueuedRequest>;
};

/** A ConnectionEvents subclass: the connectionEvents setting. */
export type ConnectionEventsClass = new (connection: Connection) => ConnectionEvents;

/** What configure takes. A key left out keeps what was set before; null or undefined unsets it. */
export interface SettingsOptions<Request = any> {
  /** Where connections, runs, notifications and QuickBooks ids are kept. Required. */
  store?: Store | null;
  /** slug → Operation or PlainRequest class. Each class's static slug must be its key. */
  operations?: { [slug: string]: OperationClass | PlainRequestClass } | Map<string, OperationClass | PlainRequestClass> | null;
  /** Your class for a connection's events (extends ConnectionEvents). */
  connectionEvents?: ConnectionEventsClass | null;
  /** The signed-in customer's account, from the request: it owns the connections onboarding makes. null answers 401. */
  currentAccount?: ((request: Request) => Awaitable<QubeRecord | null | undefined>) | null;
  /**
   * True when the signed-in user may answer or search `run`'s question (or retry its start). Only
   * `true` allows: anything else is a 404. Default: currentAccount owns the run's connection,
   * compared by type and id, so a null account never matches; it throws NotConfigured while currentAccount is unset.
   */
  authorizeQuestion?: ((request: Request, record: any, run: Run) => Awaitable<unknown>) | null;
  /** The type a record's rows keep. Default: its class's name. */
  recordType?: ((record: any) => string) | null;
  /** Your record of that type and id, or null: for an operation with no findRecord, findLinked and owner(). */
  findRecord?: ((type: string, id: string) => Awaitable<any>) | null;
  /** Hands a verified delivery to your queue, whose worker calls run(delivery). false or a throw answers 503. Default: job() in this process. */
  enqueue?: ((delivery: QubeDelivery) => unknown) | null;
  /** How many times job() runs a delivery before it gives up. Default 10. */
  jobAttempts?: number | null;
  /** Milliseconds ended runs and requests are kept before pruneRuns() deletes them: at least DAY_MS. Default null: never. */
  pruneRunsAfter?: number | null;
  /** Default: QUBE_API_KEY. Never logged or shown. */
  apiKey?: string | null;
  /** Default: QUBE_URL, else https://qubesync.com. */
  baseUrl?: string | null;
  /** Default: QUBE_WEBHOOK_SECRET. A list while one rotates. Never logged or shown. */
  webhookSecret?: string | readonly string[] | null;
  /** Default: QUBE_WEBHOOK_URL: your app's /webhooks/qube, the base of every webhook URL. */
  webhookUrl?: string | null;
}

/** The settings as read: each getter throws NotConfigured, naming your config file, when it's needed and unset. */
export declare class Settings {
  readonly store: Store;
  readonly operations: Map<string, OperationClass | PlainRequestClass>;
  readonly connectionEvents: ConnectionEventsClass;
  readonly currentAccount: (request: any) => Awaitable<QubeRecord | null | undefined>;
  readonly authorizeQuestion: (request: any, record: any, run: Run) => Awaitable<unknown>;
  readonly recordType: (record: any) => string;
  readonly findRecord: (type: string, id: string) => Awaitable<any>;
  readonly enqueue: (delivery: QubeDelivery) => unknown;
  readonly jobAttempts: number;
  readonly pruneRunsAfter: number | null;
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly webhookSecret: string | readonly string[];
  /** Without a trailing slash. */
  readonly webhookUrl: string;
  /** Whether your app set key, rather than leaving it to a default or the environment. */
  isSet(key: string): boolean;
  /** The Operation class for a slug, or null. */
  operationClass(slug: string): OperationClass | null;
  /** The PlainRequest class for a slug, or null. */
  requestClass(slug: string): PlainRequestClass | null;
  /** What's set, with the secrets hidden. */
  describe(): Record<string, unknown>;
  toJSON(): Record<string, unknown>;
}

export declare const SETTINGS: readonly string[];
export declare const CONFIG_FILE: string;
export declare const DEFAULT_JOB_ATTEMPTS: number;
/** A day in milliseconds: pruneRunsAfter's least. */
export declare const DAY_MS: number;

/** Sets the kit's settings, once, in your app's quickbooks-desktop/config. Returns them. */
export declare function configure<Request = any>(options: SettingsOptions<Request>): Settings;
export declare function configure(options: Settings): Settings;
export declare function settings(): Settings;
/** Forgets every setting (for tests). */
export declare function resetSettings(): void;

/** The configured Client (apiKey, baseUrl), made once, with the retry log. */
export declare function client(): Client;
/** True for a request QuBe Sync never answered (a network error or timeout), not a refusal. */
export declare function isNoAnswer(err: unknown): boolean;

/** [type, id] as a row keeps a record: the recordType setting's type, and the id as a string. */
export declare function recordKey(record: QubeRecord): [string, string];

// ---------------------------------------------------------------------------
// Rows

export interface LinkOptions {
  /** customer, vendor, item_service, invoice... */
  kind: string;
  /** The ListID or TxnID. */
  qbId: string | number | null | undefined;
  editSequence?: string | number | null;
  /** FullName, or RefNumber. */
  name?: string | null;
}

/** The SQL a list page's condition is written for. */
export type SqlDialect = "postgres" | "mysql" | "sqlite";

/** Which of your tables a sync status SQL condition is about. */
export interface SyncSqlOptions {
  /** The type the kit keeps for its records (the recordType setting's: by default the class name). */
  recordType: string;
  /** Its primary key column. Default "id". */
  primaryKey?: string;
  /** Default "postgres". */
  dialect?: SqlDialect;
  /** MySQL: the record_id column's collation, when the connection's differs. */
  collation?: string | null;
}

export interface SyncRunSqlOptions extends SyncSqlOptions {
  /** The operation's slug. */
  operation: string;
}

/** One QuickBooks Desktop connection (a company file): a qube_connections row with what it means. */
export declare class Connection implements ConnectionRow {
  /** Clock difference allowed between this app and QuBe Sync, for adoption. */
  static CLOCK_SKEW_SECONDS: number;
  /** The connection with that id, or null. */
  static get(id: RowId, store?: Store): Promise<Connection | null>;
  /** An owner's connections, newest first. */
  static ownedBy(owner: QubeRecord, store?: Store): Promise<Connection[]>;
  /** A new "pending" row for owner, with no qubeId. */
  static create(owner: QubeRecord, options?: { name?: string | null }, store?: Store): Promise<Connection>;

  constructor(row: ConnectionRow, store?: Store);
  readonly store: Store;

  id: RowId;
  ownerType: string;
  ownerId: string;
  qubeId: string | null;
  name: string | null;
  status: string;
  stallReason: string | null;
  revision: number | null;
  createdAt: Date;
  updatedAt: Date;

  /** QUBE_WEBHOOK_URL/connections/<id>. */
  webhookUrl(): string;
  connected(): boolean;
  /** Stalled because the Web Connector isn't checking in. */
  notCheckingIn(): boolean;
  /** The account that connected it, through the findRecord setting. */
  owner<A = any>(): Promise<A>;
  /** Writes changes to its row, and takes the row as written. */
  update(changes: Partial<ConnectionRow>): Promise<this>;
  /** record's newest run of operation on this connection, or null. */
  latestRun(record: QubeRecord, operation: string): Promise<Run | null>;
  /** When its last completed run of workflow started, or null before one: a sync's next since. */
  lastSyncedAt(workflow: string): Promise<Date | null>;
  /** Deletes the row with its runs, requests, QuickBooks ids and sync marks, after your connectionEvents class's disconnected(), in one transaction. */
  disconnect(): Promise<void>;
  /** Where record stands with QuickBooks here for operation, worked out from its runs and its link. Throws for a slug the operations setting doesn't have. */
  syncStatus(record: QubeRecord, operation: string, options?: { now?: Date }): Promise<SyncStatus>;
  /** `EXISTS (...)`: table's rows with a QuickBooks link on this connection. For a WHERE clause; values are inlined, checked. */
  inQuickbooksSql(table: string, options: SyncSqlOptions): string;
  /** `NOT EXISTS (...)`: table's rows with no link on this connection. */
  notInQuickbooksSql(table: string, options: SyncSqlOptions): string;
  /** table's rows whose run of options.operation here is waiting for an answer. */
  needingAnswerSql(table: string, options: SyncRunSqlOptions): string;
  /** table's rows whose run of options.operation here is starting or running. */
  sendingSql(table: string, options: SyncRunSqlOptions): string;
  /** For a row without a qubeId: QuBe Sync's connection made for it, adopted and saved, or null. */
  adoptQubeConnection(): Promise<string | null>;
  /** Keeps record's QuickBooks id for kind; an id linked to another record moves (logged). */
  link(record: QubeRecord, options: LinkOptions): Promise<QuickbooksRecordRow>;
  /** record's QuickBooks id for kind, else its one link in the kind's family (never across the name family), or null. */
  qbIdFor(record: QubeRecord, options: { kind: string }): Promise<string | null>;
  /** Your record linked to that QuickBooks id (through findRecord), or null; without a kind, throws when the id is in two families. */
  findLinked<R = any>(qbId: string, options?: { kind?: string | null }): Promise<R | null>;
  /** The row for that QuickBooks id, or null; without a kind, throws when the id is in two families. */
  quickbooksRecord(qbId: string, options?: { kind?: string | null }): Promise<QuickbooksRecordRow | null>;
}

/** One workflow run: a qube_runs row with what it means, and its connection. */
export declare class Run implements RunRow {
  static ENDED_STATES: readonly string[];
  static UNCONFIRMED_AFTER_SECONDS: number;
  /** How long a confirmed run may go quiet before looksStuck: 600. */
  static QUIET_AFTER_SECONDS: number;
  /** The run with that id, with its connection, or null. */
  static get(id: RowId, store?: Store): Promise<Run | null>;
  /** A row from the store, with its connection. */
  static load(row: RunRow, store?: Store): Promise<Run>;
  /** record's newest run of operation, or null. Throws for a slug the operations setting doesn't have. */
  static latestFor(record: QubeRecord, operation: string, store?: Store): Promise<Run | null>;

  constructor(row: RunRow, store?: Store, connection?: Connection | null);
  readonly store: Store;
  readonly connection: Connection;
  /** True when Operation.start returned this run, one that hadn't ended, rather than starting another. */
  reused: boolean;

  id: RowId;
  connectionId: RowId;
  operation: string;
  recordType: string;
  recordId: string;
  reference: string;
  qubeRunId: string | null;
  input: unknown;
  revision: number;
  state: string;
  outcome: string | null;
  error: unknown;
  cancelReason: string | null;
  endedAt: Date | null;
  question: QubePrompt | null;
  links: QubeLinks | null;
  runUrl: string | null;
  cancelUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  update(changes: Partial<RunRow>): Promise<this>;
  /** Sends a start that got no answer again, with the same reference (the Idempotency-Key). */
  retryStart(): Promise<Run>;
  /** QUBE_WEBHOOK_URL/runs/<id>. */
  webhookUrl(): string;
  ended(): boolean;
  failed(): boolean;
  /** Cancelled, or completed on a "cancelled" outcome. */
  cancelled(): boolean;
  /** Still "starting" a minute after it was written. */
  unconfirmed(now?: Date): boolean;
  /** Confirmed, not ended, quiet for 10 minutes, and running or awaiting a question this app never received. */
  looksStuck(now?: Date): boolean;
  /** "Added to QuickBooks", "Done", "Failed: <message>", "Cancelled: <reason>", "Waiting for your answer", "Starting", "Not confirmed by QuBe Sync yet" or "Running". */
  summaryText(now?: Date): string;
  cancelReasonText(): string;
  errorMessage(): string | null;
  errorDetail(): string | null;
  openQuestion(): QubePrompt | null;
}

/** not_sent, sending, needs_answer, in_quickbooks, done, failed or cancelled. */
export type SyncStatusName = "not_sent" | "sending" | "needs_answer" | "in_quickbooks" | "done" | "failed" | "cancelled";

/** Where a record stands with QuickBooks on one connection for one operation: derived from its runs and its link, never stored. */
export declare class SyncStatus {
  static readonly STATUSES: readonly SyncStatusName[];
  /** record's status on connection for operation (a slug). */
  static for(connection: Connection, record: QubeRecord, operation: string, options?: { now?: Date }): Promise<SyncStatus>;
  /** record's status on the connection its latest run of operation went out on; not_sent with no run. */
  static latest(record: QubeRecord, operation: string, options?: { now?: Date; store?: Store }): Promise<SyncStatus>;
  /** A run's status with no link looked up. */
  static fromRun(run: Run | null | undefined, options?: { now?: Date }): SyncStatus;

  constructor(status: SyncStatusName, run: Run | null, link: QuickbooksRecordRow | null, now?: Date);
  readonly status: SyncStatusName;
  /** The latest run, or null. */
  readonly run: Run | null;
  /** The record's newest link on the connection, or null. */
  readonly link: QuickbooksRecordRow | null;
  /** The record's QuickBooks id here when it's linked (always, for in_quickbooks). */
  readonly qbId: string | null;
  /** A failed run's error, as its event carried it. */
  readonly error: unknown;
  /** Failed or cancelled, and not linked: starting again makes sense. */
  readonly retry: boolean;
  /** Sending, with a start QuBe Sync hasn't confirmed for a minute. */
  readonly unconfirmed: boolean;
  /** In a sentence for a person ("In QuickBooks", or the run's summaryText), or null when not_sent. */
  readonly summaryText: string | null;
  toString(): SyncStatusName;
  toJSON(): { status: SyncStatusName; qbId: string | null; error: unknown; retry: boolean; unconfirmed: boolean; summaryText: string | null };
}

// ---------------------------------------------------------------------------
// Bases

export interface QuickbooksRefOptions {
  kind: string;
  name?: string | null;
}

/** A QuickBooks record an ending carries, keyed by the input's path in output.references. */
export interface QubeReference {
  kind?: string;
  outcome?: string;
  record?: { type?: string; list_id?: string; edit_sequence?: string; full_name?: string; [key: string]: any } | null;
  [key: string]: any;
}

/**
 * One way your app starts a workflow, and what it does with that run's webhooks. Subclass it per
 * operation, with a static workflow and slug, input, and the handlers your app needs.
 */
export declare class Operation<R extends QubeRecord = QubeRecord> {
  /** The workflow the operation starts. */
  static workflow: string;
  /** Its key in the operations setting, kept on each run. */
  static slug: string;
  /**
   * Writes the run ("starting"), starts it on the connection, keeps QuBe Sync's answer; resolves to the run. While the
   * record's last run of the operation on that connection hasn't ended, resolves to that run instead (run.reused).
   */
  static start<R extends QubeRecord>(this: new (record: R, run: Run) => Operation<R>, record: R, connection: Connection | ConnectionRow): Promise<Run>;
  /** Sends a start that got no answer again, with the same reference; a run already answered is returned as it is. */
  static retryStart(run: Run): Promise<Run>;
  /** Your record, by the id its run keeps. Leave it out to use the findRecord setting. */
  static findRecord(id: string): Promise<any>;
  /** The run's record: findRecord when written, else the findRecord setting's. */
  static recordFor(run: Run): Promise<any>;

  constructor(record: R, run: Run | null);
  record: R;
  run: Run;
  /** The run's connection: link and qbIdFor go through it. */
  readonly connection: Connection;
  /** The run's store: inside a handler, the run lock's transaction. */
  readonly store: Store;

  /**
   * The run's input, from the record. It may return what the module `npx qubesync workflows` writes
   * builds for the workflow, typed as `<Workflow><Branch>Input`: `input(): AddTransactionInvoiceInput`
   * returning `addTransaction.invoiceInput(params, { adds })`, imported from `../qube-workflows`.
   */
  input(): unknown;
  /** Checks the reference and connection, takes a notification once, applies a run event when it's newer, under the run's lock. */
  handle(event: QubeEvent): Promise<void>;
  question(event: WorkflowRunEvent): Promise<void>;
  notification(event: NotificationEvent): Promise<void>;
  ended(event: WorkflowRunEvent): Promise<void>;
  failed(event: WorkflowRunEvent): Promise<void>;
  /** { list_id } when linked on the run's connection, else { full_name }, or null. */
  quickbooksRef(appRecord: QubeRecord | null | undefined, options: QuickbooksRefOptions): Promise<{ list_id: string } | { full_name: string } | null>;
  /** Links each reference an ending carries to the record your function returns for it (null skips it). */
  linkReferences(event: WorkflowRunEvent | { output?: unknown }, recordFor: (path: string, entry: QubeReference) => Awaitable<QubeRecord | null | undefined>): Promise<QuickbooksRecordRow[]>;
  /** Forgets the question once answered, unless the run has asked another since; taken: QuBe Sync took the answer, so the run is running again. */
  answered(token: string, options?: { taken?: boolean }): Promise<void>;
  /** When this connection's last completed run of the operation's workflow started, or null: a sync's since. */
  lastSyncedAt(): Promise<Date | null>;
  /** The value without its null and undefined values, at every depth: typed as WithoutNils<T>. */
  withoutNils<T>(value: T): WithoutNils<T>;
  logEvent(event: QubeEvent): void;
}

/** A connection's own events. Your connectionEvents class extends it. */
export declare class ConnectionEvents {
  static STATUS: Readonly<Record<string, string>>;
  constructor(connection: Connection | ConnectionRow);
  connection: Connection;
  /** The connection's store: inside a handler, the connection lock's transaction. */
  readonly store: Store;
  /** The account that connected it, through the findRecord setting. */
  owner<A = any>(): Promise<A>;
  /** Adopts or waits for a qubeId (NotReady), checks the connection id, applies an event when it's newer, under the connection's lock. */
  handle(event: QubeEvent): Promise<void>;
  connected(event: ConnectionEvent): Promise<void>;
  setupCancelled(event: ConnectionEvent): Promise<void>;
  stalled(event: ConnectionEvent): Promise<void>;
  resumed(event: ConnectionEvent): Promise<void>;
  /** The account disconnected it: delete your rows that point at it, through this.store. In the transaction that deletes it. */
  disconnected(): Promise<void>;
  logEvent(event: QubeEvent): void;
}

/** One plain v2 request: a qube_requests row with what it means, and its connection. */
export declare class QueuedRequest implements QueuedRequestRow {
  static get(id: RowId, store?: Store): Promise<QueuedRequest | null>;
  static load(row: QueuedRequestRow, store?: Store): Promise<QueuedRequest>;
  constructor(row: QueuedRequestRow, store?: Store, connection?: Connection | null);
  readonly store: Store;
  readonly connection: Connection | null;
  /** Set by PlainRequest.queue when it returned this row rather than queueing another. Not saved. */
  reused: boolean;

  id: RowId;
  connectionId: RowId;
  operation: string;
  recordType: string;
  recordId: string;
  reference: string;
  qubeId: string | null;
  state: string;
  params: unknown;
  error: unknown;
  pagesAnswered: number;
  lastPage: number | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  update(changes: Partial<QueuedRequestRow>): Promise<this>;
  /** QUBE_WEBHOOK_URL/requests/<id>. */
  webhookUrl(): string;
  ended(): boolean;
  /** Every page answered. */
  done(): boolean;
  /** A queue QuBe Sync never confirmed, sent again with the same params and Idempotency-Key. */
  retryQueue(): Promise<QueuedRequest>;
}

/** One v2 operation your app queues itself, with no workflow, and what it does with its webhooks. */
export declare class PlainRequest<R extends QubeRecord = QubeRecord> {
  /** The slug its rows keep: its key in the operations setting. */
  static slug: string;
  /** The v2 operation id, such as "customer.query". */
  static operation: string;
  /** For an operation id this version doesn't know: its method and path (relative to the connection). */
  static method?: string;
  static path?: string;
  /** record's request on connection: the one that hasn't ended (reused), else a new one queued. */
  static queue<R extends QubeRecord>(this: new (record: R, queuedRequest: QueuedRequest) => PlainRequest<R>, record: R, connection: Connection | ConnectionRow): Promise<QueuedRequest>;
  static retryQueue(queuedRequest: QueuedRequest): Promise<QueuedRequest>;
  static findRecord(id: string): Promise<any>;
  static recordFor(queuedRequest: QueuedRequest): Promise<any>;

  constructor(record: R, queuedRequest: QueuedRequest | null);
  record: R;
  queuedRequest: QueuedRequest | null;
  readonly connection: Connection | null;
  /** Inside a handler, the request lock's transaction. */
  readonly store: Store;

  /** The operation's params, from the record. */
  params(): unknown;
  /** One answered page: event.responseJson, event.page. */
  answered(event: RequestEvent): Promise<void>;
  /** Every page 1..N answered. Called once. */
  done(): Promise<void>;
  /** error or discarded. */
  failed(event: RequestEvent): Promise<void>;
  /** QuBe Sync keeps trying. Never resend. */
  retrying(event: RequestEvent): Promise<void>;
  /** The answer never came back. Default: failed(event). */
  timedOut(event: RequestEvent): Promise<void>;
  /** Takes a delivery once by page_request_id:state, under the request's lock. */
  handle(event: QubeEvent): Promise<void>;
  logEvent(event: RequestEvent): void;
}

/** Deletes ended runs and requests older than the pruneRunsAfter setting (never within a day). Does nothing until it's set. */
export declare function pruneRuns(options?: { now?: Date }): Promise<{ runs: number; requests: number }>;

// ---------------------------------------------------------------------------
// The routes' work

export interface ReceiveWebhookInput {
  kind: "run" | "connection" | "request";
  id: RowId;
  /** The raw body, exactly as received. */
  body: string | Uint8Array | null | undefined;
  /** The X-QUBE-Signature header. */
  signature: string | readonly string[] | null | undefined;
  /** The request's path, for the log line of a refused signature. */
  path?: string | null;
}

/** What a refused signature's log line says to check, by reason. */
export declare const SIGNATURE_HINTS: Readonly<Record<"missing" | "malformed" | "stale" | "mismatch", string>>;

/** The largest webhook body taken: 5 MB. */
export declare const MAX_BODY_BYTES: number;
/** Verifies, finds the row, enqueues: resolves to the status to answer with. */
export declare function receiveWebhook(input: ReceiveWebhookInput): Promise<{ status: 200 | 400 | 401 | 404 | 413 | 503 }>;
/** Runs one delivery once: the run's operation, or your connectionEvents class, handles it. Throws for the queue to retry. */
export declare function run(delivery: QubeDelivery): Promise<void | null>;
/** run(delivery), tried again with a growing wait, jobAttempts times in all; logs and throws when they run out. */
export declare function job(delivery: QubeDelivery, options?: { sleep?: (ms: number) => Promise<unknown> }): Promise<void | null>;
/** The wait before attempt n + 1, in ms: (n^4 + 2) seconds. */
export declare function retryWait(attempt: number): number;

export interface Redirect {
  status: 303;
  location: string;
}

/** Back to the page the request came from, with a message for it to show once when error is set. */
export interface BackToPage {
  status: 303;
  error?: string;
}

/**
 * POST quickbooks/connections: the account's never-connected connection back through setup, or a new one (another:
 * true). simulated: true, outside production (NODE_ENV), connects a simulated company file and goes back to the page;
 * in production, 404.
 */
export declare function connectQuickbooks(input: {
  request: any;
  name?: string | null;
  another?: boolean;
  simulated?: boolean;
}): Promise<Redirect | { status: 303 } | { status: 401 | 404 }>;
/** POST quickbooks/connections/:id/onboarding: one of the account's connections back through setup. */
export declare function resendOnboarding(input: { request: any; id: RowId }): Promise<Redirect | { status: 401 | 404 }>;
/** DELETE quickbooks/connections/:id: QuBe Sync's connection, then the row with everything kept against it. */
export declare function disconnectQuickbooks(input: { request: any; id: RowId }): Promise<BackToPage | { status: 401 | 404 }>;
/** disconnectQuickbooks's message while a run or request hasn't ended. */
export declare const RUNS_GOING: string;
/** disconnectQuickbooks's message when QuBe Sync didn't answer. */
export declare const DISCONNECT_NO_ANSWER: string;

export declare const QUESTION_CHANGED: string;
export declare const NOT_STARTING: string;
/** redeliver's message for a run that doesn't look stuck. */
export declare const NOT_QUIET: string;
/** redeliver's messages for QuBe Sync's 409 (nothing to send yet) and 429 (asked too soon). */
export declare const REDELIVERY_REFUSED: Readonly<{ 409: string; 429: string }>;
/** redeliver's message when QuBe Sync didn't answer. */
export declare const NO_ANSWER: string;
export declare const SEARCH_LIMITS: { readonly minQuery: number; readonly maxQuery: number; readonly maxField: number };

export interface SearchMatch {
  value: string;
  label: string;
  detail?: string | null;
  [key: string]: any;
}

/** Not there, or authorizeQuestion said no. */
export interface NotFound {
  status: 404;
  message: string;
}

/** { status: 303 } once answered; { status: 303, error } when the question changed or a field was refused; or 404. */
export declare function answerQuestion(input: { runId: RowId; form: Record<string, unknown>; request: any }): Promise<BackToPage | NotFound>;
/** { status, json }: 200 with the matches ([] outside the bounds), 404 [], 409 [] no longer searching, QuBe Sync's 4xx with []. */
export declare function searchQuestion(input: { runId: RowId; field: unknown; q: unknown; request: any }): Promise<{ status: number; json: SearchMatch[] }>;
/** { status: 303 } once sent (or refused, or unanswered again); { status: 303, error: NOT_STARTING }; or 404. */
export declare function retryStart(input: { runId: RowId; request: any }): Promise<BackToPage | NotFound>;
/** A stuck run's latest event sent again (Client#redeliverRun): { status: 303 }, { status: 303, error }, or 404. */
export declare function redeliver(input: { runId: RowId; request: any }): Promise<BackToPage | NotFound>;
/** The choice's fields from the form, each as its type. */
export declare function answerData(choice: QubeChoice, form: Record<string, unknown>): Record<string, unknown>;
/** What QuBe Sync said was wrong with an answer (its errors.detail). */
export declare function refusalMessage(err: APIError): string;

// ---------------------------------------------------------------------------
// HTML

export interface RenderOptions {
  /** Where the questions router is mounted. Default "". */
  mount?: string;
  /** Your CSRF protection's token, put in each form. */
  csrfToken?: string | null;
  /** The token's form field. Default "_csrf". */
  csrfField?: string;
  /** A message to show once, above it (takeError's, from qubesync/express). */
  error?: string | null;
}

export interface RenderQuestionOptions extends RenderOptions {
  /** Your Content-Security-Policy's nonce, on the search box's script. */
  nonce?: string | null;
}

export interface RenderRunStatusOptions extends RenderOptions {
  /** For tests: the time unconfirmed() is judged at. */
  now?: Date;
}

/** The run's open question as HTML (every value escaped), with a form per choice; "" when it isn't asking. */
export declare function renderQuestion(run: Run | SyncStatus | null | undefined, options?: RenderQuestionOptions): string;
/**
 * The record's sync status in a sentence, a failure's detail, and buttons for a stuck run ("Send its latest news again")
 * and an unconfirmed start; "" when not sent. A bare Run is read without its link.
 */
export declare function renderRunStatus(status: SyncStatus | Run | null | undefined, options?: RenderRunStatusOptions): string;
export declare function escapeHtml(value: unknown): string;
/** The search box's script, for markup of your own. */
export declare const SEARCH_SCRIPT: string;

// ---------------------------------------------------------------------------
// Mapping helpers

export declare function get(value: any, ...names: string[]): any;
export declare function rows(value: any): any[];
export declare function dig(data: any, ...keys: string[]): any;
export declare function asString(value: any): string | undefined;
export declare function asNumber(value: any): number | undefined;
export declare function asInteger(value: any): number | undefined;
export declare function asDate(value: any): string | undefined;
/**
 * What withoutNils returns for a T: at every depth, a property whose type includes null or undefined
 * becomes optional without them (withoutNils leaves it out when it is one), an array's elements
 * lose null and undefined (they're dropped), and anything else (a Date, a string) is as it was.
 */
export type WithoutNils<T> = 0 extends 1 & T
  ? any
  : T extends readonly (infer E)[]
    ? WithoutNils<Exclude<E, null | undefined>>[]
    : T extends Date | ((...args: any[]) => any)
      ? T
      : T extends object
        ? Flat<
            { [K in keyof T as MaybeNil<T[K]> extends true ? never : K]: WithoutNils<T[K]> } & {
              [K in keyof T as MaybeNil<T[K]> extends true ? K : never]?: WithoutNils<Exclude<T[K], null | undefined>>;
            }
          >
        : T;
/** true when T's type includes null or undefined (any included). */
type MaybeNil<T> = null extends T ? true : undefined extends T ? true : false;
type Flat<T> = { [K in keyof T]: T[K] };
/** The value without its null and undefined values, at every depth: what a mapped input sends. */
export declare function withoutNils<T>(value: T): WithoutNils<T>;
