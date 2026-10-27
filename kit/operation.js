"use strict";

const { randomUUID } = require("crypto");

const { client, isRefused } = require("./client");
const { NotConnected } = require("./errors");
const { withoutNils } = require("./mapping");
const { Connection, Run, recordKey, blank } = require("./records");
const { settings } = require("./settings");

// The run fields the job writes once an event is applied: the run as of that event, and whatever
// a handler changed on this.run.
const RUN_EVENT_FIELDS = Object.freeze(["state", "outcome", "error", "cancelReason", "endedAt", "question", "links", "revision"]);

// One way your app starts a workflow, and what it does with that run's webhooks: subclass it once
// per operation, in your app's quickbooks-desktop/, and list it in the operations setting by its
// slug.
//
//   class CreateInvoice extends Operation {
//     static workflow = "add_transaction";
//     static slug = "create_invoice";
//
//     input() {
//       return { operation: "invoice.create", params: { ref_number: this.record.number } };
//     }
//
//     async ended(event) {
//       const txn = (event.output && event.output.record) || {};
//       await this.connection.link(this.record, { kind: "invoice", qbId: txn.txn_id,
//                                                 editSequence: txn.edit_sequence, name: txn.ref_number });
//     }
//   }
//
//   const run = await CreateInvoice.start(invoice, connection);
//
// Each run is a row in qube_runs (Run), written before the run starts, and its webhook URL is
// QUBE_WEBHOOK_URL/runs/<run id>, so the job hands each event back to the same class with the
// record, the run and its connection found again. Your record's table needs no QuBe columns: the
// run keeps its reference, revision, state and question, and the QuickBooks ids an ending carries
// go on the connection (connection.link), keyed by kind.
class Operation {
  // Starts the operation's run for record on connection (one with a qubeId) and resolves to the
  // run, written first ("starting") with a new reference and its input. While the record's last
  // run of this operation on connection hasn't ended, it returns that run instead (run.reused),
  // resending an unconfirmed start with the same reference. See the README for refusals and
  // starts that get no answer.
  static async start(record, connection) {
    if (!Operation.#madeByQubeSync(connection)) {
      throw new NotConnected(
        `QuBe Sync: ${this.name}.start needs a connection QuBe Sync has made (one with a qubeId): the customer finishes onboarding first`
      );
    }

    const on = connection instanceof Connection ? connection : new Connection(connection);
    const { row, reused, inputError } = await Operation.#claimRun.call(this, record, on);
    if (inputError) throw inputError;

    const run = new Run(row, on.store, on);
    if (reused) {
      run.reused = true;
      return Operation.#resume.call(this, run);
    }
    return Operation.#sendStart.call(this, run, run.input);
  }

  // Under the connection row's lock, so a double click finds one row: the record's run that
  // hasn't ended, or a new row written with its input (or "failed", with the error the input
  // threw, kept once the lock's transaction commits).
  static async #claimRun(record, connection) {
    const [type, id] = recordKey(record);
    return connection.store.withConnectionLock(connection.id, async (tx) => {
      const going = await tx.latestRun(type, id, this.slug, { connectionId: connection.id });
      if (going && !Run.ENDED_STATES.includes(going.state)) return { row: going, reused: true };

      const fields = {
        connectionId: connection.id,
        operation: this.slug,
        recordType: type,
        recordId: id,
        reference: `${this.slug}-${id}-${randomUUID()}`,
        state: "starting",
        revision: 0,
      };
      const unsaved = new Run(fields, tx, new Connection({ ...connection }, tx));
      let input;
      try {
        // As JSON reads it back, so a retry sends exactly what the first start did.
        input = asJson(await new this(record, unsaved).input());
      } catch (err) {
        return { row: await tx.createRun({ ...fields, state: "failed" }), inputError: err };
      }
      return { row: await tx.createRun({ ...fields, input }) };
    });
  }

  // A reused run: its start sent again while QuBe Sync hasn't confirmed it, else as it is.
  static async #resume(run) {
    if (run.state === "starting" && blank(run.qubeRunId)) return Operation.#sendStart.call(this, run, run.input);
    return run;
  }

  // Sends a start that got no answer again (run.retryStart() calls it): the same reference as the
  // Idempotency-Key, the same workflow, input and webhook URL. QuBe Sync answers a repeat of a
  // start it took with the run that start made (201, Idempotent-Replayed: true) rather than
  // starting another, for as long as that run is kept (60 days after it ends); a start it never
  // took starts now. Resolves to the run; a run already answered is returned as it is.
  static async retryStart(run) {
    if (!blank(run.qubeRunId)) return run;
    if (run.state !== "starting") {
      throw new TypeError(`QuBe Sync: run ${run.id} is ${run.state}: only a start that got no answer is sent again`);
    }

    return Operation.#sendStart.call(this, run, run.input);
  }

  static async #sendStart(run, input) {
    let started;
    try {
      started = await client().startRun(run.connection.qubeId, this.workflow, input === null ? undefined : input, {
        reference: run.reference,
        webhookUrl: run.webhookUrl(),
      });
    } catch (err) {
      if (Operation.#refused(err)) await Operation.#markFailed(run);
      throw err;
    }
    await Operation.#recordStart(run, started !== null && typeof started === "object" ? started : {});
    return run;
  }

  // A 4xx: nothing started. Not a 409, the reference in use by a call still in flight (the
  // other click of a double click), whose start may land: that run stays "starting".
  static #refused(err) {
    return isRefused(err) && err.status !== 409;
  }

  static async #markFailed(run) {
    await run.update({ state: "failed" });
  }

  // The run's id, links and state from QuBe Sync's answer. Its webhooks may have come first, so
  // the state is taken only while the row still says "starting".
  static async #recordStart(run, started) {
    const links = started.links !== null && typeof started.links === "object" ? started.links : {};
    const row = await run.store.withRunLock(run.id, (tx, locked) => {
      const changes = { qubeRunId: started.id === undefined ? null : started.id, runUrl: links.run || null, cancelUrl: links.cancel || null };
      if (locked.state === "starting" && started.state) changes.state = started.state;
      return tx.updateRun(run.id, changes);
    });
    Object.assign(run, row);
  }

  // A Connection QuBe Sync has made: one with a qubeId.
  static #madeByQubeSync(connection) {
    return connection !== null && typeof connection === "object" && !blank(connection.id) && !blank(connection.qubeId);
  }

  // Your record, by the id its run keeps (a string). Leave it out and the run finds it with the
  // findRecord setting, by its recordType; write it to load what input and the handlers read with
  // it:
  //   static async findRecord(id) {
  //     return Invoice.findByPk(id, { include: ["lines"] });
  //   }
  static async findRecord(id) {
    throw new Error(`${this.name}.findRecord(${JSON.stringify(id)}) isn't written: leave it out to find the record with the findRecord setting`);
  }

  /** The run's record: findRecord when the operation writes one, else the findRecord setting's. */
  static async recordFor(run) {
    const record = this.findRecord === Operation.findRecord ? await settings().findRecord(run.recordType, run.recordId) : await this.findRecord(String(run.recordId));
    return record === undefined ? null : record;
  }

  constructor(record, run) {
    this.record = record;
    this.run = run || null;
  }

  // The connection the run is on (a Connection): where the QuickBooks ids an ending carries are
  // kept (connection.link), and where the ones the input names are read (connection.qbIdFor).
  get connection() {
    return this.run ? this.run.connection : null;
  }

  // The store the run is kept in: inside a handler, the run lock's transaction, so what your
  // handler writes through it is saved with the run or not at all.
  get store() {
    return this.run ? this.run.store : settings().store;
  }

  /** When this connection's last completed run of the workflow started, or null: a sync's since. */
  async lastSyncedAt() {
    return this.connection.lastSyncedAt(this.constructor.workflow);
  }

  // The run's input, from the record. Each operation says how. It may return the input builder
  // `npx qubesync workflows` generates for its workflow, typed as <Workflow><Branch>Input
  // (addTransaction.invoiceInput(params, { adds }) is an AddTransactionInvoiceInput, from
  // ../qube-workflows); a plain object works the same.
  input() {
    throw new Error(`${this.constructor.name}'s input isn't written yet`);
  }

  // One of the run's webhooks, from the job, as qubesync parsed it: a WorkflowRunEvent or a
  // NotificationEvent. Deliveries come at least once and, from a queue with more than one worker,
  // in any order:
  // - an event whose reference isn't the run's, or whose connection_id isn't its connection's
  //   qubeId (a signed body posted to another run's URL), is logged and skipped;
  // - a notification is taken once, by its delivery_id (in qube_notifications, with what the
  //   handler writes);
  // - any other event is applied only when its revision is newer than the last one applied.
  // It holds the run row's lock while it does (withRunLock, which reads it again), so two workers
  // never apply one run's events at once, and what a handler writes through the store is saved
  // with the revision or not at all.
  async handle(event) {
    const base = this.run.store;
    const applied = await base.withRunLock(this.run.id, async (tx, row) => {
      if (!row) return null; // deleted since the job found it
      const connection = await tx.getConnection(row.connectionId);
      this.run = new Run(row, tx, connection ? new Connection(connection, tx) : null);
      await this.#apply(event, tx);
      return { run: this.run, connection };
    });
    if (!applied) {
      console.warn(`QuBe Sync: dropped ${event.event || event.type}: run ${this.run.id} isn't there (deleted since, so it can't be applied)`);
      return;
    }
    // Outside the lock, the run is read through the store again.
    const { run, connection } = applied;
    this.run = new Run({ ...run }, base, connection ? new Connection(connection, base) : null);
  }

  // A question the run asks: kept whole on the run, with its links (where to answer it, and where
  // a record field searches), for renderQuestion to show on the record's page. Your user's choice
  // answers it, through the question routes: nothing here picks one, and the run waits for as long
  // as it takes. A newer event that isn't a question forgets it.
  async question(event) {
    const prompt = event.prompt;
    if (!prompt) return; // answered already: this delivery was a retry

    const links = event.links || {};
    this.run.question = prompt;
    this.run.links = { decisions: links.decisions === undefined ? null : links.decisions, search: links.search === undefined ? null : links.search };
  }

  // What an operation does with the rest of its run's events: each operation says, and until it
  // does, each logs. The kit has already kept every ending on the run (state, outcome, error,
  // cancelReason, endedAt: renderRunStatus shows it), so these are for your own records: an
  // invoice marked sent, a sync's last-finished time.

  async notification(event) {
    this.logEvent(event);
  }

  async ended(event) {
    this.logEvent(event);
  }

  async failed(event) {
    this.logEvent(event);
  }

  // How the input refers to one of your records in QuickBooks: { list_id } when it's linked on
  // this run's connection (connection.qbIdFor), else { full_name: name }, or null when there's
  // neither. Refer by id where you can: a name can match another record, or none after a rename.
  //   customer_ref: await this.quickbooksRef(this.record.customer, { kind: "customer", name: get(this.record, "customer", "name") })
  async quickbooksRef(appRecord, { kind, name = null } = {}) {
    const listId = appRecord === null || appRecord === undefined ? null : await this.connection.qbIdFor(appRecord, { kind });
    if (listId) return { list_id: listId };
    if (blank(name)) return null;

    return { full_name: name };
  }

  // Links each QuickBooks record an ending carries (event.output.references, keyed by the input's
  // path: "customer_ref", "invoice_line_add.0.item_ref") to the record of yours your function
  // returns for it, on this run's connection, so the next run refers to it by id. The function
  // gets the path and the entry (kind, outcome and record: the record's own list as "type", with
  // list_id, edit_sequence and full_name) and returns your record, or null to skip it. An entry
  // with no record (not found, or not reached before a cancel) is skipped. Works on an added
  // ending and on a cancelled one, which can carry some. Resolves to the rows linked.
  //   await this.linkReferences(event, (path, entry) => (path === "customer_ref" ? this.record.customer : null));
  async linkReferences(event, recordFor) {
    const output = event.output !== undefined ? event.output : event.body && event.body.output;
    const references = isObject(output) ? output.references : null;
    if (!isObject(references)) return [];

    const linked = [];
    for (const [path, entry] of Object.entries(references)) {
      if (!isObject(entry) || !isObject(entry.record)) continue;

      const found = entry.record;
      if (blank(found.list_id)) continue;

      const appRecord = await recordFor(path, entry);
      if (appRecord === null || appRecord === undefined) continue;

      const kind = blank(found.type) ? entry.kind : found.type;
      linked.push(await this.connection.link(appRecord, { kind, qbId: found.list_id, editSequence: found.edit_sequence, name: found.full_name }));
    }
    return linked;
  }

  // After your user's choice is in: the question is forgotten, unless the run has asked another
  // since (its token is the question's own). taken: QuBe Sync took the answer, so the run is
  // running again until its next webhook (which waits on the Web Connector's next poll).
  async answered(token, { taken = false } = {}) {
    const row = await this.run.store.withRunLock(this.run.id, (tx, locked) => {
      const question = locked ? new Run(locked).openQuestion() : null;
      if (!question || question.token !== token) return locked;
      return tx.updateRun(locked.id, { question: null, links: null, ...(taken ? { state: "running" } : {}) });
    });
    if (row) Object.assign(this.run, row);
  }

  // The input without its null and undefined values, at every depth: what a mapped operation's
  // input sends, so a field your record doesn't have yet is left out rather than sent as null.
  withoutNils(value) {
    return withoutNils(value);
  }

  // All a handler does until you fill it in.
  logEvent(event) {
    const body = event.body || {};
    const detail = (isObject(body.prompt) && body.prompt.id) || body.name || body.outcome;
    const line = `QuBe Sync: ${this.constructor.name} ${this.record && this.record.id} (run ${this.run && this.run.id}): ${event.event} ${detail} (${event.reference})`;
    if (event.type === "workflow_run" && Operation.#stopped(event)) {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  // Only a run's events and its notifications carry a reference: any other event posted to this
  // URL is skipped with the rest that aren't this run's.
  async #apply(event, tx) {
    const { run } = this;
    if (!this.#thisRun(event)) {
      const on = event.body && event.body.connection_id;
      console.warn(
        `QuBe Sync: ${this.constructor.name} run ${run.id} skipped ${event.event} for ${JSON.stringify(event.reference)} on ${JSON.stringify(on === undefined ? null : on)}: not this run`
      );
      return;
    }

    if (event.type === "notification") {
      // Taken once per delivery_id, its row written in this lock's transaction: the row and the
      // handler's writes commit together, or neither does.
      const deliveryId = event.deliveryId === null || event.deliveryId === undefined ? "" : String(event.deliveryId);
      await tx.once(run.id, deliveryId, () => this.notification(event));
      return;
    }
    if (event.type !== "workflow_run") return;
    // Applied already, or older than what was.
    if (!event.newerThan(run.revision)) return;

    // The run as of this event, before your handler runs, so every ending is on the run row
    // whatever the handler does: state, outcome, and a failure's error or a cancel's reason.
    run.state = event.runState || this.#runStateFor(event);
    run.outcome = event.outcome;
    if (Operation.#ended(event)) {
      run.endedAt = run.endedAt || new Date();
      if (event.event === "workflow_run.failed") run.error = event.error;
      if (event.event === "workflow_run.cancelled") run.cancelReason = event.cancelReason;
    }

    const asking = event.event === "workflow_run.awaiting_input";
    if (asking) {
      await this.question(event);
    } else if (event.event === "workflow_run.completed") {
      await tx.advanceSyncMark(run.connectionId, this.constructor.workflow, run.createdAt);
      await this.ended(event);
    } else if (Operation.#stopped(event)) {
      await this.failed(event);
    }
    // A newer event that isn't a question: the one saved was answered, or the run ended.
    if (!asking) {
      run.question = null;
      run.links = null;
    }
    run.revision = event.revision;
    const changes = {};
    for (const field of RUN_EVENT_FIELDS) changes[field] = run[field] === undefined ? null : run[field];
    Object.assign(run, await tx.updateRun(run.id, changes));
  }

  // The event names this run: its reference, on its connection.
  #thisRun(event) {
    return this.#sameReference(event) && this.#onThisConnection(event);
  }

  #sameReference(event) {
    return !blank(event.reference) && event.reference === this.run.reference;
  }

  #onThisConnection(event) {
    const qubeId = this.run.connection && this.run.connection.qubeId;
    return !blank(qubeId) && event.body && event.body.connection_id === qubeId;
  }

  // The run is over: completed, failed or cancelled.
  static #ended(event) {
    return event.event === "workflow_run.completed" || Operation.#stopped(event);
  }

  // The run ended without completing: failed or cancelled, which the failed handler takes.
  static #stopped(event) {
    return event.event === "workflow_run.failed" || event.event === "workflow_run.cancelled";
  }

  #runStateFor(event) {
    switch (event.event) {
      case "workflow_run.awaiting_input":
        return "awaiting_input";
      case "workflow_run.completed":
        return "completed";
      case "workflow_run.failed":
        return "failed";
      case "workflow_run.cancelled":
        return "cancelled";
      default:
        return this.run.state;
    }
  }
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// A value as JSON reads it back (undefined as null).
function asJson(value) {
  return value === undefined ? null : JSON.parse(JSON.stringify(value));
}

module.exports = { Operation };
