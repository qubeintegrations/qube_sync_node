"use strict";

// The QuBe Sync v2 API client: connections, workflow runs, questions and queued
// requests. Zero dependencies: Node's own http and https modules.

const http = require("http");
const https = require("https");
const crypto = require("crypto");
const util = require("util");
const { performance } = require("perf_hooks");

const DEFAULT_BASE_URL = "https://qubesync.com";
const API_PATH = "/api/v2";
const RETRY_STATUSES = new Set([429, 502, 503, 504]);
const RETRY_AFTER_STATUSES = new Set([429, 503]);
const RETRY_AFTER_CAP_MS = 30000;
const RETRY_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ECONNABORTED",
  "EPIPE",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EAI_AGAIN",
]);
const RETRY_SAFE_METHODS = new Set(["GET", "PUT", "DELETE"]);
const QUEUE_METHODS = new Set(["GET", "POST", "PUT", "DELETE"]);
const MESSAGE_BODY_LIMIT = 500;
// A retry is made only when at least this much of the call's total time is left after its wait.
const MIN_TIME_LEFT_MS = 1000;
// Statuses that mean the request may have reached QuBe Sync and been acted on.
const MAY_HAVE_ARRIVED_STATUSES = new Set([502, 504]);
// Network errors raised after the connection opened: the request may have arrived.
const mayHaveArrived = new WeakSet();
// What workflowTypes resolves to on a 304: the document is still the one its etag names.
const NOT_MODIFIED = Symbol("qubesync.notModified");

function userAgent() {
  // Required lazily: index.js requires this file, and owns VERSION.
  return `qubesync-node/${require("./index").VERSION}`;
}

/** Any answer outside 2xx. `message` is one line, safe to log: it never holds the API key. */
class APIError extends Error {
  constructor(status, body, requestId) {
    const text = typeof body === "string" ? body : "";
    let errors = null;
    try {
      const parsed = JSON.parse(text);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) && "errors" in parsed) {
        errors = parsed.errors === undefined ? null : parsed.errors;
      }
    } catch (_error) {
      errors = null;
    }
    super(`QuBe Sync answered ${status}: ${describe(errors, text, status)}`);
    this.name = "APIError";
    this.status = status;
    this.errors = errors;
    this.code = isPlainObject(errors) && typeof errors.code === "string" ? errors.code : null;
    this.body = text;
    this.requestId = requestId || null;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function oneLine(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

function describe(errors, body, status) {
  if (typeof errors === "string" && errors.trim() !== "") return oneLine(errors);
  if (isPlainObject(errors)) {
    if (typeof errors.detail === "string") return oneLine(errors.detail);
    const fields = Object.entries(errors).map(([field, messages]) => {
      const list = Array.isArray(messages) ? messages.map(String).join(", ") : String(messages);
      return `${field}: ${list}`;
    });
    if (fields.length > 0) return oneLine(fields.join("; "));
  }
  if (Array.isArray(errors) && errors.length > 0 && errors.every((e) => isPlainObject(e) && "message" in e)) {
    return oneLine(errors.map((e) => (e.path == null ? String(e.message) : `${e.path}: ${e.message}`)).join("; "));
  }
  const raw = oneLine(body);
  if (raw !== "") return raw.slice(0, MESSAGE_BODY_LIMIT);
  return http.STATUS_CODES[status] || "no body";
}

// An If-None-Match value: a digest is quoted; an ETag as it came (quoted, or weak) is sent as it is.
function entityTag(value) {
  const text = String(value);
  return text.startsWith('"') || text.startsWith("W/") ? text : `"${text}"`;
}

function requireString(value, name) {
  if (typeof value !== "string" || value === "") throw new TypeError(`${name} is required (a non-empty string)`);
  return value;
}

function requireId(value, name) {
  if ((typeof value !== "string" && typeof value !== "number") || value === "") {
    throw new TypeError(`${name} is required`);
  }
  return encodeURIComponent(String(value));
}

function requireQuery(q) {
  if (q === undefined || q === null || typeof q === "object") throw new TypeError("q is required (a string)");
  return String(q);
}

function nonNegative(value, name, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative number`);
  }
  return value;
}

function compact(object) {
  const out = {};
  for (const [key, value] of Object.entries(object)) if (value !== undefined && value !== null) out[key] = value;
  return out;
}

// Query strings as the v2 API reads them: an array of scalars repeats its bare key
// (`list_id=a&list_id=b`); a nested object brackets its keys (`name_range[from]=A`), and an array
// inside one brackets too (`filter[list_id][]=a`), as Plug decodes them.
function appendQuery(url, query) {
  if (query === undefined || query === null) return;
  if (!isPlainObject(query)) throw new TypeError("query must be an object");
  for (const [key, value] of Object.entries(query)) appendValue(url, key, value, true);
}

function appendValue(url, key, value, top) {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    for (const item of value) {
      if (item === undefined || item === null) continue;
      if (Array.isArray(item)) throw new TypeError(`query parameter ${key} can't hold an array of arrays`);
      if (isPlainObject(item)) appendValue(url, `${key}[]`, item, false);
      else url.searchParams.append(top ? key : `${key}[]`, scalar(key, item));
    }
    return;
  }
  if (isPlainObject(value)) {
    for (const [sub, inner] of Object.entries(value)) appendValue(url, `${key}[${sub}]`, inner, false);
    return;
  }
  url.searchParams.append(key, scalar(key, value));
}

function scalar(key, value) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  throw new TypeError(`query parameter ${key} must be a string, number, boolean, array or plain object`);
}

let operationIndex = null;

function operations() {
  if (!operationIndex) operationIndex = require("./operations/index.js");
  return operationIndex;
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function defaultClock() {
  return performance.now();
}

function hasPromptToken(pathOrUrl) {
  try {
    const token = new URL(pathOrUrl, "http://localhost").searchParams.get("prompt_token");
    return typeof token === "string" && token !== "";
  } catch (_error) {
    return false;
  }
}

function timeoutError(message) {
  const error = new Error(message);
  error.code = "ETIMEDOUT";
  return error;
}

function retryAfterMs(response) {
  if (!RETRY_AFTER_STATUSES.has(response.status)) return null;
  const header = response.headers["retry-after"];
  if (typeof header !== "string" || !/^\s*\d+(\.\d+)?\s*$/.test(header)) return null;
  return Math.min(Number(header) * 1000, RETRY_AFTER_CAP_MS);
}

class Client {
  #apiKey;
  #apiRoot;
  #origin;
  #sleep;
  #clock;
  #onRetry;

  /**
   * @param {object} options
   * @param {string} options.apiKey your app's API key (required; never read from the environment)
   * @param {string} [options.baseUrl="https://qubesync.com"]
   * @param {number} [options.connectTimeout=5000] ms to open the connection
   * @param {number} [options.timeout=30000] ms the socket may sit idle waiting for the answer
   * @param {number} [options.maxRetries=2]
   * @param {number} [options.totalTimeout=60000] ms a call may take, retries and their waits included
   * @param {(info: object) => void} [options.onRetry] called before each retry's wait; a throw stops the call
   * @param {(ms: number) => Promise<void>} [options.sleep] for tests
   * @param {() => number} [options.clock] a monotonic clock in ms, for tests
   */
  constructor(options) {
    if (!isPlainObject(options)) throw new TypeError("new Client({ apiKey }) takes an options object");
    const {
      apiKey,
      baseUrl = DEFAULT_BASE_URL,
      connectTimeout,
      timeout,
      maxRetries,
      totalTimeout,
      onRetry,
      sleep,
      clock,
    } = options;
    if (typeof apiKey !== "string" || apiKey === "") throw new TypeError("apiKey is required (a non-empty string)");
    if (typeof baseUrl !== "string" || baseUrl === "") throw new TypeError("baseUrl must be a non-empty string");
    const trimmed = baseUrl.replace(/\/+$/, "");
    let parsed;
    try {
      parsed = new URL(trimmed);
    } catch (_error) {
      throw new TypeError(`baseUrl isn't a URL: ${trimmed}`);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new TypeError(`baseUrl must be http or https: ${trimmed}`);
    }
    if (sleep !== undefined && typeof sleep !== "function") throw new TypeError("sleep must be a function");
    if (clock !== undefined && typeof clock !== "function") throw new TypeError("clock must be a function");
    if (onRetry !== undefined && onRetry !== null && typeof onRetry !== "function") {
      throw new TypeError("onRetry must be a function");
    }
    const retries = nonNegative(maxRetries, "maxRetries", 2);
    const total = nonNegative(totalTimeout, "totalTimeout", 60000);
    if (total === 0) throw new TypeError("totalTimeout must be more than 0");
    if (!Number.isInteger(retries)) throw new TypeError("maxRetries must be a whole number");

    this.#apiKey = apiKey;
    this.#origin = parsed.origin;
    this.#apiRoot = trimmed + API_PATH;
    this.#sleep = sleep || defaultSleep;
    this.#clock = clock || defaultClock;
    this.#onRetry = onRetry || null;
    Object.defineProperties(this, {
      baseUrl: { value: trimmed, enumerable: true },
      connectTimeout: { value: nonNegative(connectTimeout, "connectTimeout", 5000), enumerable: true },
      timeout: { value: nonNegative(timeout, "timeout", 30000), enumerable: true },
      maxRetries: { value: retries, enumerable: true },
      totalTimeout: { value: total, enumerable: true },
    });
  }

  [util.inspect.custom]() {
    return `Client { baseUrl: ${util.inspect(this.baseUrl)} }`;
  }

  toJSON() {
    return { baseUrl: this.baseUrl };
  }

  // -------------------------------------------------------------------------
  // Connections

  // type: "simulated" connects a simulated company file at once, for testing.
  async createConnection({ webhookUrl, name, type } = {}) {
    const body = compact({ webhook_url: requireString(webhookUrl, "webhookUrl"), name, type });
    return this.#data("POST", "/connections", body);
  }

  async getConnection(id) {
    return this.#data("GET", `/connections/${requireId(id, "id")}`);
  }

  async listConnections() {
    return this.#data("GET", "/connections");
  }

  async updateConnection(id, { webhookUrl, name } = {}) {
    return this.#data("PUT", `/connections/${requireId(id, "id")}`, compact({ webhook_url: webhookUrl, name }));
  }

  async deleteConnection(id) {
    return this.#data("DELETE", `/connections/${requireId(id, "id")}`);
  }

  async regenerateOnboarding(id) {
    return this.#data("POST", `/connections/${requireId(id, "id")}/onboarding-url`);
  }

  async setPassword(id, { password } = {}) {
    const body = password === undefined || password === null ? undefined : { password };
    return this.#data("POST", `/connections/${requireId(id, "id")}/password`, body);
  }

  async getQwc(id) {
    const body = await this.request("POST", `/connections/${requireId(id, "id")}/qwc`);
    return isPlainObject(body) && typeof body.qwc === "string" ? body.qwc : null;
  }

  // -------------------------------------------------------------------------
  // Workflow runs

  async startRun(connectionId, workflow, input, { reference, webhookUrl, version } = {}) {
    const path = `/connections/${requireId(connectionId, "connectionId")}/workflow-runs`;
    const body = compact({
      workflow: requireString(workflow, "workflow"),
      reference: requireString(reference, "reference"),
      input: input === undefined ? {} : input,
      webhook_url: requireString(webhookUrl, "webhookUrl"),
      version,
    });
    return this.#data("POST", path, body, { headers: { "Idempotency-Key": reference } });
  }

  async getRun(runUrlOrConnectionId, runId) {
    if (runId === undefined || runId === null) return this.#data("GET", requireString(runUrlOrConnectionId, "runUrl"));
    const path = `/connections/${requireId(runUrlOrConnectionId, "connectionId")}/workflow-runs/${requireId(runId, "runId")}`;
    return this.#data("GET", path);
  }

  async listRuns(connectionId, { reference, state, outcome } = {}) {
    return this.#data("GET", `/connections/${requireId(connectionId, "connectionId")}/workflow-runs`, undefined, {
      query: { reference, state, outcome },
    });
  }

  async cancelRun(cancelUrl, { reason } = {}) {
    return this.#data("POST", requireString(cancelUrl, "cancelUrl"), compact({ reason }));
  }

  /**
   * Has QuBe Sync send the run's latest event again. Resolves to `{ run_id, event, revision,
   * webhook_url }`; 409 when there's nothing to send yet, 429 when asked again too soon.
   */
  async redeliverRun(connectionId, runId) {
    const path = `/connections/${requireId(connectionId, "connectionId")}/workflow-runs/${requireId(runId, "runId")}/redeliver`;
    return this.#data("POST", path);
  }

  /** The whole body: `{ data: [...events], next_after }`. */
  async runEvents(connectionId, runId, { after, limit } = {}) {
    const path = `/connections/${requireId(connectionId, "connectionId")}/workflow-runs/${requireId(runId, "runId")}/events`;
    return this.request("GET", path, undefined, { query: { after, limit } });
  }

  // -------------------------------------------------------------------------
  // Workflow types

  /**
   * The input types of the app's workflows, which `npx qubesync workflows` renders into a typed
   * module (qubesync/workflow-types). Resolves to the document (the response's data): `digest`,
   * `operations_digest`, `include_drafts`, `workflows` (each published workflow at its published
   * version) and, with `includeDrafts: true`, `drafts` (each workflow whose working copy differs
   * from it). With `etag` (a document's `digest`, or the ETag it came with), resolves to
   * NOT_MODIFIED when the document is still that one.
   */
  async workflowTypes({ includeDrafts = false, etag } = {}) {
    const headers = {};
    if (etag !== undefined && etag !== null && etag !== "") headers["If-None-Match"] = entityTag(etag);
    try {
      return await this.#data("GET", "/workflows/types", undefined, {
        query: { include: includeDrafts ? "drafts" : undefined },
        headers,
      });
    } catch (error) {
      if (error instanceof APIError && error.status === 304) return NOT_MODIFIED;
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Questions

  async answer(decisionsUrl, { choice, data } = {}) {
    if (choice === undefined || choice === null) throw new TypeError("choice is required");
    const body = data === undefined || data === null ? { choice } : { choice, data };
    // Safe to send again only while it names the question it answers: without a prompt_token a
    // repeat could be taken for the run's next question.
    return this.#data("POST", requireString(decisionsUrl, "decisionsUrl"), body, { retrySafe: hasPromptToken(decisionsUrl) });
  }

  async search(searchUrl, { field, q } = {}) {
    return this.#data("GET", requireString(searchUrl, "searchUrl"), undefined, {
      query: { field: requireString(field, "field"), q: requireQuery(q) },
    });
  }

  // -------------------------------------------------------------------------
  // Queued requests

  /**
   * Queues any operation by its id (`"customer.create"`), as `qube.customer.create(...)` does.
   * An id this version doesn't know (an operation newer than it) needs `method` and `path`
   * (relative to the connection: `"customers"`).
   */
  async queue(operationId, connectionId, params, { webhookUrl, idempotencyKey, method, path } = {}) {
    const id = requireString(operationId, "operationId");
    const known = Object.prototype.hasOwnProperty.call(operations().OPERATIONS, id) ? operations().OPERATIONS[id] : null;
    if (!known && (typeof method !== "string" || method === "" || typeof path !== "string" || path === "")) {
      throw new TypeError(
        `operation ${JSON.stringify(id)} isn't one this version of qubesync knows: pass method and path (relative to the connection, such as "customers")`
      );
    }
    const verb = (typeof method === "string" && method !== "" ? method : known.method).toUpperCase();
    if (!QUEUE_METHODS.has(verb)) throw new TypeError(`method must be GET, POST, PUT or DELETE, not ${method}`);
    const relative = (typeof path === "string" && path !== "" ? path : known.path).replace(/^\/+/, "");
    if (relative === "") throw new TypeError("path must name the operation, such as \"customers\"");
    const paramsIn = known && !method ? known.paramsIn : verb === "GET" ? "query" : "body";
    const values = params === undefined || params === null ? {} : params;
    if (!isPlainObject(values)) throw new TypeError("params must be an object");
    const query = { webhook_url: requireString(webhookUrl, "webhookUrl") };
    let body;
    if (paramsIn === "query") {
      for (const [key, value] of Object.entries(values)) if (key !== "webhook_url") query[key] = value;
    } else {
      body = values;
    }
    const url = `/connections/${requireId(connectionId, "connectionId")}/${relative}`;
    return this.#data(verb, url, body, { query, headers: { "Idempotency-Key": idempotencyKey || crypto.randomUUID() } });
  }

  async queueQbxml(connectionId, requestXml, { webhookUrl, idempotencyKey } = {}) {
    const path = `/connections/${requireId(connectionId, "connectionId")}/queued-requests`;
    return this.#data("POST", path, { request_xml: requireString(requestXml, "requestXml") }, {
      query: { webhook_url: requireString(webhookUrl, "webhookUrl") },
      headers: { "Idempotency-Key": idempotencyKey || crypto.randomUUID() },
    });
  }

  async getRequest(connectionId, id) {
    return this.#data("GET", `/connections/${requireId(connectionId, "connectionId")}/queued-requests/${requireId(id, "id")}`);
  }

  async requestPages(connectionId, id) {
    return this.#data(
      "GET",
      `/connections/${requireId(connectionId, "connectionId")}/queued-requests/${requireId(id, "id")}/pages`
    );
  }

  /** The whole body: `{ data: [...requests], meta: { page, total_pages } }`. */
  async listRequests(connectionId, { page, pageSize, state, webhookState, sort, sortDirection, searchPhrase } = {}) {
    return this.request("GET", `/connections/${requireId(connectionId, "connectionId")}/queued-requests`, undefined, {
      query: {
        page,
        page_size: pageSize,
        state,
        webhook_state: webhookState,
        sort,
        sort_direction: sortDirection,
        search_phrase: searchPhrase,
      },
    });
  }

  /** Every request on every page, from page 1 until `meta.total_pages` (or an empty page). */
  async *eachRequest(connectionId, filters = {}) {
    let page = 1;
    for (;;) {
      const body = await this.listRequests(connectionId, { ...filters, page });
      const data = isPlainObject(body) && Array.isArray(body.data) ? body.data : [];
      for (const request of data) yield request;
      const totalPages = isPlainObject(body) && isPlainObject(body.meta) ? Number(body.meta.total_pages) : NaN;
      if (data.length === 0 || !Number.isFinite(totalPages) || page >= totalPages) return;
      page += 1;
    }
  }

  async discardRequest(connectionId, id) {
    return this.#data(
      "POST",
      `/connections/${requireId(connectionId, "connectionId")}/queued-requests/${requireId(id, "id")}/discard`
    );
  }

  // -------------------------------------------------------------------------
  // Anything else

  /**
   * Sends any v2 call and returns the parsed JSON body whole (null when empty).
   * `pathOrUrl` is a path under /api/v2 ("/connections") or an absolute URL on the
   * client's own origin (a run's or webhook's `links`).
   */
  async request(method, pathOrUrl, body, { query, headers } = {}) {
    return this.#request(method, pathOrUrl, body, { query, headers });
  }

  async #request(method, pathOrUrl, body, { query, headers, retrySafe = false } = {}) {
    if (typeof method !== "string" || method === "") throw new TypeError("method is required");
    const verb = method.toUpperCase();
    const url = this.#resolve(pathOrUrl);
    appendQuery(url, query);
    const response = await this.#send(verb, url, body, headers || {}, retrySafe);
    if (response.text === "") return null;
    return JSON.parse(response.text);
  }

  async #data(method, pathOrUrl, body, options) {
    const parsed = await this.#request(method, pathOrUrl, body, options);
    if (isPlainObject(parsed) && Object.prototype.hasOwnProperty.call(parsed, "data")) return parsed.data;
    return parsed;
  }

  #resolve(pathOrUrl) {
    if (typeof pathOrUrl !== "string" || pathOrUrl === "") throw new TypeError("a path or URL is required");
    if (pathOrUrl.startsWith("/")) return new URL(this.#apiRoot + pathOrUrl);
    let url;
    try {
      url = new URL(pathOrUrl);
    } catch (_error) {
      throw new TypeError(`expected a path starting with / or an absolute URL, got ${JSON.stringify(pathOrUrl)}`);
    }
    if (url.origin !== this.#origin) {
      throw new TypeError(`refusing to send a request to ${url.origin}: this client only calls ${this.#origin}`);
    }
    return url;
  }

  async #send(method, url, body, extraHeaders, forceRetrySafe) {
    const headers = {
      Accept: "application/json",
      "User-Agent": userAgent(),
    };
    let payload;
    if (body !== undefined && body !== null) {
      payload = Buffer.from(JSON.stringify(body), "utf8");
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = String(payload.length);
    }
    for (const [name, value] of Object.entries(extraHeaders)) {
      if (value !== undefined && value !== null) headers[name] = String(value);
    }
    headers.Authorization = `Basic ${Buffer.from(`${this.#apiKey}:`, "utf8").toString("base64")}`;

    const retrySafe =
      forceRetrySafe ||
      RETRY_SAFE_METHODS.has(method) ||
      Object.keys(headers).some((name) => name.toLowerCase() === "idempotency-key");
    const started = this.#clock();
    // A DELETE whose earlier attempt may have deleted the thing: a 404 on its retry is success.
    let deletedEarlier = false;
    const elapsed = () => this.#clock() - started;

    for (let attempt = 0; ; attempt += 1) {
      const canRetry = retrySafe && attempt < this.maxRetries;
      const left = Math.max(0, this.totalTimeout - elapsed());
      let response;
      try {
        response = await this.#once(method, url, headers, payload, {
          connectTimeout: Math.min(this.connectTimeout, left),
          timeout: Math.min(this.timeout, left),
        });
      } catch (error) {
        if (canRetry && error && RETRY_ERROR_CODES.has(error.code)) {
          if (mayHaveArrived.has(error)) deletedEarlier = true;
          if (await this.#retry(attempt, this.#backoff(attempt), elapsed, method, url, null, error)) continue;
        }
        throw error;
      }
      if (response.status >= 200 && response.status < 300) return response;
      if (response.status === 404 && method === "DELETE" && deletedEarlier) {
        return { status: 204, headers: response.headers, text: "" };
      }
      if (canRetry && RETRY_STATUSES.has(response.status)) {
        const wait = retryAfterMs(response);
        const delay = wait === null ? this.#backoff(attempt) : wait;
        if (MAY_HAVE_ARRIVED_STATUSES.has(response.status)) deletedEarlier = true;
        if (await this.#retry(attempt, delay, elapsed, method, url, response.status, null)) continue;
      }
      const requestId = response.headers["x-request-id"];
      throw new APIError(response.status, response.text, typeof requestId === "string" ? requestId : null);
    }
  }

  // Waits and answers true when the retry fits in the call's total time; calls onRetry first.
  async #retry(attempt, delayMs, elapsed, method, url, status, error) {
    const elapsedMs = elapsed();
    if (this.totalTimeout - elapsedMs - delayMs < MIN_TIME_LEFT_MS) return false;
    if (this.#onRetry) {
      this.#onRetry(
        Object.freeze({
          attempt: attempt + 1,
          maxRetries: this.maxRetries,
          delayMs,
          elapsedMs,
          method,
          // Never the query: it can hold a search term or a prompt_token.
          url: url.origin + url.pathname,
          status,
          error,
        })
      );
    }
    await this.#sleep(delayMs);
    return true;
  }

  #backoff(attempt) {
    return 500 * 2 ** attempt * (1 + Math.random() * 0.25);
  }

  #once(method, url, headers, payload, { connectTimeout, timeout }) {
    const transport = url.protocol === "https:" ? https : http;
    return new Promise((resolve, reject) => {
      let connectTimer = null;
      let failure = null;
      let connected = false;
      const req = transport.request(url, { method, headers });
      const settleError = (error) => {
        if (connected && error && typeof error === "object") mayHaveArrived.add(error);
        reject(error);
      };
      const fail = (error) => {
        if (!failure) failure = error;
        req.destroy(failure);
      };
      const clear = () => {
        if (connectTimer) clearTimeout(connectTimer);
        connectTimer = null;
      };
      const startReadTimer = () => {
        req.setTimeout(timeout, () => fail(timeoutError(`QuBe Sync didn't answer within ${timeout} ms`)));
      };
      req.on("socket", (socket) => {
        if (socket.connecting) {
          connectTimer = setTimeout(
            () => fail(timeoutError(`couldn't connect to ${url.origin} within ${connectTimeout} ms`)),
            connectTimeout
          );
          // Over TLS the request can only arrive once the handshake is done.
          socket.once(url.protocol === "https:" ? "secureConnect" : "connect", () => {
            connected = true;
          });
          socket.once("connect", () => {
            clear();
            startReadTimer();
          });
        } else {
          connected = true;
          startReadTimer();
        }
      });
      req.on("error", (error) => {
        clear();
        settleError(failure || error);
      });
      req.on("close", clear);
      req.on("response", (res) => {
        const chunks = [];
        const cutOff = (error) => {
          clear();
          settleError(failure || error || Object.assign(new Error("the answer was cut off"), { code: "ECONNRESET" }));
        };
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("error", cutOff);
        res.on("aborted", () => cutOff(null));
        res.on("end", () => {
          clear();
          if (failure) return settleError(failure);
          resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString("utf8") });
        });
      });
      req.end(payload);
    });
  }
}

// The entity accessors, `qube.customer` and the rest: each loads its operations/<entity>.js on
// first use, and keeps one instance per client.
const entityInstances = new WeakMap();
for (const [name, load] of Object.entries(operations().ENTITIES)) {
  Object.defineProperty(Client.prototype, name, {
    configurable: true,
    enumerable: false,
    get() {
      let mine = entityInstances.get(this);
      if (!mine) entityInstances.set(this, (mine = Object.create(null)));
      if (!mine[name]) {
        const EntityClass = load();
        mine[name] = new EntityClass(this);
      }
      return mine[name];
    },
  });
}

module.exports = { Client, APIError, NOT_MODIFIED };
