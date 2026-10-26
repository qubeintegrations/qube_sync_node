// Type definitions for qubesync/kit: QuBe Sync's integration kit without a framework.

import type { APIError, Client, ConnectionEvent, NotificationEvent, WebhookEvent, WorkflowRunEvent } from "../index";

export type { ConnectionEvent, NotificationEvent, WebhookEvent, WorkflowRunEvent };
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
  /** A record's newest run of an operation (createdAt, then id, descending), or null. */
  latestRun(recordType: string, recordId: string, operation: string): Promise<RunRow | null>;
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
}

/** A store kept in this process's memory: for tests and trying the kit out, never production. */
export declare function memoryStore(): Store;
/** Every method a store has. */
export declare const STORE_METHODS: readonly string[];
/** Each table's columns, by the field a row has in JavaScript: the tables schema.sql makes. */
export declare const STORE_COLUMNS: Readonly<Record<"qube_connections" | "qube_runs" | "qube_notifications" | "qube_quickbooks_records", Readonly<Record<string, string>>>>;
/** Where schema.sql is (also qubesync/kit/schema.sql). */
export declare const SCHEMA_PATH: string;
/** The list family a kind's ids are unique within: "name", "item", or the kind itself. */
export declare function familyFor(kind: string | null | undefined): string;

// ---------------------------------------------------------------------------
// Errors

/** A setting your app hasn't written, thrown the first time it's needed. */
export declare class NotConfigured extends Error {}
/** A run whose operation none of the operations setting has any more. */
export declare class UnknownOperation extends Error {}
/** A connection's event came before its qubeId was saved: the job throws it so the queue retries. */
export declare class NotReady extends Error {}
/** Operation.start was given a connection QuBe Sync hasn't made yet (no qubeId). */
export declare class NotConnected extends TypeError {}
/** A store's write broke a unique key. */
export declare class StoreConflict extends Error {}

// ---------------------------------------------------------------------------
// Settings

/** A verified delivery, as enqueue is given it and run takes it. body is the raw body, as text. */
export interface QubeDelivery {
  kind: "run" | "connection";
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

/** A ConnectionEvents subclass: the connectionEvents setting. */
export type ConnectionEventsClass = new (connection: Connection) => ConnectionEvents;

/** What configure takes. A key left out keeps what was set before; null or undefined unsets it. */
export interface SettingsOptions<Request = any> {
  /** Where connections, runs, notifications and QuickBooks ids are kept. Required. */
  store?: Store | null;
  /** slug → operation class. Each class's static slug must be its key. */
  operations?: { [slug: string]: OperationClass } | Map<string, OperationClass> | null;
  /** Your class for a connection's events (extends ConnectionEvents). */
  connectionEvents?: ConnectionEventsClass | null;
  /** The signed-in customer's account, from the request: it owns the connections onboarding makes. null answers 401. */
  currentAccount?: ((request: Request) => Awaitable<QubeRecord | null | undefined>) | null;
  /**
   * True when the signed-in user may answer or search `run`'s question (or retry its start). Only
   * `true` allows: anything else is a 404. Default: currentAccount owns the run's connection,
   * compared by type and id, so a null account never matches.
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
  readonly operations: Map<string, OperationClass>;
  readonly connectionEvents: ConnectionEventsClass;
  readonly currentAccount: (request: any) => Awaitable<QubeRecord | null | undefined>;
  readonly authorizeQuestion: (request: any, record: any, run: Run) => Awaitable<unknown>;
  readonly recordType: (record: any) => string;
  readonly findRecord: (type: string, id: string) => Awaitable<any>;
  readonly enqueue: (delivery: QubeDelivery) => unknown;
  readonly jobAttempts: number;
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly webhookSecret: string | readonly string[];
  /** Without a trailing slash. */
  readonly webhookUrl: string;
  /** Whether your app set key, rather than leaving it to a default or the environment. */
  isSet(key: string): boolean;
  /** The operation class for a slug, or null. */
  operationClass(slug: string): OperationClass | null;
  /** What's set, with the secrets hidden. */
  describe(): Record<string, unknown>;
  toJSON(): Record<string, unknown>;
}

export declare const SETTINGS: readonly string[];
export declare const CONFIG_FILE: string;
export declare const DEFAULT_JOB_ATTEMPTS: number;

/** Sets the kit's settings, once, in your app's quickbooks-desktop/config. Returns them. */
export declare function configure<Request = any>(options: SettingsOptions<Request>): Settings;
export declare function configure(options: Settings): Settings;
export declare function settings(): Settings;
/** Forgets every setting (for tests). */
export declare function resetSettings(): void;

/** The configured Client (apiKey, baseUrl), made once, with the retry log. */
export declare function client(): Client;

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
  /** The run with that id, with its connection, or null. */
  static get(id: RowId, store?: Store): Promise<Run | null>;
  /** A row from the store, with its connection. */
  static load(row: RunRow, store?: Store): Promise<Run>;
  /** record's newest run of operation, or null. Throws for a slug the operations setting doesn't have. */
  static latestFor(record: QubeRecord, operation: string, store?: Store): Promise<Run | null>;

  constructor(row: RunRow, store?: Store, connection?: Connection | null);
  readonly store: Store;
  readonly connection: Connection;

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
  /** "Added to QuickBooks", "Done", "Failed: <message>", "Cancelled: <reason>", "Waiting for your answer", "Starting", "Not confirmed by QuBe Sync yet" or "Running". */
  summaryText(now?: Date): string;
  cancelReasonText(): string;
  errorMessage(): string | null;
  errorDetail(): string | null;
  openQuestion(): QubePrompt | null;
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
  /** Writes the run ("starting"), starts it on the connection, keeps QuBe Sync's answer; resolves to the run. */
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

  /** The run's input, from the record. */
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
  /** Forgets the question once answered, unless the run has asked another since. */
  answered(token: string): Promise<void>;
  withoutNils<T>(value: T): T;
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
  logEvent(event: QubeEvent): void;
}

// ---------------------------------------------------------------------------
// The routes' work

export interface ReceiveWebhookInput {
  kind: "run" | "connection";
  id: RowId;
  /** The raw body, exactly as received. */
  body: string | Uint8Array | null | undefined;
  /** The X-QUBE-Signature header. */
  signature: string | readonly string[] | null | undefined;
}

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

/** POST quickbooks/connections: the account's never-connected connection back through setup, or a new one (another: true). */
export declare function connectQuickbooks(input: { request: any; name?: string | null; another?: boolean }): Promise<Redirect | { status: 401 }>;
/** POST quickbooks/connections/:id/onboarding: one of the account's connections back through setup. */
export declare function resendOnboarding(input: { request: any; id: RowId }): Promise<Redirect | { status: 401 | 404 }>;

export declare const QUESTION_CHANGED: string;
export declare const NOT_STARTING: string;
export declare const SEARCH_LIMITS: { readonly minQuery: number; readonly maxQuery: number; readonly maxField: number };

export interface SearchMatch {
  value: string;
  label: string;
  detail?: string | null;
  [key: string]: any;
}

/**
 * { status: 303 } once answered; else { status, message } (plain text): 403 with no policy to ask
 * (logged), 404 not found or not allowed, 409 the question changed, 422 a field refused.
 */
export declare function answerQuestion(input: { runId: RowId; form: Record<string, unknown>; request: any }): Promise<{ status: number; message?: string }>;
/** { status, json }: 200 with the matches ([] outside the bounds), 403 [], 404 [], 409 [] no longer searching, QuBe Sync's 4xx with []. */
export declare function searchQuestion(input: { runId: RowId; field: unknown; q: unknown; request: any }): Promise<{ status: number; json: SearchMatch[] }>;
/** { status: 303 } once sent (or refused, or unanswered again); else { status, message }: 403, 404, 409 not starting. */
export declare function retryStart(input: { runId: RowId; request: any }): Promise<{ status: number; message?: string }>;
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
export declare function renderQuestion(run: Run | null | undefined, options?: RenderQuestionOptions): string;
/** Where the run stands, a failure's detail, and a retry button for an unconfirmed start; "" for no run. */
export declare function renderRunStatus(run: Run | null | undefined, options?: RenderRunStatusOptions): string;
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
export declare function withoutNils<T>(value: T): T;
