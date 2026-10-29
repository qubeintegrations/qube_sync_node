"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const qubesync = require("..");
const { verify, parse, SignatureError, Event, WorkflowRunEvent, ConnectionEvent } = qubesync;

const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "test_vectors.json"), "utf8"));
const SECRET = vectors.secrets[0];
const T = vectors.timestamp;

function sign(body, secret = SECRET, t = T) {
  const hex = crypto.createHmac("sha256", secret).update(`${t}.`).update(Buffer.from(body, "utf8")).digest("hex");
  return { header: `t=${t},v1=${hex}`, hex };
}

function eventCase(name) {
  const found = vectors.events.find((c) => c.name === name);
  assert.ok(found, `no events case named ${name}`);
  return found;
}

function signatureError(fn) {
  try {
    fn();
  } catch (error) {
    assert.ok(error instanceof SignatureError, `expected SignatureError, got ${error && error.name}: ${error}`);
    return error;
  }
  assert.fail("expected a SignatureError");
}

describe("vectors: signatures", () => {
  for (const c of vectors.signatures) {
    it(c.name, () => {
      const run = () => verify(c.body, c.header, { secrets: c.secrets, tolerance: c.tolerance, now: c.now });
      if (c.valid) {
        const event = run();
        assert.ok(event instanceof Event);
      } else {
        const error = signatureError(run);
        assert.strictEqual(error.reason, c.reason);
      }
    });
  }
});

describe("vectors: events", () => {
  for (const c of vectors.events) {
    it(c.name, () => {
      for (const body of [c.body, Buffer.from(c.body, "utf8")]) {
        const verified = verify(body, c.header, { secrets: [SECRET], now: T });
        const parsed = parse(body);
        for (const event of [verified, parsed]) {
          assert.strictEqual(event.type, c.expect.type);
          assert.strictEqual(event.event, c.expect.event);
          assert.strictEqual(event.dedupeKey, c.expect.dedupe_key);
          assert.strictEqual(event.revision, c.expect.revision);
          assert.strictEqual(event.reference, c.expect.reference);
          assert.deepStrictEqual(event.body, JSON.parse(c.body));
        }
      }
    });
  }
});

describe("verify arguments", () => {
  const c = eventCase("request: an answer");

  it("accepts a single secret string", () => {
    assert.strictEqual(verify(c.body, c.header, { secrets: SECRET, now: T }).type, "request");
  });

  it("checks every secret while one rotates", () => {
    const event = verify(c.body, c.header, { secrets: ["whsec_new_one", SECRET], now: T });
    assert.strictEqual(event.type, "request");
  });

  it("rejects an empty secrets list with a TypeError, not a SignatureError", () => {
    assert.throws(() => verify(c.body, c.header, { secrets: [], now: T }), TypeError);
  });

  it("rejects missing secrets (an unset env var) with a TypeError", () => {
    assert.throws(() => verify(c.body, c.header, { secrets: undefined, now: T }), TypeError);
    assert.throws(() => verify(c.body, c.header, { now: T }), TypeError);
    assert.throws(() => verify(c.body, c.header), TypeError);
    assert.throws(() => verify(c.body, c.header, { secrets: [""], now: T }), TypeError);
  });

  it("rejects a parsed body and says to pass the raw body", () => {
    assert.throws(
      () => verify(JSON.parse(c.body), c.header, { secrets: SECRET, now: T }),
      (error) => error instanceof TypeError && /raw/.test(error.message)
    );
    assert.throws(() => parse(JSON.parse(c.body)), (error) => error instanceof TypeError && /raw/.test(error.message));
  });

  it("accepts a Uint8Array body", () => {
    const bytes = new Uint8Array(Buffer.from(c.body, "utf8"));
    assert.strictEqual(verify(bytes, c.header, { secrets: SECRET, now: T }).type, "request");
  });

  it("signs the UTF-8 bytes of a string body", () => {
    const body = JSON.stringify({ page_request_id: "p1", state: "response_received", note: "café — ü" });
    const { header } = sign(body);
    assert.strictEqual(verify(body, header, { secrets: SECRET, now: T }).dedupeKey, "p1:response_received");
    assert.strictEqual(verify(Buffer.from(body), header, { secrets: SECRET, now: T }).type, "request");
  });

  it("accepts now as a Date", () => {
    assert.strictEqual(verify(c.body, c.header, { secrets: SECRET, now: new Date(T * 1000) }).type, "request");
    assert.strictEqual(verify(c.body, c.header, { secrets: SECRET, now: new Date((T + 300) * 1000 + 999) }).type, "request");
    const error = signatureError(() => verify(c.body, c.header, { secrets: SECRET, now: new Date((T + 301) * 1000) }));
    assert.strictEqual(error.reason, "stale");
  });

  it("defaults now to the current time and tolerance to 300", () => {
    const now = Math.floor(Date.now() / 1000);
    const { header } = sign(c.body, SECRET, now - 290);
    assert.strictEqual(verify(c.body, header, { secrets: SECRET }).type, "request");
    const old = sign(c.body, SECRET, now - 400).header;
    assert.strictEqual(signatureError(() => verify(c.body, old, { secrets: SECRET })).reason, "stale");
    assert.strictEqual(verify(c.body, old, { secrets: SECRET, tolerance: 600 }).type, "request");
  });

  it("treats a blank header as missing", () => {
    assert.strictEqual(signatureError(() => verify(c.body, "   ", { secrets: SECRET, now: T })).reason, "missing");
    assert.strictEqual(signatureError(() => verify(c.body, null, { secrets: SECRET, now: T })).reason, "missing");
  });

  it("uses the first t and ignores parts without =", () => {
    const { hex } = sign(c.body);
    const header = `junk, t=${T}, t=1, v0=abc, v1=${hex}`;
    assert.strictEqual(verify(c.body, header, { secrets: SECRET, now: T }).type, "request");
  });

  it("joins a header given as an array", () => {
    const { hex } = sign(c.body);
    assert.strictEqual(verify(c.body, [`t=${T}`, `v1=${hex}`], { secrets: SECRET, now: T }).type, "request");
  });

  it("refuses a v1 of the wrong length without throwing anything else", () => {
    const error = signatureError(() => verify(c.body, `t=${T},v1=abc`, { secrets: SECRET, now: T }));
    assert.strictEqual(error.reason, "mismatch");
  });
});

describe("error messages", () => {
  const c = eventCase("request: an answer");
  const { hex } = sign(c.body);
  const header = `t=${T},v1=${hex}`;

  const cases = [
    ["missing", () => verify(c.body, undefined, { secrets: SECRET, now: T })],
    ["malformed", () => verify(c.body, `t=soon,v1=${hex}`, { secrets: SECRET, now: T })],
    ["stale", () => verify(c.body, header, { secrets: SECRET, now: T + 1000 })],
    ["mismatch", () => verify(c.body + " ", header, { secrets: SECRET, now: T })],
  ];

  for (const [reason, run] of cases) {
    it(`${reason}: names the reason and holds no secret, signature or body`, () => {
      const error = signatureError(run);
      assert.strictEqual(error.reason, reason);
      assert.strictEqual(error.name, "SignatureError");
      assert.ok(error instanceof Error);
      const text = `${error.message} ${error.stack} ${JSON.stringify(error)}`;
      assert.ok(error.message.includes(reason), error.message);
      assert.ok(!text.includes(SECRET), "secret leaked");
      assert.ok(!text.includes(hex), "signature leaked");
      assert.ok(!text.includes("Northwind"), "body leaked");
    });
  }

  it("stale says how old or how far in the future", () => {
    assert.match(signatureError(() => verify(c.body, header, { secrets: SECRET, now: T + 1000 })).message, /1000 seconds old/);
    assert.match(
      signatureError(() => verify(c.body, header, { secrets: SECRET, now: T - 400 })).message,
      /400 seconds in the future/
    );
  });
});

describe("events", () => {
  it("newerThan: null, undefined, lower, equal, higher", () => {
    for (const name of ["workflow_run.completed", "connection.stalled"]) {
      const event = parse(eventCase(name).body);
      const revision = event.revision;
      assert.strictEqual(event.newerThan(null), true);
      assert.strictEqual(event.newerThan(undefined), true);
      assert.strictEqual(event.newerThan(revision - 1), true);
      assert.strictEqual(event.newerThan(revision), false);
      assert.strictEqual(event.newerThan(revision + 1), false);
    }
  });

  it("notifications have no newerThan", () => {
    const event = parse(eventCase("workflow_run.notification").body);
    assert.strictEqual(event.newerThan, undefined);
    assert.strictEqual(typeof event.revision, "number");
  });

  it("missing keys read as null", () => {
    const run = parse(JSON.stringify({ event: "workflow_run.completed" }));
    assert.ok(run instanceof WorkflowRunEvent);
    for (const key of [
      "timestamp", "appId", "sandbox", "runId", "reference", "revision", "runState", "workflow",
      "connectionId", "prompt", "outcome", "output", "error", "summary", "cancelReason", "links", "dedupeKey",
    ]) {
      assert.strictEqual(run[key], null, key);
    }
    assert.strictEqual(run.newerThan(3), false);
    assert.strictEqual(run.newerThan(null), true);

    const connection = parse(JSON.stringify({ event: "connection.connected" }));
    assert.ok(connection instanceof ConnectionEvent);
    for (const key of ["deliveryId", "revision", "connection", "connectionId", "stallReason", "dedupeKey"]) {
      assert.strictEqual(connection[key], null, key);
    }

    const request = parse(JSON.stringify({ page_request_id: "p1" }));
    assert.strictEqual(request.type, "request");
    for (const key of ["id", "state", "page", "iterationState", "responseJson", "error", "dedupeKey"]) {
      assert.strictEqual(request[key], null, key);
    }

    for (const key of ["constructor", "toString", "__proto__"]) {
      assert.strictEqual(parse(JSON.stringify({ event: `x.${key}` })).type, "unknown");
    }
    assert.strictEqual(parse('{"page_request_id":"p","constructor":1}').state, null);
  });

  it("an unknown event is never refused", () => {
    const c = eventCase("an event this library doesn't know");
    const event = verify(c.body, c.header, { secrets: SECRET, now: T });
    assert.strictEqual(event.type, "unknown");
    assert.strictEqual(event.event, "invoice.paid_somewhere_new");
    assert.strictEqual(event.appId, "0196a1c0-0000-7000-8000-00000000a001");
    assert.deepStrictEqual(event.body.something_new, { nested: [1, 2, 3] });

    assert.strictEqual(parse('{"event":"workflow_run.paused"}').type, "unknown");
    assert.strictEqual(parse('{"event":null}').type, "unknown");
    assert.strictEqual(parse('{"event":42,"page_request_id":"p"}').type, "unknown");
    assert.strictEqual(parse("{}").type, "unknown");
  });

  it("reads the accessors of each type", () => {
    const awaiting = parse(eventCase("workflow_run.awaiting_input").body);
    assert.strictEqual(awaiting.runId, "0196a1c0-0000-7000-8000-00000000f001");
    assert.strictEqual(awaiting.runState, "awaiting_input");
    assert.strictEqual(awaiting.workflow, "ensure_customer");
    assert.strictEqual(awaiting.connectionId, "0196a1c0-0000-7000-8000-00000000c001");
    assert.strictEqual(awaiting.prompt.token, "Vq3kT9xRb2LmW8sZ");
    assert.strictEqual(awaiting.links.ui, "https://qubesync.com/app/workflow_runs/0196a1c0-0000-7000-8000-00000000f001");
    assert.strictEqual(awaiting.sandbox, true);
    assert.strictEqual(awaiting.timestamp, T);

    assert.strictEqual(parse(eventCase("workflow_run.completed").body).outcome, "used_existing");
    assert.match(parse(eventCase("workflow_run.failed").body).error, /renames/);
    assert.strictEqual(parse(eventCase("workflow_run.cancelled").body).cancelReason, "The customer was merged in our CRM.");

    const note = parse(eventCase("workflow_run.notification").body);
    assert.strictEqual(note.name, "page");
    assert.strictEqual(note.seq, 1);
    assert.strictEqual(note.state, "pull_lists / send");
    assert.strictEqual(note.from.workflow, "stream_query");
    assert.strictEqual(note.data.kind, "customer");
    assert.strictEqual(note.deliveryId, note.dedupeKey);

    const stalled = parse(eventCase("connection.stalled").body);
    assert.strictEqual(stalled.connectionId, "0196a1c0-0000-7000-8000-00000000c001");
    assert.strictEqual(stalled.stallReason, "not_checking_in");
    assert.strictEqual(stalled.connection.name, "Riverbend Electric");
    assert.strictEqual(parse(eventCase("connection.resumed").body).stallReason, null);

    const ready = parse(eventCase("name_index.ready").body);
    assert.strictEqual(ready.connectionId, "0196a1c0-0000-7000-8000-00000000c001");
    assert.strictEqual(ready.nameIndex.records, 1240);

    const request = parse(eventCase("request: a page of a paginated query").body);
    assert.strictEqual(request.page, 2);
    assert.strictEqual(request.iterationState, "continue");
    assert.strictEqual(request.pageRequestId, "0196a1c0-0000-7000-8000-00000000e002");
    assert.strictEqual(request.responseJson.data.length, 2);
  });

  it("flags a request QuickBooks may have applied", () => {
    const event = (state, errorType) => parse(JSON.stringify({
      page_request_id: "q1", state, ...(errorType ? { error: { error_type: errorType } } : {}),
    }));
    assert.strictEqual(event("timed_out", "timed_out").perhapsApplied, true);
    assert.strictEqual(event("timed_out").perhapsApplied, true);
    assert.strictEqual(event("error", "outcome_unknown").perhapsApplied, true);
    assert.strictEqual(event("error", "outcome_unknown").errorType, "outcome_unknown");
    assert.strictEqual(event("error", "unexpected_error").perhapsApplied, false);
    assert.strictEqual(event("retryable", "retryable").perhapsApplied, false);
    assert.strictEqual(event("response_received").perhapsApplied, false);
    assert.strictEqual(event("response_received").errorType, null);
    assert.strictEqual(parse(JSON.stringify({ page_request_id: "q1", error: "text" })).errorType, null);
  });

  it("reads an answer over 1 MB that came without its response_xml", () => {
    const big = parse(eventCase("request: an answer too large to carry its qbXML").body);
    assert.strictEqual(big.responseXmlOmitted, true);
    assert.strictEqual(big.responseXml, null);
    assert.match(big.selfLink, /\/queued-requests\/0196a1c0-0000-7000-8000-00000000e001$/);
    assert.strictEqual(big.responseJson.status, "success");

    const small = parse(JSON.stringify({ page_request_id: "q1", response_xml: "<QBXML/>" }));
    assert.strictEqual(small.responseXmlOmitted, false);
    assert.strictEqual(small.responseXml, "<QBXML/>");
    assert.strictEqual(small.selfLink, null);
  });

  it("parse refuses a body that isn't a JSON object", () => {
    assert.throws(() => parse("[1,2]"), TypeError);
    assert.throws(() => parse("null"), TypeError);
    assert.throws(() => parse("not json"), SyntaxError);
  });
});

describe("package", () => {
  it("resolves by name through exports", () => {
    assert.strictEqual(require("qubesync"), qubesync);
    assert.strictEqual(qubesync.VERSION, require("../package.json").version);
    assert.strictEqual(qubesync.SIGNATURE_HEADER, "X-QUBE-Signature");
  });
});
