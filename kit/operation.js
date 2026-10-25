"use strict";

const { randomUUID } = require("crypto");

const { client, webhookBase } = require("./client");
const { settings } = require("./settings");

// One way your app starts a workflow, and what it does with that run's webhooks: a subclass per
// operation, in your app's quickbooks-desktop/ (create-invoice.js, say), listed by slug in the
// operations setting. Each run's webhook URL names the operation and your record
// (<webhookUrl>/<slug>/<record id>), so the job (run) hands each event back to the same class,
// with the record found again.
//
// The run's reference and the last revision applied are kept on the record, in its
// qube_reference (a string) and qube_revision (a number) fields, and a question the run asks,
// with its links, in qube_question and qube_links (JSON) fields, written with saveRecord. A
// record whose workflow asks nothing (a sync's) needs only the first two. Override
// savedReference, saveReference, savedRevision and saveRevision, or savedQuestion, savedLinks and
// saveQuestion, to keep them elsewhere.
class Operation {
  // Starts the operation's run for `record`, one your app has saved, on the customer's
  // connection (the connection id onboarding saved for them), and returns the run as it stands.
  // The reference is new for every run (<slug>-<record id>-<uuid>) and saved on the record
  // before the run starts, since a webhook can arrive before this returns.
  static async start(record, connectionId) {
    const operation = new this(record);
    const reference = `${this.slug}-${record.id}-${randomUUID()}`;
    await operation.saveReference(reference);
    const input = await operation.input();
    return client().startRun(connectionId, this.workflow, input, {
      reference,
      webhookUrl: operation.webhookUrl(),
    });
  }

  // Your record, by the id in its webhook URL. Each operation says how.
  static async findRecord(id) {
    throw new Error(`${this.name}.findRecord(${JSON.stringify(id)}) isn't written yet`);
  }

  constructor(record) {
    this.record = record;
  }

  // Where this run's webhooks go: the webhookUrl setting, then the operation and the record's id.
  webhookUrl() {
    const { slug } = this.constructor;
    return `${webhookBase()}/${slug}/${encodeURIComponent(String(this.record.id))}`;
  }

  // The run's input, from the record. Each operation says how.
  input() {
    throw new Error(`${this.constructor.name}'s input isn't written yet`);
  }

  // One of the run's webhooks, from the job, as qubesync parsed it: a WorkflowRunEvent or a
  // NotificationEvent. Deliveries come at least once and, from a queue with more than one
  // worker, in any order:
  // - an event whose reference isn't the one saved on the record isn't this record's run (an
  //   earlier run's, or a signed body posted to another record's URL): it's logged and skipped;
  // - a notification is taken once, by its delivery_id, through the dedupe setting;
  // - any other event is applied only when its revision is newer than the last one applied.
  // With more than one worker, take a row lock on the record around it (SELECT ... FOR UPDATE)
  // so two workers never apply one record's events at once.
  async handle(event) {
    const saved = await this.savedReference();
    if (!event.reference || event.reference !== saved) {
      const { name } = this.constructor;
      const of = JSON.stringify(event.reference);
      console.warn(`QuBe Sync: ${name} ${this.record.id} skipped ${event.event} for ${of}: not its run`);
      return;
    }

    if (event.type === "notification") {
      const id = String(event.dedupeKey); // its delivery_id
      const { dedupe } = settings();
      if (await dedupe.seen(id)) return; // a retry of one already taken
      await this.notification(event);
      await dedupe.remember(id);
      return;
    }

    // Only a run's events and its notifications carry a reference.
    if (event.type !== "workflow_run") return;
    // Applied already, or older than what was.
    if (!event.newerThan(await this.savedRevision())) return;

    switch (event.event) {
      case "workflow_run.awaiting_input":
        await this.question(event);
        break;
      case "workflow_run.completed":
        await this.ended(event);
        break;
      case "workflow_run.failed":
      case "workflow_run.cancelled":
        await this.failed(event);
        break;
    }
    // A newer event that isn't a question: the one saved was answered, or the run ended.
    const asking = event.event === "workflow_run.awaiting_input";
    if (!asking && (await this.savedQuestion())) await this.saveQuestion(null, null);
    await this.saveRevision(event.revision);
  }

  // A question the run asks: saved whole on the record, with its links (where to answer it, and
  // where a record field searches), for renderQuestion to show on the record's page. Your user's
  // choice answers it, through the question routes: nothing here picks one, and the run waits
  // for as long as it takes. A newer event that isn't a question forgets it.
  async question(event) {
    if (!event.prompt) return; // answered already: this delivery was a retry
    const links = event.links || {};
    await this.saveQuestion(event.prompt, { decisions: links.decisions, search: links.search || null });
  }

  // What an operation does with the rest of its run's events: each operation says, and until it
  // does, each logs.

  async notification(event) {
    this.logEvent(event);
  }

  async ended(event) {
    this.logEvent(event);
  }

  async failed(event) {
    this.logEvent(event);
  }

  async savedReference() {
    return this.record.qube_reference;
  }

  // Saves a new run's reference and forgets the last run's revision, since each run's revisions
  // start again at 1, and any question it was asking.
  async saveReference(reference) {
    this.record.qube_reference = reference;
    this.record.qube_revision = 0;
    if (this.record.qube_question) {
      this.record.qube_question = null;
      this.record.qube_links = null;
    }
    await this.saveRecord();
  }

  async savedRevision() {
    return this.record.qube_revision;
  }

  async saveRevision(revision) {
    this.record.qube_revision = revision;
    await this.saveRecord();
  }

  // The question the run is asking, as its webhook's prompt had it, or null.
  async savedQuestion() {
    return this.record.qube_question || null;
  }

  // Its links: decisions and, for a record field, search.
  async savedLinks() {
    return this.record.qube_links || null;
  }

  async saveQuestion(prompt, links) {
    this.record.qube_question = prompt;
    this.record.qube_links = links;
    await this.saveRecord();
  }

  // After your user's choice is in: the question is forgotten, unless the run has asked another
  // since (its token is the question's own).
  async answered(token) {
    const question = await this.savedQuestion();
    if (question && question.token === token) await this.saveQuestion(null, null);
  }

  // Writes the record's qube_ fields with its save(), as Sequelize's, Mongoose's and TypeORM's
  // records have it. Override it for another ORM (Prisma's update, say).
  async saveRecord() {
    if (!this.record || typeof this.record.save !== "function") {
      throw new Error(`${this.constructor.name}'s saveRecord: this record has no save(), so override saveRecord`);
    }
    await this.record.save();
  }

  // All a handler does until you fill it in.
  logEvent(event) {
    const { name } = this.constructor;
    const body = event.body || {};
    const detail = (body.prompt && body.prompt.id) || body.name || body.outcome;
    const line = `QuBe Sync: ${name} ${this.record.id}: ${event.event} ${detail} (${event.reference})`;
    if (event.event === "workflow_run.failed" || event.event === "workflow_run.cancelled") {
      console.warn(line);
    } else {
      console.log(line);
    }
  }
}

module.exports = { Operation };
