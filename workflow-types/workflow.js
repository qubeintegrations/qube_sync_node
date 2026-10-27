"use strict";

// One workflow of a types document, as the renderers read it: its names, its inputs and, when its
// input is discriminated (an object with oneOf and a discriminator at the top), its branches, each
// with the discriminator fixed.

const { OPERATIONS } = require("../operations/index.js");

/** A document this version can't render: not a workflow types document, or a name QuBe Sync doesn't allow. */
class WorkflowTypesError extends Error {
  constructor(message) {
    super(message);
    this.name = "WorkflowTypesError";
  }
}

// Workflow keys, input names and branch titles, as QuBe Sync allows them.
const NAME = /^[a-z][a-z0-9_]{0,63}$/;
const OPERATION = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;

// Words JavaScript doesn't take as a name (a const, a parameter): a workflow or a positional input
// named after one takes a trailing underscore. As property names (a method, an option) they're fine.
const RESERVED = new Set([
  "arguments", "await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do",
  "else", "enum", "eval", "export", "extends", "false", "finally", "for", "function", "if", "implements", "import", "in",
  "instanceof", "interface", "let", "new", "null", "package", "private", "protected", "public",
  "return", "static", "super", "switch", "this", "throw", "true", "try", "typeof", "undefined", "var", "void", "while",
  "with", "yield",
]);
// The names the generated module defines, and the ones CommonJS gives it: a workflow named after
// one takes a trailing underscore, and so does a positional input (it would hide the helper).
const MODULE_NAMES = new Set(["setClient", "client", "connectionId", "compact", "run", "defaultClient", "module", "exports", "require"]);
// Methods every object has: a branch named after one takes a trailing underscore, as `start` does.
const OBJECT_MEMBERS = new Set([
  "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf",
]);
// A start's own options: an input named after one takes a trailing underscore in its methods
// (`version_`), and keeps its name in the input.
const RUN_OPTIONS = new Set(["reference", "webhookUrl", "version", "client"]);
// A start's own parameters, which a positional input's name mustn't take.
const RUN_PARAMS = new Set(["connection", "options"]);

// ---------------------------------------------------------------------------
// Names, as scripts/generate-operations.js makes them

const pascal = (snake) => snake.split(/[_.]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const camel = (snake) => {
  const p = pascal(snake);
  return p[0].toLowerCase() + p.slice(1);
};

function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function checkedName(name, what) {
  if (typeof name !== "string" || !NAME.test(name)) {
    throw new WorkflowTypesError(`${what} isn't a name QuBe Sync allows: ${JSON.stringify(name)}`);
  }
  return name;
}

// A $operation reference's id, or null when schema isn't one.
function operation(schema) {
  const id = isPlainObject(schema) ? schema.$operation : undefined;
  if (typeof id !== "string") return null;
  if (!OPERATION.test(id)) throw new WorkflowTypesError(`not an operation id: ${JSON.stringify(id)}`);
  return id;
}

// An operation id's entry in this version's operations/: its entity accessor (`receivePayment`),
// the module and params type its .d.ts defines, or null for one it doesn't know.
function knownOperation(id) {
  const entry = Object.prototype.hasOwnProperty.call(OPERATIONS, id) ? OPERATIONS[id] : null;
  if (!entry) return null;
  return {
    id,
    accessor: camel(entry.entity),
    module: `qubesync/operations/${entry.entity}`,
    params: `${pascal(entry.entity)}${pascal(entry.action)}Params`,
    method: `client.${camel(entry.entity)}.${entry.action}`,
  };
}

// The fields a $operation reference says its workflow sets itself (`set_by_workflow`), sorted.
function setByWorkflow(schema) {
  const list = Array.isArray(schema.set_by_workflow) ? schema.set_by_workflow : [];
  return [...new Set(list.filter((field) => typeof field === "string"))].sort(compare);
}

// An object schema discriminated by one of its properties: its oneOf branches.
function discriminated(schema) {
  return (
    isPlainObject(schema) &&
    Array.isArray(schema.oneOf) &&
    schema.oneOf.length > 0 &&
    isPlainObject(schema.discriminator) &&
    typeof schema.discriminator.propertyName === "string"
  );
}

// A discriminated object's branches, as { title, properties (merged over the base's), required },
// sorted by title.
function branchSchemas(schema) {
  const base = isPlainObject(schema.properties) ? schema.properties : {};
  return schema.oneOf
    .map((branch) => {
      const own = isPlainObject(branch) && isPlainObject(branch.properties) ? branch.properties : {};
      const required = new Set([...asList(schema.required), ...asList(isPlainObject(branch) ? branch.required : null)]);
      return { title: String(isPlainObject(branch) ? branch.title : ""), properties: { ...base, ...own }, required };
    })
    .sort((a, b) => compare(a.title, b.title));
}

// The value a branch fixes its discriminator to: its const, or its enum's first.
function fixedValue(properties, discriminator) {
  const fixed = isPlainObject(properties[discriminator]) ? properties[discriminator] : {};
  if (Object.prototype.hasOwnProperty.call(fixed, "const")) return fixed.const;
  return Array.isArray(fixed.enum) ? fixed.enum[0] : undefined;
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

// The body first (positional), then the other inputs as options, sorted by name. An option named
// after one of a start's own (reference, webhookUrl, version, client) takes a trailing underscore
// in the methods, and keeps its name in the input; so does a positional name that isn't one a
// parameter can take. The .d.ts names its parameters the same. Each param is { input, name,
// positional }.
function paramsFor(inputs, body, avoid) {
  const taken = new Set();
  const ordered = body ? [body, ...inputs.filter((input) => input !== body)] : inputs;
  return ordered.map((input) => {
    const positional = input === body;
    let name = camel(input.name);
    const clash = positional
      ? (n) => RESERVED.has(n) || MODULE_NAMES.has(n) || RUN_PARAMS.has(n) || avoid.has(n)
      : (n) => RUN_OPTIONS.has(n) || taken.has(n);
    while (clash(name) || taken.has(name)) name = `${name}_`;
    taken.add(name);
    return { input, name, positional };
  });
}

class Workflow {
  constructor(key, entry) {
    this.key = checkedName(key, "workflow key");
    this.type = pascal(key);
    const accessor = camel(key);
    this.accessor = RESERVED.has(accessor) || MODULE_NAMES.has(accessor) ? `${accessor}_` : accessor;
    const source = isPlainObject(entry) ? entry : {};
    this.name = typeof source.name === "string" ? source.name : "";
    this.description = typeof source.description === "string" ? source.description : "";
    this.version = Number.isInteger(source.version) ? source.version : null;
    this.draft = source.draft === true;
    this.schema = isPlainObject(source.input) ? source.input : {};
    const schema = this.schema;
    this.discriminator = discriminated(schema) ? schema.discriminator.propertyName : null;
    if (this.discriminator !== null) {
      checkedName(this.discriminator, `${key}'s discriminator`);
      this.inputs = [];
      // The inputs that are an operation body in at least one branch. Only when there's one is it
      // positional, in every branch, so every branch's method takes the same shape.
      const bodies = new Set();
      for (const branch of schema.oneOf) {
        const properties = isPlainObject(branch) && isPlainObject(branch.properties) ? branch.properties : {};
        for (const [name, sub] of Object.entries(properties)) if (operation(sub)) bodies.add(name);
      }
      for (const [name, sub] of Object.entries(isPlainObject(schema.properties) ? schema.properties : {})) {
        if (operation(sub)) bodies.add(name);
      }
      this.bodyName = bodies.size === 1 ? [...bodies][0] : null;
      this.branches = schema.oneOf.map((branch) => this.#branchFor(branch)).sort((a, b) => compare(a.title, b.title));
      const methods = new Map();
      for (const branch of this.branches) {
        for (const method of [branch.method, branch.builder]) {
          if (methods.has(method)) throw new WorkflowTypesError(`${key}'s branches give two methods named ${method}`);
          methods.set(method, true);
        }
      }
    } else {
      this.bodyName = null;
      this.inputs = inputsOf(schema.properties, schema.required, key);
      this.branches = [];
    }
  }

  get discriminated() {
    return this.discriminator !== null;
  }

  // The type names the qube integration kit refers to: <Key>Input, and <Key><Title>Input per branch.
  get inputType() {
    return `${this.type}Input`;
  }

  #branchFor(branch) {
    const title = checkedName(isPlainObject(branch) ? branch.title : undefined, `a branch title in ${this.key}`);
    const base = isPlainObject(this.schema.properties) ? this.schema.properties : {};
    const own = isPlainObject(branch.properties) ? branch.properties : {};
    const properties = { ...base, ...own };
    const value = fixedValue(properties, this.discriminator);
    if (value === undefined || value === null) {
      throw new WorkflowTypesError(`${this.key}'s ${title} branch doesn't fix ${this.discriminator} to a value`);
    }
    const required = [...asList(this.schema.required), ...asList(branch.required)];
    const rest = Object.fromEntries(Object.entries(properties).filter(([name]) => name !== this.discriminator));
    const inputs = inputsOf(rest, required, this.key);
    const body = inputs.find((input) => input.name === this.bodyName) || null;
    let method = camel(title);
    if (OBJECT_MEMBERS.has(method) || method === "start") method = `${method}_`;
    const type = `${this.type}${pascal(title)}`;
    return { title, method, builder: `${method}Input`, value, inputs, body, inputType: `${type}Input`, optionsType: `${type}Options` };
  }
}

function inputsOf(properties, required, key) {
  const must = new Set(asList(required));
  return Object.keys(isPlainObject(properties) ? properties : {})
    .sort(compare)
    .map((name) => ({
      name: checkedName(name, `an input of ${key}`),
      schema: isPlainObject(properties[name]) ? properties[name] : {},
      required: must.has(name),
    }));
}

module.exports = {
  Workflow,
  WorkflowTypesError,
  NAME,
  pascal,
  camel,
  compare,
  isPlainObject,
  operation,
  knownOperation,
  setByWorkflow,
  discriminated,
  branchSchemas,
  fixedValue,
  paramsFor,
  checkedName,
};
