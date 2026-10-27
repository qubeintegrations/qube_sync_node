"use strict";

const { NotReady } = require("./errors");
const { Connection, blank } = require("./records");

// The fields the job writes once a connection's event is applied: the connection as of that
// event, and whatever your handler changed on this.connection.
const CONNECTION_EVENT_FIELDS = Object.freeze(["name", "status", "stallReason", "revision"]);

// A connection's own events, which QuBe Sync POSTs to the connection's webhook URL,
// QUBE_WEBHOOK_URL/connections/<connection id>, set when onboarding makes it. The job applies each
// to the connection row (status, stallReason, revision) and then hands it to your class (a
// subclass of this, the connectionEvents setting), which sees the connection and its owner:
//   connection.connected        the Web Connector checked in: QuickBooks is connected
//   connection.setup_cancelled  they chose "Cancel setup" on the setup page
//   connection.stalled          requests are stuck; see stallReason
//   connection.resumed          after a stall, they're being taken again
//
// The setup ends on the QuickBooks computer, which usually isn't signed in to your app, so
// nothing comes back to it there: connection.connected, signed by QuBe Sync, is how your app
// knows. connection.status already says so when your handler runs.
class ConnectionEvents {
  constructor(connection) {
    this.connection = connection instanceof Connection ? connection : new Connection(connection);
  }

  /** The account (or whatever your app's customer is) that connected it: the findRecord setting's. */
  async owner() {
    return this.connection.owner();
  }

  // The store the connection is kept in: inside a handler, the connection lock's transaction, so
  // what your handler writes through it is saved with the revision or not at all.
  get store() {
    return this.connection.store;
  }

  // One of the connection's webhooks, from the job, as qubesync parsed it (a ConnectionEvent).
  // Deliveries come at least once and, from a queue with more than one worker, in any order:
  // - an event whose connection isn't this row's qubeId (a signed body posted to another
  //   connection's URL) is logged and skipped;
  // - any other is applied only when its revision is newer than the last one applied, so a
  //   retried connection.stalled that comes after its connection.resumed is skipped.
  // It holds the connection row's lock while it does, so two workers never apply its events at
  // once, and what your handler writes through the store is saved with the revision or not at
  // all.
  //
  // A row with no qubeId yet can't be checked: its id is adopted from QuBe Sync when one of the
  // app's connections there has this row's webhook URL (a create that landed but whose id wasn't
  // saved yet), and otherwise NotReady is thrown, so the queue retries it.
  async handle(event) {
    if (blank(this.connection.qubeId)) {
      await this.connection.adoptQubeConnection();
      if (blank(this.connection.qubeId)) {
        throw new NotReady(`QuBe Sync: connection ${this.connection.id} has no qubeId yet; ${event.event} waits for it`);
      }
    }

    const base = this.connection.store;
    const applied = await base.withConnectionLock(this.connection.id, async (tx, row) => {
      if (!row) return null; // deleted since the job found it
      this.connection = new Connection(row, tx);
      await this.#apply(event, tx);
      return this.connection;
    });
    if (!applied) {
      console.warn(`QuBe Sync: dropped ${event.event || event.type}: connection ${this.connection.id} isn't there (deleted since, so it can't be applied)`);
      return;
    }
    // Outside the lock, the connection is read through the store again.
    this.connection = new Connection({ ...applied }, base);
  }

  // What your app does with each: until you fill them in, each logs.

  // QuickBooks is connected: show the connection as connected, and start syncing.
  async connected(event) {
    this.logEvent(event);
  }

  // They cancelled the setup: offer Connect QuickBooks Desktop again.
  async setupCancelled(event) {
    this.logEvent(event);
  }

  // Your requests are waiting and QuickBooks hasn't been reached. Show the customer, and tell them
  // what the event's stallReason (and connection.stallReason) says:
  // - "not_checking_in": the Web Connector isn't calling in. Turn on the QuickBooks computer, and
  //   check the Web Connector runs.
  // - "quickbooks_unavailable": it is calling in and can't reach QuickBooks. Open QuickBooks with
  //   the company file.
  // A stall can send this again with a new reason (the computer was turned on, and QuickBooks
  // isn't open yet): show the newest. resumed clears it.
  async stalled(event) {
    this.logEvent(event);
  }

  // Clear what stalled showed, whichever its reason.
  async resumed(event) {
    this.logEvent(event);
  }

  // The account disconnected it (disconnectQuickbooks): delete your rows that point at it,
  // through this.store. Runs in the transaction that deletes it, before its runs and links go.
  async disconnected() {}

  // All a handler does until you fill it in.
  logEvent(event) {
    const body = event.body || {};
    const line = `QuBe Sync: connection ${this.connection.id}: ${body.event} (revision ${body.revision})`;
    if (body.event === "connection.stalled") {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  // Only a connection event carries a connection: any other event posted to this URL is skipped
  // as not its connection.
  async #apply(event, tx) {
    const { connection } = this;
    const connectionId = event.type === "connection" ? event.connectionId : null;
    if (!this.#thisConnection(connectionId)) {
      console.warn(`QuBe Sync: connection ${connection.id} skipped ${event.event} for ${JSON.stringify(connectionId)}: not this connection`);
      return;
    }

    // Applied already, or older than what was.
    if (!event.newerThan(connection.revision)) return;

    const status = ConnectionEvents.STATUS[event.event];
    if (status) {
      connection.status = status;
      connection.stallReason = event.event === "connection.stalled" ? event.stallReason : null;
    }
    connection.revision = event.revision;

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
    const changes = {};
    for (const field of CONNECTION_EVENT_FIELDS) changes[field] = connection[field] === undefined ? null : connection[field];
    Object.assign(connection, await tx.updateConnection(connection.id, changes));
  }

  // The event is about this connection: its connection id is the one QuBe Sync made it.
  #thisConnection(connectionId) {
    return !blank(connectionId) && connectionId === this.connection.qubeId;
  }
}

// The status each event leaves the connection in.
ConnectionEvents.STATUS = Object.freeze({
  "connection.connected": "connected",
  "connection.setup_cancelled": "setup_cancelled",
  "connection.stalled": "stalled",
  "connection.resumed": "connected",
});

module.exports = { ConnectionEvents };
