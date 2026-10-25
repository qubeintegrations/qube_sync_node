"use strict";

const { connectionWebhookUrl } = require("./client");

// The customer's connection's own events, which QuBe Sync POSTs to the connection's webhook URL:
// <webhookUrl>/connection/<account id>, which onboarding (connect) sets when they click Connect.
// Your app's connection class extends this, and is the connection setting; the job (run) hands
// each event to it, with the account found again.
//   connection.connected        the Web Connector checked in: QuickBooks is connected
//   connection.setup_cancelled  they chose "Cancel setup" on the setup page
//   connection.stalled          requests are stuck; see stallReason
//   connection.resumed          after a stall, they're being taken again
//
// The setup ends on the QuickBooks computer, which usually isn't signed in to your app, so
// nothing comes back to it there: connection.connected, signed by QuBe Sync, is how your app
// knows. A simulated connection is connected as it's made, so its connection.connected can come
// before createConnection returns: onboarding saves the id as soon as it has it.
//
// The account keeps the connection's id and the last event's revision, in its
// qube_connection_id (a string) and qube_connection_revision (a number) fields, written with
// saveRecord. Override savedConnectionId, saveConnectionId, savedRevision and saveRevision to
// keep them elsewhere.
class ConnectionEvents {
  // Your account, by the id in the connection's webhook URL.
  static async findRecord(id) {
    throw new Error(`${this.name}.findRecord(${JSON.stringify(id)}) isn't written yet`);
  }

  constructor(account) {
    this.account = account;
  }

  // Where the connection's events go: the webhookUrl setting, then connection and the account's
  // id, which findRecord finds the account by.
  webhookUrl() {
    return connectionWebhookUrl(this.account.id);
  }

  // One of the connection's webhooks, from the job, as qubesync parsed it (a ConnectionEvent).
  // Deliveries come at least once and, from a queue with more than one worker, in any order:
  // - an event whose connection isn't the one saved on the account (a signed body posted to
  //   another account's URL, or an event that isn't a connection's) is logged and skipped;
  // - any other is applied only when its revision is newer than the last one applied, so a
  //   retried connection.stalled that comes after its connection.resumed is skipped.
  async handle(event) {
    const connectionId = event.type === "connection" ? event.connectionId : null;
    const saved = await this.savedConnectionId();
    if (event.type !== "connection" || !connectionId || connectionId !== saved) {
      const of = JSON.stringify(connectionId);
      const { id } = this.account;
      console.warn(`QuBe Sync: account ${id} skipped ${event.event} for ${of}: not its connection`);
      return;
    }

    // Applied already, or older than what was.
    if (!event.newerThan(await this.savedRevision())) return;

    switch (event.event) {
      case "connection.connected":
        await this.connected(event);
        break;
      case "connection.setup_cancelled":
        await this.setupCancelled(event);
        break;
      case "connection.stalled":
        await this.stalled(event);
        break;
      case "connection.resumed":
        await this.resumed(event);
        break;
      default:
        this.logEvent(event);
    }
    await this.saveRevision(event.revision);
  }

  // What your app does with each: until you fill them in, each logs.

  // QuickBooks is connected: mark the account connected, and start syncing.
  async connected(event) {
    this.logEvent(event);
  }

  // They cancelled the setup: offer Connect QuickBooks Desktop again.
  async setupCancelled(event) {
    this.logEvent(event);
  }

  // Your requests are waiting and QuickBooks hasn't been reached. Show the customer, and tell
  // them what the event's stallReason says:
  // - "not_checking_in": the Web Connector isn't calling in. Turn on the QuickBooks computer,
  //   and check the Web Connector runs.
  // - "quickbooks_unavailable": it is calling in and can't reach QuickBooks. Open QuickBooks
  //   with the company file.
  // A stall can send this again with a new reason (the computer was turned on, and QuickBooks
  // isn't open yet): show the newest. resumed clears it.
  async stalled(event) {
    this.logEvent(event);
  }

  // Clear what stalled showed, whichever its reason.
  async resumed(event) {
    this.logEvent(event);
  }

  // The connection id kept on the account, or null: every run starts on it, and onboarding
  // reuses it.
  async savedConnectionId() {
    return this.account.qube_connection_id || null;
  }

  // Keeps a new connection's id on the account, and forgets the last connection's revision,
  // since each connection's revisions start again at 1.
  async saveConnectionId(connectionId) {
    this.account.qube_connection_id = connectionId;
    this.account.qube_connection_revision = null;
    await this.saveRecord();
  }

  async savedRevision() {
    const revision = this.account.qube_connection_revision;
    return revision === undefined ? null : revision;
  }

  async saveRevision(revision) {
    this.account.qube_connection_revision = revision;
    await this.saveRecord();
  }

  // Writes the account's qube_ fields with its save(), as Sequelize's, Mongoose's and TypeORM's
  // records have it. Override it for another ORM (Prisma's update, say).
  async saveRecord() {
    if (!this.account || typeof this.account.save !== "function") {
      throw new Error(`${this.constructor.name}'s saveRecord: this account has no save(), so override saveRecord`);
    }
    await this.account.save();
  }

  // All a handler does until you fill it in.
  logEvent(event) {
    const { id } = this.account;
    const line = `QuBe Sync: account ${id}: ${event.event} (revision ${event.revision})`;
    if (event.event === "connection.stalled") {
      console.warn(line);
    } else {
      console.log(line);
    }
  }
}

module.exports = { ConnectionEvents };
