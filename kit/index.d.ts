// Type definitions for qubesync/kit: QuBe Sync's integration kit without a framework.

import type {
  APIError,
  ApiObject,
  Client,
  ConnectionEvent,
  NotificationEvent,
  WebhookEvent,
  WorkflowRunEvent,
} from "../index";

export type { ConnectionEvent, NotificationEvent, WebhookEvent, WorkflowRunEvent };
export { APIError } from "../index";

/** A webhook, as qubesync parses it. */
export type QubeEvent = WebhookEvent;

/** Where a question is answered, and where its record field searches (while it has one). */
export interface QubeLinks {
  decisions: string;
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

/** A question a run asks (event.prompt), as Operation's question saves it and renderQuestion shows it. */
export interface QubePrompt {
  id: string;
  token: string;
  kind: string;
  message?: string;
  details?: { label: string; value: string }[];
  choices?: QubeChoice[];
  data?: Record<string, unknown>;
}

/**
 * A record of your app's that a run is about: its id goes in the run's webhook URL, and by
 * default it keeps the run's reference, revision and question, written with its save().
 */
export interface QubeRecord {
  id: string | number;
  qube_reference?: string | null;
  qube_revision?: number | null;
  qube_question?: QubePrompt | null;
  qube_links?: QubeLinks | null;
  save?: () => unknown;
  [field: string]: any;
}

/** Your customer's account: by default it keeps its connection's id and last revision. */
export interface QubeAccount {
  id: string | number;
  qube_connection_id?: string | null;
  qube_connection_revision?: number | null;
  save?: () => unknown;
  [field: string]: any;
}

/** A verified delivery, as enqueue is given it and run takes it. body is the raw body, as text. */
export interface QubeJob {
  operation: string;
  recordId: string;
  body: string;
}

/** Notification delivery ids already taken. Each may return a Promise. */
export interface DedupeStore {
  seen(key: string): boolean | Promise<boolean>;
  remember(key: string): unknown;
}

type Awaitable<T> = T | Promise<T>;

/** An Operation subclass: what the operations setting lists. */
export type OperationClass = (new (record: any) => Operation) & {
  readonly slug: string;
  readonly workflow: string;
  findRecord(id: string): Promise<any>;
};

/** A ConnectionEvents subclass: the connection setting. */
export type ConnectionClass = (new (account: any) => ConnectionEvents) & {
  findRecord(id: string): Promise<any>;
};

/** What configure takes. A key left out keeps what was set before; null or undefined unsets it. */
export interface SettingsOptions<Request = any> {
  /** slug → operation class. Each class's static slug must be its key; "connection" is taken. */
  operations?: { [slug: string]: OperationClass } | Map<string, OperationClass> | null;
  /** Your connection class (extends ConnectionEvents). */
  connection?: ConnectionClass | null;
  /** The signed-in customer's account, from the request. */
  currentAccount?: ((request: Request) => Awaitable<QubeAccount | null | undefined>) | null;
  /**
   * True when the signed-in user may answer or search `record`'s question. Unset, every answer and
   * search is refused with a 403, and logged. Only `true` allows: anything else is a 404.
   */
  authorizeQuestion?: ((request: Request, record: any, operation: string) => Awaitable<boolean>) | null;
  /** Hands a verified delivery to your queue, whose worker calls run(job). Default: in this process. */
  enqueue?: ((job: QubeJob) => unknown) | null;
  /** Default: in this process's memory. */
  dedupe?: DedupeStore | null;
  /** Default: QUBE_API_KEY. Never logged or shown. */
  apiKey?: string | null;
  /** Default: QUBE_URL, else https://qubesync.com. */
  baseUrl?: string | null;
  /** Default: QUBE_WEBHOOK_SECRET. A list while one rotates. Never logged or shown. */
  webhookSecret?: string | readonly string[] | null;
  /** Default: QUBE_WEBHOOK_URL: your app's /webhooks/qube, the base of every webhook URL. */
  webhookUrl?: string | null;
}

/** The settings as read: each getter throws, naming your config file, when it's needed and unset. */
export declare class Settings {
  readonly operations: Map<string, OperationClass>;
  readonly connection: ConnectionClass;
  readonly currentAccount: (request: any) => Awaitable<QubeAccount | null | undefined>;
  readonly authorizeQuestion: (request: any, record: any, operation: string) => Awaitable<boolean>;
  readonly enqueue: (job: QubeJob) => unknown;
  readonly dedupe: DedupeStore;
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly webhookSecret: string | readonly string[];
  readonly webhookUrl: string;
  /** The class a webhook URL's slug names ("connection" or an operation's), or null. */
  classFor(slug: string): OperationClass | ConnectionClass | null;
  /** What's set, with the secrets hidden. */
  describe(): Record<string, unknown>;
  toJSON(): Record<string, unknown>;
}

export declare const SETTINGS: readonly string[];
export declare const CONFIG_FILE: string;
export declare const CONNECTION_SLUG: "connection";

/** Sets the kit's settings, once, in your app's quickbooks-desktop/config. Returns them. */
export declare function configure<Request = any>(options: SettingsOptions<Request>): Settings;
export declare function configure(options: Settings): Settings;
export declare function settings(): Settings;
/** Forgets every setting (for tests). */
export declare function resetSettings(): void;

/** The configured Client (apiKey, baseUrl), made once, with the retry log. */
export declare function client(): Client;
/** <webhookUrl>/connection/<account id>. */
export declare function connectionWebhookUrl(accountId: string | number): string;

/**
 * One way your app starts a workflow, and what it does with that run's webhooks. Subclass it per
 * operation, with a static workflow and slug, findRecord and input, and the handlers your app needs.
 */
export declare class Operation<R extends QubeRecord = QubeRecord> {
  /** The workflow the operation starts. */
  static workflow: string;
  /** The slug in its webhook URL, and its key in the operations setting. */
  static slug: string;
  /** Starts the run for a saved record on the customer's connection; resolves to the run. */
  static start<R extends QubeRecord>(this: new (record: R) => Operation<R>, record: R, connectionId: string): Promise<ApiObject>;
  /** Your record, by the id in its webhook URL. */
  static findRecord(id: string): Promise<any>;

  constructor(record: R);
  record: R;

  webhookUrl(): string;
  /** The run's input, from the record. */
  input(): Record<string, unknown> | Promise<Record<string, unknown>>;
  /** Checks the reference, takes a notification once, applies a run event when it's newer. */
  handle(event: QubeEvent): Promise<void>;
  question(event: WorkflowRunEvent): Promise<void>;
  notification(event: NotificationEvent): Promise<void>;
  ended(event: WorkflowRunEvent): Promise<void>;
  failed(event: WorkflowRunEvent): Promise<void>;

  savedReference(): Promise<string | null | undefined>;
  saveReference(reference: string): Promise<void>;
  savedRevision(): Promise<number | null | undefined>;
  saveRevision(revision: number): Promise<void>;
  savedQuestion(): Promise<QubePrompt | null>;
  savedLinks(): Promise<QubeLinks | null>;
  saveQuestion(prompt: QubePrompt | null, links: QubeLinks | null): Promise<void>;
  /** Forgets the question once answered, unless the run has asked another since. */
  answered(token: string): Promise<void>;
  /** Writes the record with its save(). Override it for another ORM. */
  saveRecord(): Promise<void>;
  logEvent(event: QubeEvent): void;
}

/** The customer's connection's own events. Your connection class extends it. */
export declare class ConnectionEvents<A extends QubeAccount = QubeAccount> {
  /** Your account, by the id in the connection's webhook URL. */
  static findRecord(id: string): Promise<any>;

  constructor(account: A);
  account: A;

  webhookUrl(): string;
  /** Checks the connection id, applies an event when it's newer. */
  handle(event: QubeEvent): Promise<void>;
  connected(event: ConnectionEvent): Promise<void>;
  setupCancelled(event: ConnectionEvent): Promise<void>;
  stalled(event: ConnectionEvent): Promise<void>;
  resumed(event: ConnectionEvent): Promise<void>;

  savedConnectionId(): Promise<string | null>;
  saveConnectionId(connectionId: string): Promise<void>;
  savedRevision(): Promise<number | null>;
  saveRevision(revision: number): Promise<void>;
  /** Writes the account with its save(). Override it for another ORM. */
  saveRecord(): Promise<void>;
  logEvent(event: QubeEvent): void;
}

export interface ReceiveWebhookInput {
  operation: string;
  recordId: string;
  /** The raw body, exactly as received. */
  body: string | Uint8Array | null | undefined;
  /** The X-QUBE-Signature header. */
  signature: string | readonly string[] | null | undefined;
}

/** Verifies, checks the slug, enqueues: resolves to the status to answer with (200, 401 or 404). */
export declare function receiveWebhook(input: ReceiveWebhookInput): Promise<{ status: 200 | 401 | 404 }>;
/** One job: the class its slug names finds the record and handles the event. */
export declare function run(job: QubeJob): Promise<void>;

/** Onboarding for the signed-in account: { status: 303, location } (the setup page), or { status: 401 }. */
export declare function startOnboarding(request: any): Promise<{ status: 303 | 401; location?: string }>;

export declare const QUESTION_CHANGED: string;
export declare const SEARCH_LIMITS: { readonly minQuery: number; readonly maxQuery: number; readonly maxField: number };

export interface FoundQuestion {
  operation: Operation;
  question: QubePrompt | null;
  links: Partial<QubeLinks>;
}

export declare function findQuestion(operation: string, recordId: string, request: any): Promise<FoundQuestion | null>;

export interface AnswerInput {
  operation: string;
  recordId: string;
  /** The posted form: choice, and data[name] (nested or not). */
  form: Record<string, unknown>;
  request: any;
}

/**
 * { status: 303 } once answered; else { status, message } (plain text): 403 while authorizeQuestion
 * isn't set (logged), 404 not found or not allowed, 409 the question changed, 422 a field refused.
 */
export declare function answerQuestion(input: AnswerInput): Promise<{ status: number; message?: string }>;

export interface SearchInput {
  operation: string;
  recordId: string;
  field: unknown;
  q: unknown;
  request: any;
}

export interface SearchMatch {
  value: string;
  label: string;
  detail?: string | null;
  [key: string]: any;
}

/**
 * { status, json }: 200 with the matches ([] outside the bounds), 403 [] while authorizeQuestion isn't
 * set (logged), 404 [] not found or not allowed, 409 [] no longer searching, QuBe Sync's 4xx with [].
 */
export declare function searchQuestion(input: SearchInput): Promise<{ status: number; json: SearchMatch[] }>;

/** The choice's fields from the form, each as its type. */
export declare function answerData(choice: QubeChoice, form: Record<string, unknown>): Record<string, unknown>;
/** What QuBe Sync said was wrong with an answer (its errors.detail). */
export declare function refusalMessage(err: APIError): string;

export interface RenderQuestionOptions {
  /** The record's answer route: /qube/questions/<operation>/<record id>, where the questions router is mounted. */
  action: string;
  /** Your CSRF protection's token, put in each form. */
  csrfToken?: string | null;
  /** The token's form field. Default "_csrf". */
  csrfField?: string;
  /** Your Content-Security-Policy's nonce, on the search box's script. */
  nonce?: string | null;
}

/** The question as HTML (every value escaped), with a form per choice; "" when there's none. */
export declare function renderQuestion(question: QubePrompt | null | undefined, options: RenderQuestionOptions): string;
export declare function escapeHtml(value: unknown): string;
/** The search box's script, for markup of your own. */
export declare const SEARCH_SCRIPT: string;

export declare function get(value: any, ...names: string[]): any;
export declare function rows(value: any): any[];
export declare function dig(data: any, ...keys: string[]): any;
export declare function asString(value: any): string | undefined;
export declare function asNumber(value: any): number | undefined;
export declare function asInteger(value: any): number | undefined;
export declare function asDate(value: any): string | undefined;
export declare function withoutNils<T>(value: T): T;
