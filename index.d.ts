// Type definitions for qubesync (the QuBe Sync v2 API client and webhooks).

export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
export interface JsonObject {
  [key: string]: JsonValue;
}

export declare const VERSION: string;
/** The header QuBe Sync signs deliveries in. Node lowercases it: `req.headers["x-qube-signature"]`. */
export declare const SIGNATURE_HEADER: "X-QUBE-Signature";
export declare const DEFAULT_TOLERANCE: 300;

export type SignatureErrorReason = "missing" | "malformed" | "stale" | "mismatch";
export declare const REASONS: readonly SignatureErrorReason[];

/** Thrown by `verify` when a delivery can't be trusted. Answer 401. The message is safe to log. */
export declare class SignatureError extends Error {
  constructor(reason: SignatureErrorReason, message: string);
  readonly name: "SignatureError";
  readonly reason: SignatureErrorReason;
}

/** The raw request body exactly as received. A `Buffer` is a `Uint8Array`. */
export type RawBody = string | Uint8Array;

export interface VerifyOptions {
  /** One secret, or several while one rotates. Required and non-empty. */
  secrets: string | readonly string[];
  /** Seconds the timestamp may be off either way. Default 300. */
  tolerance?: number;
  /** Unix seconds or a Date. Default: the current time. */
  now?: number | Date;
}

export type EventType = "request" | "workflow_run" | "notification" | "connection" | "name_index" | "unknown";

export declare abstract class Event {
  /** The whole parsed body. */
  readonly body: JsonObject;
  readonly type: EventType;
  readonly event: string | null;
  readonly timestamp: number | null;
  readonly appId: string | null;
  readonly sandbox: boolean | null;
  readonly revision: number | null;
  readonly reference: string | null;
  readonly dedupeKey: string | null;
}

/** A queued request's answer: no `event` key, has `page_request_id`. */
export declare class RequestEvent extends Event {
  readonly type: "request";
  readonly revision: null;
  readonly reference: null;
  readonly id: string | null;
  readonly pageRequestId: string | null;
  readonly state: string | null;
  readonly page: number | null;
  readonly iterationState: string | null;
  readonly responseJson: JsonValue;
  readonly error: JsonValue;
  /** `"<page_request_id>:<state>"`. */
  readonly dedupeKey: string | null;
}

/** `workflow_run.awaiting_input`, `.completed`, `.failed` or `.cancelled`. */
export declare class WorkflowRunEvent extends Event {
  readonly type: "workflow_run";
  readonly event: string;
  readonly runId: string | null;
  readonly runState: string | null;
  readonly workflow: string | null;
  readonly connectionId: string | null;
  readonly prompt: JsonObject | null;
  readonly outcome: string | null;
  readonly output: JsonValue;
  readonly error: JsonValue;
  readonly summary: JsonObject | null;
  readonly cancelReason: string | null;
  readonly links: JsonObject | null;
  /** Always null: apply a run's webhook when `newerThan(storedRevision)`. */
  readonly dedupeKey: null;
  /** True when `storedRevision` is null/undefined, else `revision > storedRevision`. */
  newerThan(storedRevision: number | null | undefined): boolean;
}

/** `workflow_run.notification`: data a run sends along the way. Never skipped by revision. */
export declare class NotificationEvent extends Event {
  readonly type: "notification";
  readonly event: "workflow_run.notification";
  readonly runId: string | null;
  readonly deliveryId: string | null;
  readonly seq: number | null;
  readonly name: string | null;
  readonly state: string | null;
  readonly from: JsonObject | null;
  readonly data: JsonValue;
  /** The `delivery_id`. */
  readonly dedupeKey: string | null;
}

/** `connection.*`. */
export declare class ConnectionEvent extends Event {
  readonly type: "connection";
  readonly event: string;
  readonly reference: null;
  readonly deliveryId: string | null;
  readonly connection: JsonObject | null;
  /** `connection.id`. */
  readonly connectionId: string | null;
  readonly stallReason: string | null;
  /** The `delivery_id`. */
  readonly dedupeKey: string | null;
  /** True when `storedRevision` is null/undefined, else `revision > storedRevision`. */
  newerThan(storedRevision: number | null | undefined): boolean;
}

/** `name_index.*`. */
export declare class NameIndexEvent extends Event {
  readonly type: "name_index";
  readonly event: string;
  readonly revision: null;
  readonly reference: null;
  readonly connectionId: string | null;
  readonly nameIndex: JsonObject | null;
  readonly dedupeKey: null;
}

/** Anything else, including events newer than this library. Never refused. */
export declare class UnknownEvent extends Event {
  readonly type: "unknown";
  readonly revision: null;
  readonly reference: null;
  readonly dedupeKey: null;
}

export type WebhookEvent =
  | RequestEvent
  | WorkflowRunEvent
  | NotificationEvent
  | ConnectionEvent
  | NameIndexEvent
  | UnknownEvent;

/**
 * Verifies the X-QUBE-Signature header over the raw body, then parses it.
 * Throws `SignatureError` (reason `missing`, `malformed`, `stale` or `mismatch`),
 * or `TypeError` for a programming mistake (no secrets, a parsed body).
 */
export declare function verify(
  rawBody: RawBody,
  header: string | readonly string[] | null | undefined,
  options: VerifyOptions
): WebhookEvent;

/** Parses a body into a typed event without verifying it. */
export declare function parse(rawBody: RawBody): WebhookEvent;

// ---------------------------------------------------------------------------
// The v2 API client

/** What the API answers: plain objects with the API's own snake_case keys. */
export type ApiObject = { [key: string]: any };

export type QueryValue = string | number | boolean | null | undefined;
export type Query = { [key: string]: QueryValue | readonly QueryValue[] };

export interface ClientOptions {
  /** Your app's API key. Required; the client never reads the environment. */
  apiKey: string;
  /** Default `"https://qubesync.com"`. Trailing slashes are dropped; the API is `baseUrl + "/api/v2"`. */
  baseUrl?: string;
  /** Milliseconds to open the connection. Default 5000. */
  connectTimeout?: number;
  /** Milliseconds the socket may sit idle waiting for the answer. Default 30000. */
  timeout?: number;
  /** Retries for a retry-safe request (GET, PUT, DELETE, or one with an Idempotency-Key). Default 2. */
  maxRetries?: number;
  /** Waits between retries; for tests. Default: setTimeout. */
  sleep?: (ms: number) => Promise<void>;
}

export interface ConnectionOptions {
  webhookUrl?: string;
  name?: string;
}

export interface StartRunOptions {
  /** Your own id for the run; also sent as the Idempotency-Key. */
  reference: string;
  webhookUrl: string;
  version?: number;
}

export interface ListRunsFilters {
  reference?: string;
  state?: string;
  outcome?: string;
}

export interface RunEventsOptions {
  after?: number | string;
  limit?: number;
}

export interface RunEventsPage {
  data: ApiObject[];
  next_after: number | string | null;
  [key: string]: any;
}

export interface AnswerOptions {
  /** One of the prompt's choices. */
  choice: string | number;
  /** The fields the choice takes. */
  data?: ApiObject;
}

export interface SearchOptions {
  field: string;
  q: string;
}

export type QueueMethod = "GET" | "POST" | "PUT" | "DELETE" | "get" | "post" | "put" | "delete";

export interface QueueOptions {
  webhookUrl: string;
  /** Default `"POST"`; case-insensitive. GET and DELETE send `params` as the query string. */
  method?: QueueMethod;
  /** Default: a fresh UUID per call, reused on that call's retries. */
  idempotencyKey?: string;
}

export interface QueueQbxmlOptions {
  webhookUrl: string;
  idempotencyKey?: string;
}

export interface ListRequestsFilters {
  page?: number;
  pageSize?: number;
  state?: string;
  webhookState?: string;
  sort?: string;
  sortDirection?: "asc" | "desc" | string;
  searchPhrase?: string;
}

export interface RequestsPage {
  data: ApiObject[];
  meta: { page: number; total_pages: number; [key: string]: any };
  [key: string]: any;
}

export interface RequestOptions {
  query?: Query;
  headers?: { [name: string]: string | number | undefined };
}

/**
 * The QuBe Sync v2 API. Every method returns a Promise of the response's `data`, or null
 * for an empty answer. A non-2xx answer rejects with `APIError`; a connection that still fails
 * after the retries rejects with Node's own error. A link on another origin than `baseUrl`
 * rejects with a `TypeError` before any request is made.
 */
export declare class Client {
  constructor(options: ClientOptions);
  readonly baseUrl: string;
  readonly connectTimeout: number;
  readonly timeout: number;
  readonly maxRetries: number;
  toJSON(): { baseUrl: string };

  createConnection(options: ConnectionOptions & { webhookUrl: string }): Promise<ApiObject>;
  getConnection(id: string): Promise<ApiObject>;
  listConnections(): Promise<ApiObject[]>;
  updateConnection(id: string, options: ConnectionOptions): Promise<ApiObject>;
  deleteConnection(id: string): Promise<null>;
  regenerateOnboarding(id: string): Promise<ApiObject>;
  /** `{ id, password }`. Without `password`, QuBe Sync makes one. */
  setPassword(id: string, options?: { password?: string }): Promise<ApiObject>;
  /** The QWC file's XML. */
  getQwc(id: string): Promise<string>;

  startRun(connectionId: string, workflow: string, input: ApiObject, options: StartRunOptions): Promise<ApiObject>;
  /** A run by its `links.run` URL, or by connection and run id. */
  getRun(runUrl: string): Promise<ApiObject>;
  getRun(connectionId: string, runId: string): Promise<ApiObject>;
  listRuns(connectionId: string, filters?: ListRunsFilters): Promise<ApiObject[]>;
  /** Takes the run's `links.cancel`. */
  cancelRun(cancelUrl: string, options?: { reason?: string }): Promise<ApiObject>;
  /** The whole body, `{ data, next_after }`. */
  runEvents(connectionId: string, runId: string, options?: RunEventsOptions): Promise<RunEventsPage>;

  /** Takes the prompt's `links.decisions`. */
  answer(decisionsUrl: string, options: AnswerOptions): Promise<ApiObject>;
  /** Takes the prompt's `links.search`. */
  search(searchUrl: string, options: SearchOptions): Promise<ApiObject[]>;

  /** Queues an operation: `operation` is the path after the connection (`"customers"`, `"txn-deleteds"`). */
  queue(connectionId: string, operation: string, params: ApiObject | undefined, options: QueueOptions): Promise<ApiObject>;
  queueQbxml(connectionId: string, requestXml: string, options: QueueQbxmlOptions): Promise<ApiObject>;
  getRequest(connectionId: string, id: string): Promise<ApiObject>;
  requestPages(connectionId: string, id: string): Promise<ApiObject[]>;
  /** The whole body, `{ data, meta: { page, total_pages } }`. */
  listRequests(connectionId: string, filters?: ListRequestsFilters): Promise<RequestsPage>;
  /** Every request on every page. */
  eachRequest(connectionId: string, filters?: Omit<ListRequestsFilters, "page">): AsyncGenerator<ApiObject, void, undefined>;
  discardRequest(connectionId: string, id: string): Promise<ApiObject>;

  /** Any v2 call: a path under /api/v2 or a same-origin URL. Returns the parsed body whole, or null. */
  request(method: string, pathOrUrl: string, body?: unknown, options?: RequestOptions): Promise<any>;
}

/** Any answer outside 2xx. The message is one line and never holds the API key. */
export declare class APIError extends Error {
  readonly name: "APIError";
  /** The HTTP status. */
  readonly status: number;
  /** `errors["code"]` when `errors` is an object with a string code (`prompt_changed`, `not_awaiting_input`). */
  readonly code: string | null;
  /** The body's `errors` as parsed: a sentence, `{ detail, code }`, fields, or `{ path, message }` problems. */
  readonly errors: string | ApiObject | ApiObject[] | null;
  /** The raw response body. */
  readonly body: string;
  /** The `x-request-id` header, for support. */
  readonly requestId: string | null;
}
