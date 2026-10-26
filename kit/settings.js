"use strict";

// The kit's settings: the only place qubesync/kit reads your app from. Your app sets them once,
// with configure(...) in its quickbooks-desktop/config file, and the kit reads them in memory
// when it needs one. A setting your app hasn't written throws NotConfigured the first time it's
// needed, naming that file, so nothing silently passes; the secrets and URLs fall back to the
// environment.

const util = require("util");

const { NotConfigured } = require("./errors");
const { missingStoreMethods } = require("./store");

const CONFIG_FILE = "your app's quickbooks-desktop/config";

const KEYS = Object.freeze([
  "store",
  "operations",
  "connectionEvents",
  "currentAccount",
  "authorizeQuestion",
  "recordType",
  "findRecord",
  "enqueue",
  "jobAttempts",
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
const DEFAULT_JOB_ATTEMPTS = 10;

let values = {};
let changes = 0; // bumped by configure, so client() knows to make a new Client

function notConfigured(key, what) {
  return new NotConfigured(`QuBe Sync: ${key} isn't set yet. Set it (${what}) with configure({ ${key} }) in ${CONFIG_FILE}.`);
}

function fromEnv(key) {
  const name = ENV[key];
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new NotConfigured(`QuBe Sync: ${key} isn't set yet. Set ${name} in the environment, or ${key} with configure(...) in ${CONFIG_FILE}.`);
  }
  return value;
}

function isSubclass(value, Base) {
  return typeof value === "function" && (value === Base || value.prototype instanceof Base);
}

// The operations as a Map, slug to class, checked: each is an Operation whose static slug is its
// key, since a run row keeps the slug and the job finds the class by it. A fixed list, so a class
// is never looked up from anything a request says.
function operationMap(operations) {
  const { Operation } = require("./operation");
  let entries;
  if (operations instanceof Map) entries = [...operations.entries()];
  else if (operations && typeof operations === "object" && !Array.isArray(operations)) entries = Object.entries(operations);
  else throw new TypeError("QuBe Sync: operations must be an object (or Map) of slug to operation class");

  const map = new Map();
  for (const [slug, OperationClass] of entries) {
    if (!isSubclass(OperationClass, Operation) || OperationClass === Operation) {
      throw new TypeError(`QuBe Sync: operations.${slug} must be a class that extends Operation (from qubesync/kit)`);
    }
    if (OperationClass.slug !== slug) {
      throw new TypeError(
        `QuBe Sync: operations.${slug} is ${OperationClass.name}, whose static slug is ${JSON.stringify(OperationClass.slug)}: they must match, since each run keeps its slug`
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
  if (typeof value !== "function") throw new TypeError(`QuBe Sync: ${key} must be a function, in ${CONFIG_FILE}`);
  return value;
}

function checkString(key, value) {
  if (typeof value !== "string" || value === "") throw new TypeError(`QuBe Sync: ${key} must be a non-empty string, in ${CONFIG_FILE}`);
  return value;
}

const CHECKS = {
  store(value) {
    const missing = missingStoreMethods(value);
    if (missing.length > 0) {
      throw new TypeError(`QuBe Sync: store is missing ${missing.join(", ")} (see qubesync/kit's Store, and memoryStore() for one)`);
    }
    return value;
  },
  operations: operationMap,
  connectionEvents(value) {
    const { ConnectionEvents } = require("./connection-events");
    if (!isSubclass(value, ConnectionEvents)) {
      throw new TypeError("QuBe Sync: connectionEvents must be a class that extends ConnectionEvents (from qubesync/kit)");
    }
    return value;
  },
  currentAccount: (value) => checkFunction("currentAccount", value),
  authorizeQuestion: (value) => checkFunction("authorizeQuestion", value),
  recordType: (value) => checkFunction("recordType", value),
  findRecord: (value) => checkFunction("findRecord", value),
  enqueue: (value) => checkFunction("enqueue", value),
  jobAttempts(value) {
    if (!Number.isInteger(value) || value < 1) throw new TypeError(`QuBe Sync: jobAttempts is a whole number of 1 or more, in ${CONFIG_FILE}`);
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
// The defaults

// The type a record's rows keep (a run's recordType, a connection's ownerType, a QuickBooks id's
// recordType): its class's name, as an ORM's model instance has it. A plain object (Prisma's, or
// a query builder's) has none to give, so the app sets recordType for those.
function classNameOf(record) {
  const made = record !== null && typeof record === "object" ? record.constructor : null;
  if (typeof made !== "function" || made === Object || !made.name) {
    throw new NotConfigured(
      `QuBe Sync: a record with no class of its own can't name its type. Set recordType with configure({ recordType: (record) => "Invoice" }) in ${CONFIG_FILE}.`
    );
  }
  return made.name;
}

// Until your app sets findRecord, nothing can be found by type and id: an operation needs its own
// static findRecord, and findLinked and a connection's owner() throw.
function findRecordUnset(type, id) {
  throw notConfigured("findRecord", `(type, id) => your record of that type, here a ${type} ${id}`);
}

// Whether the signed-in user may answer or search a run's question, when your app hasn't said:
// the signed-in account (currentAccount) owns the run's connection. Compared by type and id, as
// the connection keeps them, so a null account, or one with no id yet, never matches.
async function ownerAnswers(request, record, run) {
  const account = await instance.currentAccount(request);
  if (!hasId(account)) return false;
  const { recordKey } = require("./records");
  const [type, id] = recordKey(account);
  return ownsConnection(type, id, run.connection);
}

function hasId(account) {
  return account !== null && account !== undefined && account.id !== null && account.id !== undefined && account.id !== "";
}

function ownsConnection(type, id, connection) {
  return Boolean(connection) && type === connection.ownerType && id === String(connection.ownerId);
}

let warnedEnqueue = false;

// Runs each delivery in this process, after the response (job(), with its retries), until your
// app sets enqueue to a durable queue: a restart loses the ones not yet run, so do that before
// production. QuBe Sync had its 2xx when a delivery was enqueued, so it won't send it again.
function inProcessEnqueue(delivery) {
  if (!warnedEnqueue) {
    warnedEnqueue = true;
    console.warn(
      "QuBe Sync: running webhook deliveries in this process, after the response (the enqueue setting isn't set). " +
        `A restart loses the ones not yet run: before production, set enqueue in ${CONFIG_FILE} to a durable queue whose worker calls run(delivery).`
    );
  }
  const { job } = require("./job");
  setImmediate(() => {
    job(delivery).catch(() => {
      // job logged it when it gave up
    });
  });
}

// ---------------------------------------------------------------------------

class Settings {
  /** Where the kit keeps connections, runs, notifications and QuickBooks ids (a Store). */
  get store() {
    if (!values.store) throw notConfigured("store", "your app's store; memoryStore() for tests");
    return values.store;
  }

  /** slug → operation class, as a Map. */
  get operations() {
    if (!values.operations) throw notConfigured("operations", "each operation class by its slug, { create_invoice: CreateInvoice }");
    return values.operations;
  }

  /** Your class for a connection's events (extends ConnectionEvents). */
  get connectionEvents() {
    if (!values.connectionEvents) throw notConfigured("connectionEvents", "your class that extends ConnectionEvents");
    return values.connectionEvents;
  }

  /** (req) → the signed-in customer's account, which owns its connections. */
  get currentAccount() {
    if (!values.currentAccount) throw notConfigured("currentAccount", "(req) => the signed-in customer's account");
    return values.currentAccount;
  }

  /** (req, record, run) → true when the signed-in user may answer or search the run's question. */
  get authorizeQuestion() {
    return values.authorizeQuestion || ownerAnswers;
  }

  /** (record) → the type its rows keep. */
  get recordType() {
    return values.recordType || classNameOf;
  }

  /** (type, id) → your record of that type, or null. */
  get findRecord() {
    return values.findRecord || findRecordUnset;
  }

  /** (delivery) → hands { kind, id, body } to a queue. */
  get enqueue() {
    return values.enqueue || inProcessEnqueue;
  }

  /** How many times job() runs a delivery before it gives up. */
  get jobAttempts() {
    return values.jobAttempts || DEFAULT_JOB_ATTEMPTS;
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

  /** The base of every webhook URL, without a trailing slash. */
  get webhookUrl() {
    return (values.webhookUrl || fromEnv("webhookUrl")).replace(/\/+$/, "");
  }

  /** Whether your app set key, rather than leaving it to a default or the environment. */
  isSet(key) {
    return values[key] !== undefined;
  }

  /** The operation class for a slug, or null when none of your operations has it. */
  operationClass(slug) {
    const operations = this.operations;
    return typeof slug === "string" && operations.has(slug) ? operations.get(slug) : null;
  }

  /** Which settings your app has set and which fall back to a default or the environment. */
  describe() {
    const described = {};
    for (const key of KEYS) {
      if (SECRET_KEYS.includes(key)) described[key] = values[key] ? "[set]" : process.env[ENV[key]] ? "[from env]" : "[unset]";
      else if (key === "operations") described[key] = values.operations ? [...values.operations.keys()] : "[unset]";
      else if (key === "connectionEvents") described[key] = values.connectionEvents ? values.connectionEvents.name : "[unset]";
      else if (key === "jobAttempts") described[key] = this.jobAttempts;
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
  SETTINGS: KEYS,
  DEFAULT_JOB_ATTEMPTS,
  Settings,
  configure,
  settings,
  resetSettings,
  settingsVersion,
};
