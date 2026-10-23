// Type definitions for qubesync (QuBe Sync webhooks).

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
