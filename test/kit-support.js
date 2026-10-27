"use strict";

// What the kit's tests share: a local fake of QuBe Sync's API, an app's records kept in memory,
// the kit's own rows in memoryStore(), signed bodies from the vectors, and a capture of what the
// kit logs.

const assert = require("node:assert");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const kit = require("../kit");

const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "test_vectors.json"), "utf8"));
const SECRET = vectors.secrets[0];
const API_KEY = "sk_test_kit_never_show_me";
// The vectors' connection id: a connection made with it receives the vectors' events.
const CONN = "0196a1c0-0000-7000-8000-00000000c001";
const RUN = "0196a1c0-0000-7000-8000-00000000f001";
const WEBHOOK_URL = "https://app.example.com/webhooks/qube";

// ---------------------------------------------------------------------------
// The fake QuBe Sync: records every request, answers from a queue.

const fake = { received: [], responses: [], base: null };

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const url = new URL(req.url, "http://localhost");
    const text = Buffer.concat(chunks).toString("utf8");
    fake.received.push({
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      headers: req.headers,
      body: text === "" ? undefined : JSON.parse(text),
    });
    const answer = fake.responses.length > 1 ? fake.responses.shift() : fake.responses[0] || {};
    if (answer.destroy) return req.socket.destroy();
    // before: something that happens while QuBe Sync has the request (a webhook that beats the
    // answer back).
    Promise.resolve(answer.before && answer.before()).then(() => {
      const body = answer.json !== undefined ? JSON.stringify(answer.json) : answer.raw || "";
      res.writeHead(answer.status || 200, { "content-type": "application/json" });
      res.end(body);
    });
  });
});

// node:test's before/after hooks need Node 16.18, and this package supports 16.17: every test
// waits for the server instead.
const ready = new Promise((resolve, reject) => {
  server.on("connection", (socket) => socket.unref());
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    server.unref();
    fake.base = `http://127.0.0.1:${server.address().port}`;
    resolve();
  });
});

function answer(...list) {
  fake.responses = list;
}

// What QuBe Sync answers with: { data }.
function data(value, status = 200) {
  return { status, json: { data: value } };
}

function apiError(status, errors) {
  return { status, json: { errors } };
}

// ---------------------------------------------------------------------------
// Logs

let lines = [];
const original = { log: console.log, warn: console.warn, error: console.error };

function capture() {
  lines = [];
  for (const level of ["log", "warn", "error"]) {
    console[level] = (...args) => lines.push({ level, text: args.map((a) => (a instanceof Error ? a.message : String(a))).join(" ") });
  }
}

function release() {
  Object.assign(console, original);
}

function logged() {
  return lines;
}

function loggedText() {
  return lines.map((line) => `${line.level} ${line.text}`).join("\n");
}

// ---------------------------------------------------------------------------
// The app's records, kept in memory. Their tables have no QuBe columns.

class Table {
  constructor(Model) {
    this.Model = Model;
    this.rows = new Map();
    this.next = 0;
  }
  add(fields = {}) {
    this.next += 1;
    const row = Object.assign(new this.Model(), { id: this.next, ...fields });
    this.rows.set(String(row.id), row);
    return row;
  }
  find(id) {
    return this.rows.get(String(id)) || null;
  }
}

class Account {}
class Invoice {}
class Customer {}

const tables = { Account: new Table(Account), Invoice: new Table(Invoice), Customer: new Table(Customer) };

// What each handler was called with, in order.
const calls = [];

class CreateInvoice extends kit.Operation {
  static workflow = "add_transaction";
  static slug = "create_invoice";

  static async findRecord(id) {
    return tables.Invoice.find(id);
  }

  input() {
    return this.withoutNils({ operation: "invoice.create", params: { ref_number: this.record.number, memo: null } });
  }

  async notification(event) {
    calls.push(["notification", event.deliveryId]);
  }

  async ended(event) {
    calls.push(["ended", event.outcome, this.run.id, this.connection.id]);
    this.record.status = "sent";
    const txn = (event.output && event.output.record) || {};
    if (txn.txn_id) await this.connection.link(this.record, { kind: "invoice", qbId: txn.txn_id, name: txn.ref_number });
  }

  async failed(event) {
    calls.push(["failed", event.event]);
    this.record.status = "failed";
  }
}

// An operation with no findRecord: its record comes from the findRecord setting, by its type.
class SyncCustomer extends kit.Operation {
  static workflow = "ensure_customer";
  static slug = "sync_customer";

  input() {
    return { name: this.record.name };
  }

  async ended() {
    calls.push(["ended", this.record]);
  }
}

// A plain request: what its handlers saw, in calls.
class FindCustomer extends kit.PlainRequest {
  static operation = "customer.query";
  static slug = "find_customer";

  params() {
    return { full_name: this.record.name };
  }

  async answered(event) {
    calls.push(["answered", event.page]);
  }

  async done() {
    calls.push(["done", this.queuedRequest.lastPage]);
  }

  async failed(event) {
    calls.push(["failed", event.state]);
  }

  async retrying(event) {
    calls.push(["retrying", event.page]);
  }
}

class Events extends kit.ConnectionEvents {
  async connected() {
    const owner = await this.owner();
    calls.push(["connected", this.connection.id, owner.id, this.connection.status]);
  }
  async setupCancelled() {
    const owner = await this.owner();
    calls.push(["setupCancelled", this.connection.id, owner.id, this.connection.status]);
  }
  async stalled() {
    const owner = await this.owner();
    calls.push(["stalled", this.connection.id, owner.id, this.connection.stallReason]);
  }
  async resumed() {
    const owner = await this.owner();
    calls.push(["resumed", this.connection.id, owner.id, this.connection.stallReason]);
  }
}

// A fresh slate: settings, a new memory store, the app's tables, calls, the fake's queue and logs.
// currentAccount reads the signed-in account from request.account (the Express tests' sign-in
// sets it); authorizeQuestion is left to its default.
function reset(extra = {}) {
  kit.resetSettings();
  for (const table of Object.values(tables)) {
    table.rows.clear();
    table.next = 0;
  }
  calls.length = 0;
  fake.received = [];
  fake.responses = [];
  capture();
  const store = kit.memoryStore();
  kit.configure({
    store,
    operations: { create_invoice: CreateInvoice, sync_customer: SyncCustomer, find_customer: FindCustomer },
    connectionEvents: Events,
    currentAccount: (request) => (request && request.account) || null,
    findRecord: (type, id) => (tables[type] ? tables[type].find(id) : null),
    apiKey: API_KEY,
    baseUrl: fake.base,
    webhookSecret: SECRET,
    webhookUrl: `${WEBHOOK_URL}/`,
    ...extra,
  });
  return store;
}

// ---------------------------------------------------------------------------
// Rows

async function makeConnection(owner, { qubeId = CONN, status = "connected", name = null } = {}) {
  const made = await kit.Connection.create(owner, { name });
  return made.update({ qubeId, status });
}

async function makeRun(record, connection, { operation = "create_invoice", reference, revision = 0, state = "running", ...rest } = {}) {
  const row = await kit.settings().store.createRun({
    connectionId: connection.id,
    operation,
    recordType: record.constructor.name,
    recordId: String(record.id),
    reference: reference || `${operation}-${record.id}-${crypto.randomUUID()}`,
    state,
    revision,
    ...rest,
  });
  return kit.Run.load(row);
}

async function reload(run) {
  return kit.Run.get(run.id);
}

// ---------------------------------------------------------------------------
// Bodies: a vector's, with fields changed, signed now with the vectors' secret.

function vectorBody(name, changes = {}) {
  const found = vectors.events.find((c) => c.name === name);
  assert.ok(found, `no events case named ${name}`);
  const body = { ...JSON.parse(found.body), ...changes };
  return JSON.stringify(body);
}

// A vector's run event, made this run's (its reference and its connection's qubeId).
function runBody(name, run, changes = {}) {
  return vectorBody(name, { reference: run.reference, connection_id: run.connection.qubeId, ...changes });
}

function sign(body, secret = SECRET, t = Math.floor(Date.now() / 1000)) {
  const hex = crypto.createHmac("sha256", secret).update(`${t}.`).update(Buffer.from(body, "utf8")).digest("hex");
  return `t=${t},v1=${hex}`;
}

// One of QuBe Sync's connections, as GET /api/v2/connections lists it, made for row just now.
function qubeConnectionFor(row, changes = {}) {
  return { id: "conn-q-lost", webhook_url: row.webhookUrl(), last_connected_at: null, name: row.name, created_at: new Date().toISOString(), ...changes };
}

// A test that waits for the fake, and puts console back.
function it(nodeIt, name, fn) {
  nodeIt(name, async () => {
    await ready;
    try {
      await fn();
    } finally {
      release();
    }
  });
}

module.exports = {
  kit,
  vectors,
  SECRET,
  API_KEY,
  CONN,
  RUN,
  WEBHOOK_URL,
  fake,
  ready,
  answer,
  data,
  apiError,
  capture,
  release,
  logged,
  loggedText,
  tables,
  Account,
  Invoice,
  Customer,
  calls,
  CreateInvoice,
  SyncCustomer,
  FindCustomer,
  Events,
  reset,
  makeConnection,
  makeRun,
  reload,
  vectorBody,
  runBody,
  sign,
  qubeConnectionFor,
  it,
};
