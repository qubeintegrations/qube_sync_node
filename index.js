"use strict";

// QuBe Sync webhooks: verify a delivery's X-QUBE-Signature header, then parse
// the body into a typed event. Framework-free, zero dependencies.

const crypto = require("crypto");

const VERSION = "0.3.0";
const SIGNATURE_HEADER = "X-QUBE-Signature";
const DEFAULT_TOLERANCE = 300;
const REASONS = Object.freeze(["missing", "malformed", "stale", "mismatch"]);

const WORKFLOW_RUN_EVENTS = Object.freeze([
  "workflow_run.awaiting_input",
  "workflow_run.completed",
  "workflow_run.failed",
  "workflow_run.cancelled",
]);
const NOTIFICATION_EVENT = "workflow_run.notification";

class SignatureError extends Error {
  constructor(reason, message) {
    super(message);
    this.name = "SignatureError";
    this.reason = reason;
  }
}

// ---------------------------------------------------------------------------
// Events

function own(object, key) {
  if (object === null || typeof object !== "object" || Array.isArray(object)) return null;
  if (!Object.prototype.hasOwnProperty.call(object, key)) return null;
  const value = object[key];
  return value === undefined ? null : value;
}

class Event {
  constructor(body) {
    Object.defineProperty(this, "body", { value: body, enumerable: true });
  }

  get type() {
    return "unknown";
  }
  get event() {
    const event = own(this.body, "event");
    return typeof event === "string" ? event : null;
  }
  get timestamp() {
    return own(this.body, "timestamp");
  }
  get appId() {
    return own(this.body, "app_id");
  }
  get sandbox() {
    return own(this.body, "sandbox");
  }
  get revision() {
    return null;
  }
  get reference() {
    return null;
  }
  get dedupeKey() {
    return null;
  }
}

class UnknownEvent extends Event {}

class RequestEvent extends Event {
  get type() {
    return "request";
  }
  get id() {
    return own(this.body, "id");
  }
  get pageRequestId() {
    return own(this.body, "page_request_id");
  }
  get state() {
    return own(this.body, "state");
  }
  get page() {
    return own(this.body, "page");
  }
  get iterationState() {
    return own(this.body, "iteration_state");
  }
  get responseJson() {
    return own(this.body, "response_json");
  }
  get error() {
    return own(this.body, "error");
  }
  get dedupeKey() {
    const pageRequestId = this.pageRequestId;
    const state = this.state;
    if (pageRequestId === null || state === null) return null;
    return `${pageRequestId}:${state}`;
  }
}

function newerThan(revision, stored) {
  if (stored === null || stored === undefined) return true;
  return revision !== null && revision > stored;
}

class WorkflowRunEvent extends Event {
  get type() {
    return "workflow_run";
  }
  get runId() {
    return own(this.body, "run_id");
  }
  get reference() {
    return own(this.body, "reference");
  }
  get revision() {
    return own(this.body, "revision");
  }
  get runState() {
    return own(this.body, "run_state");
  }
  get workflow() {
    return own(this.body, "workflow");
  }
  get connectionId() {
    return own(this.body, "connection_id");
  }
  get prompt() {
    return own(this.body, "prompt");
  }
  get outcome() {
    return own(this.body, "outcome");
  }
  get output() {
    return own(this.body, "output");
  }
  get error() {
    return own(this.body, "error");
  }
  get summary() {
    return own(this.body, "summary");
  }
  get cancelReason() {
    return own(this.body, "cancel_reason");
  }
  get links() {
    return own(this.body, "links");
  }
  newerThan(storedRevision) {
    return newerThan(this.revision, storedRevision);
  }
}

// A notification is data a run sends along the way: it carries a revision but
// is never skipped by it, so it has no newerThan. Dedupe on deliveryId.
class NotificationEvent extends Event {
  get type() {
    return "notification";
  }
  get runId() {
    return own(this.body, "run_id");
  }
  get reference() {
    return own(this.body, "reference");
  }
  get revision() {
    return own(this.body, "revision");
  }
  get deliveryId() {
    return own(this.body, "delivery_id");
  }
  get seq() {
    return own(this.body, "seq");
  }
  get name() {
    return own(this.body, "name");
  }
  get state() {
    return own(this.body, "state");
  }
  get from() {
    return own(this.body, "from");
  }
  get data() {
    return own(this.body, "data");
  }
  get dedupeKey() {
    return this.deliveryId;
  }
}

class ConnectionEvent extends Event {
  get type() {
    return "connection";
  }
  get deliveryId() {
    return own(this.body, "delivery_id");
  }
  get revision() {
    return own(this.body, "revision");
  }
  get connection() {
    return own(this.body, "connection");
  }
  get connectionId() {
    return own(this.connection, "id");
  }
  get stallReason() {
    const fromConnection = own(this.connection, "stall_reason");
    return fromConnection !== null ? fromConnection : own(this.body, "stall_reason");
  }
  get dedupeKey() {
    return this.deliveryId;
  }
  newerThan(storedRevision) {
    return newerThan(this.revision, storedRevision);
  }
}

class NameIndexEvent extends Event {
  get type() {
    return "name_index";
  }
  get connectionId() {
    return own(this.body, "connection_id");
  }
  get nameIndex() {
    return own(this.body, "name_index");
  }
}

function eventClassFor(body) {
  const event = own(body, "event");
  if (event === null) {
    return own(body, "page_request_id") !== null ? RequestEvent : UnknownEvent;
  }
  if (typeof event !== "string") return UnknownEvent;
  if (WORKFLOW_RUN_EVENTS.includes(event)) return WorkflowRunEvent;
  if (event === NOTIFICATION_EVENT) return NotificationEvent;
  if (event.startsWith("connection.")) return ConnectionEvent;
  if (event.startsWith("name_index.")) return NameIndexEvent;
  return UnknownEvent;
}

// ---------------------------------------------------------------------------
// Arguments

function bodyBytes(rawBody) {
  if (Buffer.isBuffer(rawBody)) return rawBody;
  if (typeof rawBody === "string") return Buffer.from(rawBody, "utf8");
  if (rawBody instanceof Uint8Array) {
    return Buffer.from(rawBody.buffer, rawBody.byteOffset, rawBody.byteLength);
  }
  if (rawBody !== null && typeof rawBody === "object") {
    throw new TypeError(
      "rawBody is a parsed object: pass the raw request body (a Buffer or string, exactly as received), " +
        'for example from express.raw({ type: "application/json" })'
    );
  }
  throw new TypeError(
    `rawBody must be the raw request body as a Buffer or string, got ${rawBody === null ? "null" : typeof rawBody}`
  );
}

function secretList(secrets) {
  const list = typeof secrets === "string" || Buffer.isBuffer(secrets) ? [secrets] : secrets;
  if (!Array.isArray(list)) {
    throw new TypeError("secrets must be a webhook secret string or an array of them");
  }
  if (list.length === 0) {
    throw new TypeError("secrets is empty: pass at least one webhook secret");
  }
  list.forEach((secret, index) => {
    const ok = (typeof secret === "string" || Buffer.isBuffer(secret)) && secret.length > 0;
    if (!ok) throw new TypeError(`secrets[${index}] must be a non-empty string`);
  });
  return list;
}

function nowSeconds(now) {
  if (now === undefined || now === null) return Math.floor(Date.now() / 1000);
  if (now instanceof Date) {
    const ms = now.getTime();
    if (Number.isNaN(ms)) throw new TypeError("now is an invalid Date");
    return Math.floor(ms / 1000);
  }
  if (typeof now === "number" && Number.isFinite(now)) return Math.floor(now);
  throw new TypeError("now must be unix seconds (a number) or a Date");
}

function toleranceSeconds(tolerance) {
  if (tolerance === undefined || tolerance === null) return DEFAULT_TOLERANCE;
  if (typeof tolerance === "number" && Number.isFinite(tolerance) && tolerance >= 0) return tolerance;
  throw new TypeError("tolerance must be a non-negative number of seconds");
}

function headerString(header) {
  if (Array.isArray(header)) return header.join(",");
  if (header === undefined || header === null || typeof header === "string") return header;
  throw new TypeError("header must be the X-QUBE-Signature header value (a string)");
}

// Splits "t=...,v1=...,v1=..." into the first t and every non-empty v1.
function parseHeader(header) {
  let t = null;
  const signatures = [];
  for (const rawPart of header.split(",")) {
    const part = rawPart.trim();
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    const value = part.slice(eq + 1);
    if (key === "t" && t === null) t = value;
    else if (key === "v1" && value !== "") signatures.push(value);
  }
  return { t, signatures };
}

function constantTimeEqual(expected, candidate) {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(candidate, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Public API

function parse(rawBody) {
  const text = bodyBytes(rawBody).toString("utf8");
  const body = JSON.parse(text);
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new TypeError("webhook body is not a JSON object");
  }
  const EventClass = eventClassFor(body);
  return new EventClass(body);
}

function verify(rawBody, header, options) {
  const opts = options === undefined || options === null ? {} : options;
  if (typeof opts !== "object") {
    throw new TypeError("verify(rawBody, header, { secrets, tolerance, now }): options must be an object");
  }
  const bytes = bodyBytes(rawBody);
  const secrets = secretList(opts.secrets);
  const tolerance = toleranceSeconds(opts.tolerance);
  const now = nowSeconds(opts.now);
  const value = headerString(header);

  if (value === undefined || value === null || value.trim() === "") {
    throw new SignatureError("missing", `webhook signature missing: no ${SIGNATURE_HEADER} header`);
  }

  const { t, signatures } = parseHeader(value);
  if (t === null || !/^[0-9]+$/.test(t) || signatures.length === 0) {
    throw new SignatureError(
      "malformed",
      `webhook signature malformed: ${SIGNATURE_HEADER} needs t=<unix seconds> and at least one v1=<hex>`
    );
  }

  const age = now - Number(t);
  if (Math.abs(age) > tolerance) {
    const when = age > 0 ? `${age} seconds old` : `${-age} seconds in the future`;
    throw new SignatureError(
      "stale",
      `webhook signature stale: its timestamp is ${when} (tolerance ${tolerance} seconds)`
    );
  }

  let matched = false;
  for (const secret of secrets) {
    const expected = crypto.createHmac("sha256", secret).update(`${t}.`, "utf8").update(bytes).digest("hex");
    for (const candidate of signatures) {
      if (constantTimeEqual(expected, candidate)) matched = true;
    }
  }
  if (!matched) {
    throw new SignatureError("mismatch", "webhook signature mismatch: no v1 matches any of the secrets");
  }

  return parse(bytes);
}

const { Client, APIError } = require("./client");

module.exports = {
  VERSION,
  SIGNATURE_HEADER,
  DEFAULT_TOLERANCE,
  REASONS,
  SignatureError,
  verify,
  parse,
  Event,
  RequestEvent,
  WorkflowRunEvent,
  NotificationEvent,
  ConnectionEvent,
  NameIndexEvent,
  UnknownEvent,
  Client,
  APIError,
};
