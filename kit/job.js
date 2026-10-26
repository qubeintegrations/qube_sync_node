"use strict";

// The webhook endpoint's work and the job's, without a framework: an adapter (qubesync/express)
// hands the request's parts in and sends back what these return.

const { SignatureError, parse, verify } = require("../index");
const { UnknownOperation } = require("./errors");
const { Connection, Run } = require("./records");
const { settings } = require("./settings");

// The largest body taken: a pull_changes page can be a few megabytes. Anything larger is answered
// 413 before it's read.
const MAX_BODY_BYTES = 5 * 1024 * 1024;

const KINDS = Object.freeze(["run", "connection"]);

/**
 * Receives one QuBe Sync webhook: kind "run" at QUBE_WEBHOOK_URL/runs/<run id>, the URL each run
 * was started with (Run#webhookUrl), or kind "connection" at QUBE_WEBHOOK_URL/connections/<id>,
 * each connection's (Connection#webhookUrl). It only verifies the delivery, checks the row is
 * there and enqueues it (the enqueue setting), so it answers well inside the 5 seconds QuBe Sync
 * waits: the job does the rest. Resolves to the status to answer with: 200, 400, 401, 404, 413 or
 * 503.
 *
 * body is the raw request body (a Buffer or string), exactly as received: the signature is over
 * its bytes. No sign-in and no CSRF token: the signature is what proves QuBe Sync sent it.
 */
async function receiveWebhook({ kind, id, body, signature }) {
  if (isParsed(body)) {
    throw new TypeError(
      "QuBe Sync: the webhook's body was already parsed, so there's nothing left to verify. Give the webhook route the raw body: mount it before any JSON body parser (express.json())."
    );
  }
  if (!KINDS.includes(kind)) throw new TypeError(`QuBe Sync: a delivery is for a run or a connection, not ${JSON.stringify(kind)}`);
  const raw = body === undefined || body === null ? Buffer.alloc(0) : Buffer.from(body);
  if (raw.length > MAX_BODY_BYTES) {
    console.warn(`QuBe Sync: refused a webhook: its body is over ${MAX_BODY_BYTES} bytes`);
    return { status: 413 };
  }
  const current = settings();

  // verify is qubesync's: the signature over the raw body, with any v1 matching in constant
  // time, and a timestamp within 5 minutes either way.
  try {
    verify(raw, signature, { secrets: current.webhookSecret });
  } catch (err) {
    if (isUnparsable(err)) {
      // Signed, but not a JSON object: nothing a job could take.
      console.warn("QuBe Sync: refused a webhook: its body is not a JSON object");
      return { status: 400 };
    }
    if (!(err instanceof SignatureError)) throw err;
    // Its reason (missing, malformed, stale or mismatch) is safe to log: never the secret, the
    // signature or the body.
    console.warn(`QuBe Sync: refused a webhook: ${err.reason}`);
    return { status: 401 };
  }

  // A row that isn't there (deleted, or a wrong webhook URL): QuBe Sync retries it, and shows it
  // as a failed delivery.
  const rowId = String(id);
  const row = kind === "run" ? await current.store.getRun(rowId) : await current.store.getConnection(rowId);
  if (!row) return { status: 404 };

  // The signature covers the body, not the URL, so the id is only a pointer: the job checks the
  // event's reference and connection id against the row. The body goes as text, which any queue
  // can carry; the job parses it again. A 200 tells QuBe Sync it's taken and it won't send it
  // again, so a queue that didn't take it answers 503 and QuBe Sync retries.
  const enqueued = await isEnqueued(current, { kind, id: rowId, body: raw.toString("utf8") });
  return { status: enqueued ? 200 : 503 };
}

// A body a JSON parser has read already: an object, not the bytes the signature is over.
function isParsed(body) {
  return body !== null && typeof body === "object" && !Buffer.isBuffer(body) && !(body instanceof Uint8Array);
}

// What verify throws for a signed body it can't parse into an event.
function isUnparsable(err) {
  return err instanceof SyntaxError || (err instanceof TypeError && err.message === "webhook body is not a JSON object");
}

// false from the enqueue (a queue that couldn't take it) or an error from it is a delivery not
// taken. Logged without the body.
async function isEnqueued(current, delivery) {
  const { kind, id } = delivery;
  try {
    const result = await current.enqueue(delivery);
    if (result !== false) return true;

    console.error(`QuBe Sync: couldn't enqueue a webhook for ${kind} ${id}: the enqueue returned false; answered 503 so QuBe Sync sends it again`);
    return false;
  } catch (err) {
    console.error(`QuBe Sync: couldn't enqueue a webhook for ${kind} ${id} (${err && err.name}); answered 503 so QuBe Sync sends it again`);
    return false;
  }
}

/**
 * Runs one verified delivery, once. kind is "run" (QUBE_WEBHOOK_URL/runs/<id>): the run's
 * operation finds its record and handles the event (Operation#handle); or "connection"
 * (QUBE_WEBHOOK_URL/connections/<id>): your connectionEvents class handles it for that
 * connection. job() calls it; so does your own queue's worker when the enqueue setting hands
 * deliveries elsewhere.
 *
 * body is the delivery's raw body, which the endpoint verified: parsed into its typed event here,
 * and not verified again, since a job can run after its timestamp's 5 minutes are up.
 *
 * It throws when it can't do the work (a handler of yours threw, the store is down, the run's
 * operation was taken out of the operations setting, or a connection's event came before the
 * connection's id was saved: NotReady), for the queue to run it again. A run, connection or
 * record that isn't there is dropped with a warning, not thrown: the endpoint answered 404 unless
 * the row existed, and your app saves a record before its run's row, so by the time a job runs, a
 * missing one was deleted, and retrying would never succeed.
 */
async function run({ kind, id, body }) {
  const event = parse(body);
  switch (kind) {
    case "run":
      return runEvent(String(id), event);
    case "connection":
      return connectionEvent(String(id), event);
    default:
      throw new TypeError(`QuBe Sync: a delivery is for a run or a connection, not ${JSON.stringify(kind)}`);
  }
}

async function runEvent(id, event) {
  const found = await Run.get(id);
  if (!found) return dropped(`run ${id} isn't there`, event);

  const OperationClass = settings().operationClass(found.operation);
  if (!OperationClass) throw new UnknownOperation(`QuBe Sync: no operation has the slug ${JSON.stringify(found.operation)}`);

  const record = await OperationClass.recordFor(found);
  if (record === null) return dropped(`run ${found.id}'s ${found.recordType} ${found.recordId} isn't there`, event);

  return new OperationClass(record, found).handle(event);
}

async function connectionEvent(id, event) {
  const found = await Connection.get(id);
  if (!found) return dropped(`connection ${id} isn't there`, event);

  const Events = settings().connectionEvents;
  return new Events(found).handle(event);
}

function dropped(why, event) {
  console.warn(`QuBe Sync: dropped ${event.event || event.type}: ${why} (deleted since, so it can't be applied)`);
  return null;
}

// How long to wait before attempt n + 1, in ms: n^4 + 2 seconds, as ActiveJob's
// polynomially_longer waits (3 s, 18 s, 83 s... about 7 hours over 10 attempts).
function retryWait(attempt) {
  return (attempt ** 4 + 2) * 1000;
}

function wait(ms) {
  return new Promise((resolve) => {
    // unref'd: a pending retry doesn't keep the process alive by itself.
    const timer = setTimeout(resolve, ms);
    if (timer && typeof timer.unref === "function") timer.unref();
  });
}

/**
 * The default enqueue's job: run(delivery), tried again with a growing wait when it throws, the
 * jobAttempts setting's times in all (10 unless set). QuBe Sync had its 2xx when the delivery was
 * enqueued, so it won't send it again: this is the only retry it gets. When the attempts run out
 * it logs an error and throws. options.sleep replaces the wait (for tests).
 */
async function job(delivery, options) {
  const { sleep = wait } = options || {};
  const attempts = settings().jobAttempts;
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run(delivery);
    } catch (err) {
      if (attempt >= attempts) {
        console.error(`QuBe Sync: gave up on a webhook for ${delivery.kind} ${delivery.id} after ${attempts} attempts: ${err && err.name}: ${err && err.message}`);
        throw err;
      }
      await sleep(retryWait(attempt));
    }
  }
}

module.exports = { receiveWebhook, run, job, retryWait, MAX_BODY_BYTES };
