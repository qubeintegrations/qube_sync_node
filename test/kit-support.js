"use strict";

// What the kit's tests share: a local fake of QuBe Sync's API, records kept in memory, signed
// bodies from the vectors, and a capture of what the kit logs.

const assert = require("node:assert");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const kit = require("../kit");

const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "test_vectors.json"), "utf8"));
const SECRET = vectors.secrets[0];
const API_KEY = "sk_test_kit_never_show_me";
const CONN = "0196a1c0-0000-7000-8000-00000000c001";
const RUN = "0196a1c0-0000-7000-8000-00000000f001";

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
    const body = answer.json !== undefined ? JSON.stringify(answer.json) : answer.raw || "";
    res.writeHead(answer.status || 200, { "content-type": "application/json" });
    res.end(body);
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

// ---------------------------------------------------------------------------
// Records kept in memory, saved with save() as an ORM's would be.

class Store {
  constructor() {
    this.rows = new Map();
  }
  add(fields) {
    const store = this;
    const row = {
      ...fields,
      saves: 0,
      save() {
        row.saves += 1;
        store.rows.set(String(row.id), row);
      },
    };
    this.rows.set(String(row.id), row);
    return row;
  }
  find(id) {
    return this.rows.get(String(id)) || null;
  }
}

const invoices = new Store();
const accounts = new Store();

// What each handler was called with, in order.
const calls = [];

class CreateInvoice extends kit.Operation {
  static workflow = "add_transaction";
  static slug = "create_invoice";

  static async findRecord(id) {
    return invoices.find(id);
  }

  input() {
    return kit.withoutNils({ operation: "invoice.create", params: { ref_number: kit.asString(this.record.id), memo: null } });
  }

  async notification(event) {
    calls.push(["notification", this.record.id, event.deliveryId]);
  }
  async ended(event) {
    calls.push(["ended", this.record.id, event.outcome]);
  }
  async failed(event) {
    calls.push(["failed", this.record.id, event.event]);
  }
}

class Account extends kit.ConnectionEvents {
  static async findRecord(id) {
    return accounts.find(id);
  }
  async connected(event) {
    calls.push(["connected", this.account.id, event.connectionId]);
  }
  async setupCancelled(event) {
    calls.push(["setupCancelled", this.account.id, event.revision]);
  }
  async stalled(event) {
    calls.push(["stalled", this.account.id, event.stallReason]);
  }
  async resumed(event) {
    calls.push(["resumed", this.account.id, event.revision]);
  }
}

// A fresh slate: settings, records, calls, the fake's queue and logs.
function reset(extra = {}) {
  kit.resetSettings();
  invoices.rows.clear();
  accounts.rows.clear();
  calls.length = 0;
  fake.received = [];
  fake.responses = [];
  capture();
  return kit.configure({
    operations: { create_invoice: CreateInvoice },
    connection: Account,
    apiKey: API_KEY,
    baseUrl: fake.base,
    webhookSecret: SECRET,
    webhookUrl: "https://app.example.com/webhooks/qube/",
    ...extra,
  });
}

// ---------------------------------------------------------------------------
// Bodies: a vector's, with fields changed, signed now with the vectors' secret.

function vectorBody(name, changes = {}) {
  const found = vectors.events.find((c) => c.name === name);
  assert.ok(found, `no events case named ${name}`);
  const body = { ...JSON.parse(found.body), ...changes };
  return JSON.stringify(body);
}

function sign(body, secret = SECRET, t = Math.floor(Date.now() / 1000)) {
  const hex = crypto.createHmac("sha256", secret).update(`${t}.`).update(Buffer.from(body, "utf8")).digest("hex");
  return `t=${t},v1=${hex}`;
}

// A test that waits for the fake, starts from a clean slate, and puts console back.
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
  fake,
  ready,
  answer,
  capture,
  release,
  logged,
  invoices,
  accounts,
  calls,
  CreateInvoice,
  Account,
  reset,
  vectorBody,
  sign,
  it,
};
