"use strict";

// The kit's settings: the only place qubesync/kit reads your app from. Your app sets them once,
// with configure(...) in its quickbooks-desktop/config file, and the kit reads them in memory
// when it needs one. A setting your app hasn't written throws the first time it's needed, naming
// that file, so nothing silently passes; the secrets and URLs fall back to the environment.

const util = require("util");

const CONFIG_FILE = "your app's quickbooks-desktop/config";

const KEYS = Object.freeze([
  "operations",
  "connection",
  "currentAccount",
  "authorizeQuestion",
  "enqueue",
  "dedupe",
  "apiKey",
  "baseUrl",
  "webhookSecret",
  "webhookUrl",
]);

const SECRET_KEYS = Object.freeze(["apiKey", "webhookSecret"]);

// Each environment variable a setting falls back to, read at first use (so a .env loaded after
// the config file still counts).
const ENV = Object.freeze({
  apiKey: "QUBE_API_KEY",
  baseUrl: "QUBE_URL",
  webhookSecret: "QUBE_WEBHOOK_SECRET",
  webhookUrl: "QUBE_WEBHOOK_URL",
});

const DEFAULT_BASE_URL = "https://qubesync.com";

// "connection" is the connection's own slug in webhook URLs (ConnectionEvents), never an
// operation's.
const CONNECTION_SLUG = "connection";

let values = {};
let changes = 0; // bumped by configure, so client() knows to make a new Client

function unset(key, how) {
  return new Error(
    `QuBe Sync: the ${key} setting isn't set. Set it with configure({ ${key} }) in ${CONFIG_FILE}${how ? `: ${how}` : ""}.`
  );
}

function fromEnv(key) {
  const name = ENV[key];
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `QuBe Sync: ${name} is not set. Set it in the environment, or ${key} with configure(...) in ${CONFIG_FILE}.`
    );
  }
  return value;
}

function isSubclass(value, Base) {
  return typeof value === "function" && (value === Base || value.prototype instanceof Base);
}

// The operations as a Map, slug to class, checked: each is an Operation whose static slug is its
// key, so the webhook URL it writes is the one the endpoint finds it by.
function operationMap(operations) {
  const { Operation } = require("./operation");
  let entries;
  if (operations instanceof Map) entries = [...operations.entries()];
  else if (operations && typeof operations === "object" && !Array.isArray(operations)) entries = Object.entries(operations);
  else throw new TypeError("QuBe Sync: operations must be an object (or Map) of slug to operation class");

  const map = new Map();
  for (const [slug, OperationClass] of entries) {
    if (slug === CONNECTION_SLUG) {
      throw new TypeError(
        `QuBe Sync: "${CONNECTION_SLUG}" is the connection's own slug in webhook URLs: set the connection class with the connection setting, and give the operation another slug`
      );
    }
    if (!isSubclass(OperationClass, Operation) || OperationClass === Operation) {
      throw new TypeError(`QuBe Sync: operations.${slug} must be a class that extends Operation (from qubesync/kit)`);
    }
    if (OperationClass.slug !== slug) {
      throw new TypeError(
        `QuBe Sync: operations.${slug} is ${OperationClass.name}, whose static slug is ${JSON.stringify(OperationClass.slug)}: they must match, since its webhook URL names its slug`
      );
    }
    if (typeof OperationClass.workflow !== "string" || OperationClass.workflow === "") {
      throw new TypeError(`QuBe Sync: ${OperationClass.name} needs a static workflow (the workflow it starts)`);
    }
    map.set(slug, OperationClass);
  }
  return map;
}

function checkFunction(key, value) {
  if (typeof value !== "function") throw new TypeError(`QuBe Sync: ${key} must be a function`);
  return value;
}

function checkString(key, value) {
  if (typeof value !== "string" || value === "") throw new TypeError(`QuBe Sync: ${key} must be a non-empty string`);
  return value;
}

const CHECKS = {
  operations: operationMap,
  connection(value) {
    const { ConnectionEvents } = require("./connection-events");
    if (!isSubclass(value, ConnectionEvents)) {
      throw new TypeError("QuBe Sync: connection must be a class that extends ConnectionEvents (from qubesync/kit)");
    }
    return value;
  },
  currentAccount: (value) => checkFunction("currentAccount", value),
  authorizeQuestion: (value) => checkFunction("authorizeQuestion", value),
  enqueue: (value) => checkFunction("enqueue", value),
  dedupe(value) {
    if (!value || typeof value.seen !== "function" || typeof value.remember !== "function") {
      throw new TypeError("QuBe Sync: dedupe must be an object with seen(key) and remember(key)");
    }
    return value;
  },
  apiKey: (value) => checkString("apiKey", value),
  baseUrl: (value) => checkString("baseUrl", value),
  webhookSecret(value) {
    const list = Array.isArray(value) ? value : [value];
    if (list.length === 0 || !list.every((secret) => typeof secret === "string" && secret !== "")) {
      throw new TypeError("QuBe Sync: webhookSecret must be a non-empty string, or a list of them while one rotates");
    }
    return value;
  },
  webhookUrl: (value) => checkString("webhookUrl", value),
};

// ---------------------------------------------------------------------------
// The defaults for enqueue and dedupe: in this process, each with the warning it needs.

let warnedEnqueue = false;
let warnedDedupe = false;
let lastJob = Promise.resolve();

// Runs the jobs in this process, after the response, one at a time in the order they came, until
// your app sets enqueue to a durable queue: a restart loses the jobs it hasn't run, so do that
// before production. QuBe Sync had its 2xx when a job was enqueued, so it won't send it again.
function inProcessEnqueue(job) {
  if (!warnedEnqueue) {
    warnedEnqueue = true;
    console.warn(
      "QuBe Sync: running webhook jobs in this process, after the response (the enqueue setting isn't set). " +
        `A restart loses the ones not yet run: before production, set enqueue in ${CONFIG_FILE} to a durable queue whose worker calls run(job).`
    );
  }
  const { run } = require("./job");
  lastJob = lastJob
    .then(() => new Promise((resolve) => setImmediate(resolve)))
    .then(() => run(job))
    .catch((err) => {
      console.error(`QuBe Sync: the ${job.operation} job for ${job.recordId} failed:`, err);
    });
}

// The notification delivery ids already taken, in this process's memory, until your app sets
// dedupe to its database or Redis: a retry that reaches another process, or comes after a
// restart, is taken again.
const delivered = new Set();
const inMemoryDedupe = Object.freeze({
  seen(key) {
    if (!warnedDedupe) {
      warnedDedupe = true;
      console.warn(
        "QuBe Sync: notification delivery ids are kept in this process's memory (the dedupe setting isn't set). " +
          `A retry after a restart, or one another process takes, is handled again: set dedupe in ${CONFIG_FILE} to your database or Redis.`
      );
    }
    return delivered.has(key);
  },
  remember(key) {
    delivered.add(key);
  },
});

// Until your app writes authorizeQuestion, every answer and search is refused, with a 403 and
// this warning, since it's a setup mistake to see: the record's id comes from the URL, so it's all
// that keeps one customer's users off another's records.
function refuseUnauthorized(request, record, operation) {
  const id = record && record.id;
  console.warn(
    `QuBe Sync: refused an answer or search for ${operation} ${id}: the authorizeQuestion setting isn't set. ` +
      `Set it with configure({ authorizeQuestion }) in ${CONFIG_FILE}: (req, record) => true when the signed-in user may act on record.`
  );
  return false;
}

// ---------------------------------------------------------------------------

class Settings {
  /** slug → operation class, as a Map. */
  get operations() {
    if (!values.operations) throw unset("operations", "each operation class by its slug, { create_invoice: CreateInvoice }");
    return values.operations;
  }

  /** The connection class (extends ConnectionEvents). */
  get connection() {
    if (!values.connection) throw unset("connection", "the class that extends ConnectionEvents");
    return values.connection;
  }

  /** (req) → the signed-in customer's account. */
  get currentAccount() {
    if (!values.currentAccount) throw unset("currentAccount", "(req) => the signed-in customer's account");
    return values.currentAccount;
  }

  /** (req, record, operation) → true when the signed-in user may answer or search record's question. */
  get authorizeQuestion() {
    return values.authorizeQuestion || refuseUnauthorized;
  }

  get enqueue() {
    return values.enqueue || inProcessEnqueue;
  }

  get dedupe() {
    return values.dedupe || inMemoryDedupe;
  }

  get apiKey() {
    return values.apiKey || fromEnv("apiKey");
  }

  get baseUrl() {
    return values.baseUrl || process.env[ENV.baseUrl] || DEFAULT_BASE_URL;
  }

  get webhookSecret() {
    return values.webhookSecret || fromEnv("webhookSecret");
  }

  get webhookUrl() {
    return values.webhookUrl || fromEnv("webhookUrl");
  }

  /** The class the slug in a webhook URL names: "connection" or an operation's; null for any other. */
  classFor(slug) {
    if (slug === CONNECTION_SLUG) return this.connection;
    const operations = this.operations;
    return operations.has(slug) ? operations.get(slug) : null;
  }

  /** Which settings your app has set (true) and which fall back to a default or the environment. */
  describe() {
    const described = {};
    for (const key of KEYS) {
      if (SECRET_KEYS.includes(key)) described[key] = values[key] ? "[set]" : process.env[ENV[key]] ? "[from env]" : "[unset]";
      else if (key === "operations") described[key] = values.operations ? [...values.operations.keys()] : "[unset]";
      else if (key === "connection") described[key] = values.connection ? values.connection.name : "[unset]";
      else if (key === "baseUrl" || key === "webhookUrl") {
        described[key] = values[key] || process.env[ENV[key]] || (key === "baseUrl" ? DEFAULT_BASE_URL : "[unset]");
      } else described[key] = values[key] ? "[set]" : "[default]";
    }
    return described;
  }

  // The secrets never show: console.log(settings()) and JSON.stringify show only what's set.
  toJSON() {
    return this.describe();
  }

  [util.inspect.custom]() {
    return `Settings ${util.inspect(this.describe())}`;
  }
}

const instance = new Settings();

/**
 * Sets the kit's settings, once, in your app's quickbooks-desktop/config: each key replaces the
 * one set before, and a key left out keeps it. Returns the settings.
 */
function configure(options) {
  if (options instanceof Settings) return instance;
  if (!options || typeof options !== "object") throw new TypeError("QuBe Sync: configure takes an object of settings");
  const next = { ...values };
  for (const key of Object.keys(options)) {
    if (!KEYS.includes(key)) {
      throw new TypeError(`QuBe Sync: configure doesn't know the setting ${JSON.stringify(key)}; the settings are ${KEYS.join(", ")}`);
    }
    const value = options[key];
    next[key] = value === undefined || value === null ? undefined : CHECKS[key](value);
  }
  values = next;
  changes += 1;
  return instance;
}

/** The kit's settings, as configure set them. */
function settings() {
  return instance;
}

/** Forgets every setting (for tests). */
function resetSettings() {
  values = {};
  changes += 1;
}

function settingsVersion() {
  return changes;
}

module.exports = {
  CONFIG_FILE,
  CONNECTION_SLUG,
  SETTINGS: KEYS,
  Settings,
  configure,
  settings,
  resetSettings,
  settingsVersion,
  refuseUnauthorized,
};
