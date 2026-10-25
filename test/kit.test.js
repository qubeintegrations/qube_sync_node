"use strict";

const { describe, it: nodeIt } = require("node:test");
const assert = require("node:assert");
const util = require("node:util");

const support = require("./kit-support");
const { kit, fake, answer, logged, invoices, accounts, calls, CreateInvoice, Account, reset, vectorBody, API_KEY, SECRET, CONN } =
  support;

const it = (name, fn) => support.it(nodeIt, name, fn);

const REFERENCE = "create_invoice-7-11111111-2222-4333-8444-555555555555";

function job(operation, recordId, body) {
  return kit.run({ operation, recordId: String(recordId), body });
}

function invoice(fields = {}) {
  return invoices.add({ id: 7, qube_reference: REFERENCE, qube_revision: 0, ...fields });
}

function account(fields = {}) {
  return accounts.add({ id: 42, qube_connection_id: CONN, qube_connection_revision: null, ...fields });
}

describe("kit: settings", () => {
  it("an unset setting throws, naming the config file", () => {
    kit.resetSettings();
    for (const key of ["operations", "connection", "currentAccount"]) {
      assert.throws(
        () => kit.settings()[key],
        (err) => err.message.includes(`the ${key} setting isn't set`) && err.message.includes("configure(") && err.message.includes("quickbooks-desktop/config")
      );
    }
  });

  it("the secrets and URLs come from the environment at first use, and say where to set them", () => {
    kit.resetSettings();
    const saved = { ...process.env };
    try {
      delete process.env.QUBE_API_KEY;
      delete process.env.QUBE_WEBHOOK_SECRET;
      delete process.env.QUBE_WEBHOOK_URL;
      delete process.env.QUBE_URL;
      assert.throws(() => kit.settings().apiKey, /QUBE_API_KEY is not set.*apiKey with configure\(\.\.\.\) in your app's quickbooks-desktop\/config/);
      assert.throws(() => kit.settings().webhookSecret, /QUBE_WEBHOOK_SECRET is not set/);
      assert.throws(() => kit.settings().webhookUrl, /QUBE_WEBHOOK_URL is not set/);
      assert.strictEqual(kit.settings().baseUrl, "https://qubesync.com");
      process.env.QUBE_API_KEY = "sk_from_env";
      process.env.QUBE_URL = "https://staging.example.com";
      assert.strictEqual(kit.settings().apiKey, "sk_from_env");
      assert.strictEqual(kit.settings().baseUrl, "https://staging.example.com");
    } finally {
      process.env = saved;
    }
  });

  it("hides the secrets from inspection and JSON", () => {
    const settings = reset();
    const shown = [util.inspect(settings), JSON.stringify(settings), String(settings), util.inspect(kit.client())].join(" ");
    assert.ok(!shown.includes(API_KEY), shown);
    assert.ok(!shown.includes(SECRET), shown);
    assert.match(util.inspect(settings), /create_invoice/);
    assert.match(util.inspect(settings), /apiKey: '\[set\]'/);
  });

  it("checks what it's given", () => {
    reset();
    assert.throws(() => kit.configure({ authorizeQuestions: () => true }), /doesn't know the setting "authorizeQuestions"/);
    assert.throws(() => kit.configure({ operations: { invoice: CreateInvoice } }), /static slug is "create_invoice": they must match/);
    assert.throws(() => kit.configure({ operations: { connection: CreateInvoice } }), /connection's own slug/);
    assert.throws(() => kit.configure({ operations: { create_invoice: class {} } }), /must be a class that extends Operation/);
    assert.throws(() => kit.configure({ connection: CreateInvoice }), /extends ConnectionEvents/);
    assert.throws(() => kit.configure({ dedupe: {} }), /seen\(key\) and remember\(key\)/);
    assert.throws(() => kit.configure({ webhookSecret: [] }), /webhookSecret/);
    // A Map works as well as an object, and a later configure keeps what it leaves out.
    kit.configure({ operations: new Map([["create_invoice", CreateInvoice]]) });
    assert.strictEqual(kit.settings().operations.get("create_invoice"), CreateInvoice);
    assert.strictEqual(kit.settings().connection, Account);
    assert.strictEqual(kit.settings().classFor("connection"), Account);
    assert.strictEqual(kit.settings().classFor("nope"), null);
  });

  it("makes a new client when the settings change", () => {
    reset();
    const first = kit.client();
    assert.strictEqual(kit.client(), first);
    kit.configure({ baseUrl: "http://127.0.0.1:1" });
    assert.notStrictEqual(kit.client(), first);
    assert.strictEqual(kit.client().baseUrl, "http://127.0.0.1:1");
  });
});

describe("kit: Operation", () => {
  it("start saves a new reference first, then starts the run with its webhook URL", async () => {
    reset();
    const record = invoices.add({ id: 9, qube_reference: "old", qube_revision: 5, qube_question: { token: "t" }, qube_links: {} });
    answer({ status: 201, json: { data: { id: "run_1", state: "running" } } });
    const run = await CreateInvoice.start(record, CONN);
    assert.deepStrictEqual(run, { id: "run_1", state: "running" });
    assert.match(record.qube_reference, /^create_invoice-9-[0-9a-f-]{36}$/);
    assert.strictEqual(record.qube_revision, 0);
    assert.strictEqual(record.qube_question, null);
    const sent = fake.received[0];
    assert.strictEqual(sent.path, `/api/v2/connections/${CONN}/workflow-runs`);
    assert.strictEqual(sent.body.workflow, "add_transaction");
    assert.strictEqual(sent.body.reference, record.qube_reference);
    assert.strictEqual(sent.body.webhook_url, "https://app.example.com/webhooks/qube/create_invoice/9");
    assert.deepStrictEqual(sent.body.input, { operation: "invoice.create", params: { ref_number: "9" } });
  });

  it("skips an event whose reference isn't the record's, and logs it", async () => {
    reset();
    const record = invoice();
    await job("create_invoice", 7, vectorBody("workflow_run.completed", { reference: "someone-else", revision: 3 }));
    assert.deepStrictEqual(calls, []);
    assert.strictEqual(record.qube_revision, 0);
    assert.ok(logged().some((l) => l.level === "warn" && /skipped workflow_run.completed for "someone-else": not its run/.test(l.text)));
  });

  it("applies a run's events only when newer than the last applied", async () => {
    reset();
    const record = invoice();
    await job("create_invoice", 7, vectorBody("workflow_run.completed", { reference: REFERENCE, revision: 4 }));
    assert.strictEqual(record.qube_revision, 4);
    await job("create_invoice", 7, vectorBody("workflow_run.failed", { reference: REFERENCE, revision: 3 })); // older
    await job("create_invoice", 7, vectorBody("workflow_run.completed", { reference: REFERENCE, revision: 4 })); // a retry
    assert.deepStrictEqual(calls, [["ended", 7, JSON.parse(vectorBody("workflow_run.completed")).outcome]]);
    assert.strictEqual(record.qube_revision, 4);
  });

  it("dispatches ended and failed, cancelled included", async () => {
    reset();
    invoice();
    await job("create_invoice", 7, vectorBody("workflow_run.failed", { reference: REFERENCE, revision: 1 }));
    await job("create_invoice", 7, vectorBody("workflow_run.cancelled", { reference: REFERENCE, revision: 2 }));
    await job("create_invoice", 7, vectorBody("workflow_run.completed", { reference: REFERENCE, revision: 3 }));
    assert.deepStrictEqual(
      calls.map((c) => c[0] + ":" + c[2]),
      ["failed:workflow_run.failed", "failed:workflow_run.cancelled", "ended:" + JSON.parse(vectorBody("workflow_run.completed")).outcome]
    );
  });

  it("takes a notification once, by its delivery id, through the dedupe setting", async () => {
    const seen = new Set();
    const asked = [];
    reset({
      dedupe: {
        async seen(key) {
          asked.push(["seen", key]);
          return seen.has(key);
        },
        async remember(key) {
          asked.push(["remember", key]);
          seen.add(key);
        },
      },
    });
    invoice({ qube_revision: 9 });
    const body = vectorBody("workflow_run.notification", { reference: REFERENCE, revision: 2 });
    await job("create_invoice", 7, body);
    await job("create_invoice", 7, body);
    const id = JSON.parse(body).delivery_id;
    assert.deepStrictEqual(calls, [["notification", 7, id]]); // revision 2 < 9 doesn't skip a notification
    assert.deepStrictEqual(asked, [["seen", id], ["remember", id], ["seen", id]]);
  });

  it("the in-memory dedupe default warns once", async () => {
    reset();
    invoice();
    const body = vectorBody("workflow_run.notification", { reference: REFERENCE, delivery_id: "d-default-1" });
    await job("create_invoice", 7, body);
    await job("create_invoice", 7, body);
    assert.strictEqual(calls.length, 1);
    // Warned at most once in this process (an earlier test may have been first).
    assert.ok(logged().filter((l) => /dedupe setting isn't set/.test(l.text)).length <= 1);
  });

  it("saves a question with its links, then forgets it on a newer event that isn't one", async () => {
    reset();
    const record = invoice();
    const asking = JSON.parse(vectorBody("workflow_run.awaiting_input"));
    await job("create_invoice", 7, JSON.stringify({ ...asking, reference: REFERENCE, revision: 2 }));
    assert.deepStrictEqual(record.qube_question, asking.prompt);
    assert.deepStrictEqual(record.qube_links, { decisions: asking.links.decisions, search: asking.links.search || null });
    assert.strictEqual(record.qube_revision, 2);

    // answered with another question's token keeps it; with its own forgets it.
    const operation = new CreateInvoice(record);
    await operation.answered("not-its-token");
    assert.ok(record.qube_question);

    await job("create_invoice", 7, vectorBody("workflow_run.completed", { reference: REFERENCE, revision: 3 }));
    assert.strictEqual(record.qube_question, null);
    assert.strictEqual(record.qube_links, null);
  });

  it("a record without save() says to override saveRecord", async () => {
    reset();
    const operation = new CreateInvoice({ id: 1 });
    await assert.rejects(() => operation.saveReference("r"), /CreateInvoice's saveRecord: this record has no save\(\), so override saveRecord/);
  });

  it("an operation's unwritten parts say so", async () => {
    reset();
    class Bare extends kit.Operation {
      static workflow = "w";
      static slug = "bare";
    }
    await assert.rejects(() => Bare.findRecord("3"), /Bare.findRecord\("3"\) isn't written yet/);
    assert.throws(() => new Bare({ id: 1 }).input(), /Bare's input isn't written yet/);
  });

  it("a job for a record findRecord can't find throws, for the queue to retry", async () => {
    reset();
    await assert.rejects(() => job("create_invoice", 404, vectorBody("workflow_run.completed")), /CreateInvoice.findRecord\("404"\) found nothing/);
  });
});

describe("kit: ConnectionEvents", () => {
  it("skips an event for another connection, and a run's event", async () => {
    reset();
    const row = account();
    const other = JSON.parse(vectorBody("connection.connected"));
    other.connection = { ...other.connection, id: "someone-elses" };
    await job("connection", 42, JSON.stringify(other));
    await job("connection", 42, vectorBody("workflow_run.completed"));
    assert.deepStrictEqual(calls, []);
    assert.strictEqual(row.qube_connection_revision, null);
    assert.strictEqual(logged().filter((l) => /not its connection/.test(l.text)).length, 2);
  });

  it("dispatches its four handlers, each only when newer", async () => {
    reset();
    const row = account();
    await job("connection", 42, vectorBody("connection.connected", { revision: 1 }));
    await job("connection", 42, vectorBody("connection.setup_cancelled", { revision: 2 }));
    await job("connection", 42, vectorBody("connection.resumed", { revision: 4 }));
    await job("connection", 42, vectorBody("connection.stalled", { revision: 3 })); // a retry after its resumed
    await job("connection", 42, vectorBody("connection.stalled", { revision: 5 }));
    assert.deepStrictEqual(
      calls.map((c) => c[0]),
      ["connected", "setupCancelled", "resumed", "stalled"]
    );
    assert.deepStrictEqual(calls[3], ["stalled", 42, "not_checking_in"]);
    assert.strictEqual(row.qube_connection_revision, 5);
  });

  it("saveConnectionId keeps the id and forgets the last connection's revision", async () => {
    reset();
    const row = account({ qube_connection_id: null, qube_connection_revision: 7 });
    const events = new Account(row);
    assert.strictEqual(await events.savedConnectionId(), null);
    await events.saveConnectionId("conn_new");
    assert.strictEqual(row.qube_connection_id, "conn_new");
    assert.strictEqual(row.qube_connection_revision, null);
    assert.strictEqual(row.saves, 1);
    assert.strictEqual(events.webhookUrl(), "https://app.example.com/webhooks/qube/connection/42");
  });
});

describe("kit: receiveWebhook and the default enqueue", () => {
  it("verifies, checks the slug, enqueues the body as text", async () => {
    const jobs = [];
    reset({ enqueue: (j) => jobs.push(j) });
    const body = vectorBody("workflow_run.completed");
    assert.deepStrictEqual(await kit.receiveWebhook({ operation: "create_invoice", recordId: "7", body: Buffer.from(body), signature: support.sign(body) }), {
      status: 200,
    });
    assert.deepStrictEqual(jobs, [{ operation: "create_invoice", recordId: "7", body }]);
    assert.deepStrictEqual(await kit.receiveWebhook({ operation: "nope", recordId: "7", body, signature: support.sign(body) }), { status: 404 });
    assert.deepStrictEqual(await kit.receiveWebhook({ operation: "create_invoice", recordId: "7", body, signature: "t=1,v1=00" }), { status: 401 });
    await assert.rejects(
      () => kit.receiveWebhook({ operation: "create_invoice", recordId: "7", body: JSON.parse(body), signature: support.sign(body) }),
      /already parsed/
    );
    assert.strictEqual(jobs.length, 1);
  });

  it("the default runs each job after the response, one at a time, and logs a failure", async () => {
    reset();
    const record = invoice();
    const body = vectorBody("workflow_run.completed", { reference: REFERENCE, revision: 1 });
    const later = vectorBody("workflow_run.failed", { reference: REFERENCE, revision: 2 });
    await kit.receiveWebhook({ operation: "create_invoice", recordId: "7", body, signature: support.sign(body) });
    await kit.receiveWebhook({ operation: "create_invoice", recordId: "7", body: later, signature: support.sign(later) });
    await kit.receiveWebhook({ operation: "create_invoice", recordId: "404", body, signature: support.sign(body) });
    assert.deepStrictEqual(calls, []); // not yet: after the response
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.deepStrictEqual(calls.map((c) => c[0]), ["ended", "failed"]);
    assert.strictEqual(record.qube_revision, 2);
    assert.ok(logged().some((l) => l.level === "error" && /the create_invoice job for 404 failed/.test(l.text)));
  });
});

describe("kit: questions without a framework", () => {
  const choice = {
    id: "use",
    label: "Use it",
    fields: [
      { name: "count", type: "number" },
      { name: "rush", type: "boolean" },
      { name: "note", type: "string" },
      { name: "blank", type: "string" },
      { name: "odd", type: "number" },
    ],
  };

  it("answerData takes each field as its type, nested or flat", () => {
    const flat = { choice: "use", "data[count]": " 3.5 ", "data[rush]": "true", "data[note]": " hi ", "data[blank]": " ", "data[odd]": "n/a" };
    const nested = { choice: "use", data: { count: "3.5", rush: "true", note: "hi", blank: "", odd: "n/a" } };
    const expected = { count: 3.5, rush: true, note: "hi", odd: "n/a" };
    assert.deepStrictEqual(kit.answerData(choice, flat), expected);
    assert.deepStrictEqual(kit.answerData(choice, nested), expected);
    assert.deepStrictEqual(kit.answerData(choice, {}), { rush: false });
  });

  it("refusalMessage reads errors.detail", () => {
    assert.strictEqual(kit.refusalMessage(new kit.APIError(422, JSON.stringify({ errors: { detail: "count must be whole" } }))), "QuBe Sync couldn't take that answer: count must be whole");
    assert.strictEqual(kit.refusalMessage(new kit.APIError(422, "<html>")), "QuBe Sync couldn't take that answer.");
  });
});

describe("kit: renderQuestion", () => {
  const question = {
    id: "ask_pick",
    token: "tok",
    kind: "pick",
    message: `Which <b>"customer"</b>?`,
    details: [{ label: "Name & co", value: "<script>x</script>" }],
    choices: [
      { id: "pick", label: "Pick 'one'", detail: "a > b", description: "desc", fields: [{ name: "customer", type: "record", label: "Customer", required: true }] },
      { id: "skip", label: "Skip", fields: [{ name: "why", type: "string" }, { name: "n", type: "number" }, { name: "b", type: "boolean" }] },
    ],
  };

  it("escapes every value and puts the CSRF token and nonce in", () => {
    const html = kit.renderQuestion(question, { action: `/qube/questions/create_invoice/7"x`, csrfToken: `c"t`, nonce: "n<1" });
    assert.ok(!html.includes("<b>"));
    assert.ok(!html.includes("<script>x"));
    assert.ok(html.includes("Which &lt;b&gt;&quot;customer&quot;&lt;/b&gt;?"));
    assert.ok(html.includes(`<th scope="row">Name &amp; co</th><td>&lt;script&gt;x&lt;/script&gt;</td>`));
    assert.strictEqual(html.match(/<form class="qube-choice" method="post" action="\/qube\/questions\/create_invoice\/7&quot;x">/g).length, 2);
    assert.strictEqual(html.match(/<input type="hidden" name="_csrf" value="c&quot;t">/g).length, 2);
    assert.ok(html.includes(`data-qube-search="/qube/questions/create_invoice/7&quot;x/search" data-qube-field="customer"`));
    assert.ok(html.includes(`<script nonce="n&lt;1">`));
    assert.ok(html.includes(kit.SEARCH_SCRIPT));
    assert.ok(html.includes(`Pick &#39;one&#39; <span class="qube-choice-detail">a &gt; b</span>`));
    assert.ok(html.includes(`<input type="text" id="qube-tok-1-why" name="data[why]">`));
    assert.ok(html.includes(`<input type="number" step="any" id="qube-tok-1-n" name="data[n]">`));
    assert.ok(html.includes(`<input type="checkbox" id="qube-tok-1-b" name="data[b]" value="true">`));
  });

  it("is empty with no question, leaves out the token without one, and takes another field name", () => {
    assert.strictEqual(kit.renderQuestion(null, { action: "/x" }), "");
    assert.ok(!kit.renderQuestion(question, { action: "/x" }).includes("_csrf"));
    assert.ok(kit.renderQuestion(question, { action: "/x", csrfToken: "t", csrfField: "authenticity_token" }).includes(`name="authenticity_token" value="t"`));
    assert.throws(() => kit.renderQuestion(question, {}), /needs \{ action \}/);
  });
});

describe("kit: mapping helpers", () => {
  it("read past what's missing", () => {
    assert.strictEqual(kit.get({ a: { b: 1 } }, "a", "b"), 1);
    assert.strictEqual(kit.get({ a: null }, "a", "b"), undefined);
    assert.deepStrictEqual(kit.rows(null), []);
    assert.deepStrictEqual(kit.rows(new Set([1])), [1]);
    assert.strictEqual(kit.asNumber(" "), undefined);
    assert.strictEqual(kit.asNumber("2.5"), 2.5);
    assert.strictEqual(kit.asInteger("2.5"), 2);
    assert.strictEqual(kit.asDate(new Date("2026-10-25T12:00:00Z")), "2026-10-25");
    assert.deepStrictEqual(kit.withoutNils({ a: null, b: [1, null, { c: undefined, d: 2 }] }), { b: [1, { d: 2 }] });
  });
});

describe("kit: package", () => {
  it("has no dependencies, and Express only as an optional peer", () => {
    const pkg = require("../package.json");
    assert.strictEqual(pkg.dependencies, undefined);
    assert.ok(pkg.peerDependencies.express);
    assert.strictEqual(pkg.peerDependenciesMeta.express.optional, true);
    assert.strictEqual(require("qubesync/kit"), kit);
    for (const name of ["./kit", "./express"]) {
      assert.deepStrictEqual(Object.keys(pkg.exports[name]), ["types", "import", "require"]);
    }
  });
});
