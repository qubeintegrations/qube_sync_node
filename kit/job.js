"use strict";

// The webhook endpoint's work and the job's, without a framework: an adapter
// (qubesync/express) hands the request's parts in and sends back what these return.

const { SignatureError, parse, verify } = require("../index");
const { settings } = require("./settings");

/**
 * Receives one QuBe Sync webhook at <webhookUrl>/<operation>/<record id>, the URL each run was
 * started with (Operation's webhookUrl), or at <webhookUrl>/connection/<account id>, the
 * customer's connection's (ConnectionEvents' webhookUrl). It only verifies the delivery, checks
 * the operation and enqueues it, so it answers well inside the 5 seconds QuBe Sync waits: the
 * job (run) does the rest. Resolves to the status to answer with: 200, 401 or 404.
 *
 * body is the raw request body (a Buffer or string), exactly as received: the signature is over
 * its bytes.
 */
async function receiveWebhook({ operation, recordId, body, signature }) {
  if (body !== null && typeof body === "object" && !Buffer.isBuffer(body) && !(body instanceof Uint8Array)) {
    throw new TypeError(
      "QuBe Sync: the webhook's body was already parsed, so there's nothing left to verify. Give the webhook route the raw body: mount it before any JSON body parser (express.json())."
    );
  }
  const current = settings();

  // verify is qubesync's: the signature over the raw body, with any v1 matching in constant
  // time, and a timestamp within 5 minutes either way.
  try {
    verify(body === undefined || body === null ? "" : body, signature, { secrets: current.webhookSecret });
  } catch (err) {
    if (!(err instanceof SignatureError)) throw err;
    // Its reason (missing, malformed, stale or mismatch) is safe to log: never the secret, the
    // signature or the body.
    console.warn(`QuBe Sync: refused a webhook: ${err.reason}`);
    return { status: 401 };
  }

  // A URL none of your operations writes: QuBe Sync retries it, and shows it as a failed
  // delivery, which means a wrong webhook URL.
  if (typeof operation !== "string" || !current.classFor(operation)) return { status: 404 };

  // The signature covers the body, not the URL, so the record id is only a pointer: the job
  // checks that the event's reference (a connection event's connection id) is the one saved on
  // that record.
  const text = Buffer.isBuffer(body) ? body.toString("utf8") : Buffer.from(body).toString("utf8");
  await current.enqueue({ operation, recordId: String(recordId), body: text });
  return { status: 200 };
}

/**
 * One job: the operation its URL names (or, for "connection", the connection class) finds its
 * record and handles the event, parsed from the body the endpoint verified, and not verified
 * again, since a job can run after its timestamp's 5 minutes are up.
 *
 * Your durable queue's worker calls it with the job enqueue was given. QuBe Sync had its 2xx when
 * the event was enqueued, so it won't send it again: a job that throws is your queue's to retry
 * (BullMQ's attempts, say).
 *
 * A workflow that sends notifications (pull_changes's pages) waits for each one's 2xx before it
 * sends the next. The endpoint answers at once, so they come as fast as it answers, not after
 * each is saved: see each operation's notification handler.
 */
async function run({ operation, recordId, body }) {
  const Handler = settings().classFor(operation);
  if (!Handler) {
    throw new Error(`QuBe Sync: a job for ${JSON.stringify(operation)}, which isn't in the operations setting`);
  }
  const event = parse(body);
  const record = await Handler.findRecord(recordId);
  if (record === null || record === undefined) {
    throw new Error(`QuBe Sync: ${Handler.name}.findRecord(${JSON.stringify(recordId)}) found nothing`);
  }
  return new Handler(record).handle(event);
}

module.exports = { receiveWebhook, run };
