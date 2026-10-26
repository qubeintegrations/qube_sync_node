#!/usr/bin/env node
"use strict";

// Generates operations/ from test/fixtures/operations.json, the QuickBooks
// operations manifest qubesync.com serves at /libraries/operations.json:
//
//   operations/index.js        id -> method, path, params placement, paged, entity; the entity loaders;
//                              DIGEST, the manifest's sha256
//   operations/<entity>.js     one class per entity, a method per action
//   operations/<entity>.d.ts   its params' types, with every field's description
//   operations/types.d.ts      nested types more than one entity uses, and the method options
//   operations/client.d.ts     the Client's entity accessors
//
//   node scripts/generate-operations.js           write them (and remove stale files)
//   node scripts/generate-operations.js --check   write nothing; fail when anything is stale
//
// The output is a pure function of the manifest: a re-run writes the same bytes.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MANIFEST = path.join(ROOT, "test", "fixtures", "operations.json");
const OUT = path.join(ROOT, "operations");
const SCRIPT = "scripts/generate-operations.js";
const HEADER = `// Generated from operations.json by ${SCRIPT}: don't edit.`;
// Names the Client already has: an entity accessor may not shadow one.
const CLIENT_MEMBERS = new Set([
  "constructor", "baseUrl", "connectTimeout", "timeout", "maxRetries", "totalTimeout", "toJSON",
  "createConnection", "getConnection", "listConnections", "updateConnection", "deleteConnection",
  "regenerateOnboarding", "setPassword", "getQwc", "startRun", "getRun", "listRuns", "cancelRun",
  "runEvents", "answer", "search", "queue", "queueQbxml", "getRequest", "requestPages", "listRequests",
  "eachRequest", "discardRequest", "request",
]);
const ACTION_VERBS = { create: "Creates", update: "Updates", query: "Queries", delete: "Deletes", execute: "Runs" };

// ---------------------------------------------------------------------------
// Names

const pascal = (snake) => snake.split(/[_.]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const camel = (snake) => {
  const p = pascal(snake);
  return p[0].toLowerCase() + p.slice(1);
};
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const propertyKey = (key) => (IDENTIFIER.test(key) ? key : JSON.stringify(key));

function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Doc comments

function docLines(text) {
  return String(text)
    .replace(/\*\//g, "*\\/")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""));
}

function jsdoc(lines, indent) {
  const body = [];
  for (const line of lines) body.push(line === "" ? `${indent} *` : `${indent} * ${line}`);
  while (body.length && body[body.length - 1] === `${indent} *`) body.pop();
  if (body.length === 0) return "";
  return `${indent}/**\n${body.join("\n")}\n${indent} */\n`;
}

// ---------------------------------------------------------------------------
// Schemas to types

// An object schema's own fields, with its oneOf alternatives' fields merged in as optional ones,
// and a note naming the alternatives.
function objectShape(schema) {
  const fields = new Map();
  const add = (key, sub) => {
    if (!fields.has(key)) fields.set(key, []);
    fields.get(key).push(sub);
  };
  for (const key of Object.keys(schema.properties || {}).sort(compare)) add(key, schema.properties[key]);
  const required = new Set(schema.required || []);
  let note = null;
  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    const groups = schema.oneOf.map((alt) => {
      const keys = Object.keys(alt.properties || {}).sort(compare);
      for (const key of keys) add(key, alt.properties[key]);
      return keys.length === 1 ? `\`${keys[0]}\`` : `(${keys.map((k) => `\`${k}\``).join(", ")})`;
    });
    note = `Give exactly one of: ${groups.join(", or ")}.`;
  }
  const keys = [...fields.keys()].sort(compare);
  return { keys, fields, required, note };
}

function isObjectSchema(schema) {
  return schema && (schema.type === "object" || schema.properties || schema.oneOf);
}

class Types {
  constructor(reserved) {
    this.reserved = new Set(reserved);
    this.bySignature = new Map(); // signature -> { candidate, schema, uses: Set(entity), order }
    this.order = 0;
  }

  // A structural key: the shape and the fields' descriptions, not the object's own description
  // (that belongs to the field that holds it).
  signature(schema) {
    return JSON.stringify(this.canonical(schema, true));
  }

  canonical(schema, top) {
    if (!schema || typeof schema !== "object") return schema;
    if (isObjectSchema(schema)) {
      const shape = objectShape(schema);
      return {
        o: shape.keys.map((key) => [
          key,
          shape.required.has(key),
          shape.fields.get(key).map((sub) => [sub.description || null, this.canonical(sub, false)]),
        ]),
        n: shape.note,
      };
    }
    if (schema.type === "array") return { a: this.canonical(schema.items || {}, false) };
    void top;
    return { t: schema.type || null, e: schema.enum || null };
  }

  // Registers every nested object type reachable from a params schema, for one entity.
  collect(schema, entity, nameHint) {
    if (!schema || typeof schema !== "object") return;
    if (schema.type === "array") return this.collect(schema.items || {}, entity, nameHint);
    if (!isObjectSchema(schema)) return;
    const shape = objectShape(schema);
    if (nameHint !== null) {
      if (shape.keys.length === 0) return;
      const sig = this.signature(schema);
      let entry = this.bySignature.get(sig);
      if (!entry) {
        entry = { candidate: pascal(nameHint), schema, uses: new Set(), order: this.order++, firstEntity: entity };
        this.bySignature.set(sig, entry);
      }
      entry.uses.add(entity);
    }
    for (const key of shape.keys) for (const sub of shape.fields.get(key)) this.collect(sub, entity, key);
  }

  // Names: the most used structure takes the bare field name; the others add the first entity
  // that uses them, then a number.
  assignNames() {
    const byCandidate = new Map();
    for (const entry of this.bySignature.values()) {
      if (!byCandidate.has(entry.candidate)) byCandidate.set(entry.candidate, []);
      byCandidate.get(entry.candidate).push(entry);
    }
    const taken = new Set(this.reserved);
    for (const candidate of [...byCandidate.keys()].sort(compare)) {
      const entries = byCandidate.get(candidate).sort((a, b) => b.uses.size - a.uses.size || a.order - b.order);
      entries.forEach((entry, i) => {
        let name = i === 0 && !taken.has(candidate) ? candidate : `${candidate}${pascal(entry.firstEntity)}`;
        for (let n = 2; taken.has(name); n += 1) name = `${candidate}${pascal(entry.firstEntity)}${n}`;
        taken.add(name);
        entry.name = name;
      });
    }
  }

  nameOf(schema) {
    const entry = this.bySignature.get(this.signature(schema));
    return entry ? entry.name : null;
  }

  // Which entities each named type reaches (through other named types too), so a type a second
  // entity reaches goes in the shared file.
  reach() {
    const named = [...this.bySignature.values()];
    let changed = true;
    while (changed) {
      changed = false;
      for (const entry of named) {
        for (const child of this.children(entry.schema)) {
          for (const use of entry.uses) {
            if (!child.uses.has(use)) {
              child.uses.add(use);
              changed = true;
            }
          }
        }
      }
    }
  }

  children(schema) {
    const out = [];
    const visit = (sub) => {
      if (!sub || typeof sub !== "object") return;
      if (sub.type === "array") return visit(sub.items || {});
      if (!isObjectSchema(sub)) return;
      const entry = this.bySignature.get(this.signature(sub));
      if (entry) out.push(entry);
      else for (const key of objectShape(sub).keys) objectShape(sub).fields.get(key).forEach(visit);
    };
    const shape = objectShape(schema);
    for (const key of shape.keys) shape.fields.get(key).forEach(visit);
    return out;
  }

  // A field's TypeScript type; `refs` collects the named types it uses.
  render(schema, refs) {
    if (!schema || typeof schema !== "object") return "unknown";
    if (Array.isArray(schema.enum) && schema.enum.length > 0) {
      return schema.enum.map((v) => JSON.stringify(v)).join(" | ");
    }
    if (schema.type === "array") {
      const inner = this.render(schema.items || {}, refs);
      return /[|{]/.test(inner) ? `Array<${inner}>` : `${inner}[]`;
    }
    if (isObjectSchema(schema)) {
      const name = this.nameOf(schema);
      if (name) {
        refs.add(name);
        return name;
      }
      return "{ [key: string]: unknown }";
    }
    switch (schema.type) {
      case "string":
        return "string";
      case "integer":
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      default:
        return "unknown";
    }
  }

  // An interface body: one documented property per field.
  body(schema, refs, indent) {
    const shape = objectShape(schema);
    let out = "";
    for (const key of shape.keys) {
      const subs = shape.fields.get(key);
      const rendered = [...new Set(subs.map((sub) => this.render(sub, refs)))];
      const docs = [...new Set(subs.map((sub) => sub.description).filter(Boolean))];
      const lines = [];
      docs.forEach((d, i) => {
        if (i > 0) lines.push("");
        lines.push(...docLines(d));
      });
      const facts = facts_(subs[0]);
      if (facts) {
        if (lines.length) lines.push("");
        lines.push(facts);
      }
      out += jsdoc(lines, indent);
      const optional = shape.required.has(key) ? "" : "?";
      out += `${indent}${propertyKey(key)}${optional}: ${rendered.join(" | ")};\n`;
    }
    return out;
  }

  interfaceFor(name, schema, refs, docs) {
    const shape = objectShape(schema);
    const lines = docs ? [...docs] : [];
    if (shape.note) {
      if (lines.length) lines.push("");
      lines.push(shape.note);
    }
    return `${jsdoc(lines, "")}export interface ${name} {\n${this.body(schema, refs, "  ")}}\n`;
  }
}

function facts_(schema) {
  if (!schema || typeof schema !== "object") return null;
  const out = [];
  if (schema.format) out.push(`Format: ${schema.format}.`);
  if (typeof schema.minimum === "number") out.push(`Minimum ${schema.minimum}.`);
  if (typeof schema.maximum === "number") out.push(`Maximum ${schema.maximum}.`);
  return out.length ? out.join(" ") : null;
}

// ---------------------------------------------------------------------------
// The files

// The manifest's digest as QuBe Sync gives it (`operations_digest` in GET /workflows/types): of its
// bytes, as served.
function digestOf(bytes) {
  return `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
}

function generate(manifest, digest) {
  if (manifest.version !== 1) throw new Error(`operations.json version ${manifest.version}: this generator knows 1`);
  const operations = [...manifest.operations].sort((a, b) => compare(a.id, b.id));
  const entities = new Map();
  for (const op of operations) {
    if (!/^[a-z0-9_]+$/.test(op.entity)) throw new Error(`unexpected entity name ${op.entity}`);
    if (!op.path.startsWith("/connections/{connection_id}/") || /\{(?!connection_id\})/.test(op.path)) {
      throw new Error(`${op.id}: unexpected path ${op.path}`);
    }
    if (!["body", "query"].includes(op.params_in)) throw new Error(`${op.id}: params_in ${op.params_in}`);
    if (!entities.has(op.entity)) entities.set(op.entity, []);
    entities.get(op.entity).push(op);
  }
  const entityNames = [...entities.keys()].sort(compare);
  for (const entity of entityNames) {
    if (CLIENT_MEMBERS.has(camel(entity))) throw new Error(`entity ${entity} would shadow Client#${camel(entity)}`);
  }

  const paramsName = (op) => `${pascal(op.entity)}${pascal(op.action)}Params`;
  const reserved = ["OperationOptions", "QueuedRequest", "ClientOperations"];
  for (const entity of entityNames) reserved.push(pascal(entity));
  for (const op of operations) reserved.push(paramsName(op));
  const types = new Types(reserved);
  for (const op of operations) types.collect(op.params, op.entity, null);
  types.assignNames();
  types.reach();
  const named = [...types.bySignature.values()].sort((a, b) => compare(a.name, b.name));
  const shared = named.filter((e) => e.uses.size > 1);
  const localTo = new Map(entityNames.map((e) => [e, []]));
  for (const entry of named) if (entry.uses.size === 1) localTo.get([...entry.uses][0]).push(entry);

  const files = new Map();

  // index.js
  let index = `${HEADER}\n"use strict";\n\n`;
  index += "// The digest of the operations.json these were generated from. A workflow types document names\n";
  index += "// the one its `$operation` ids refer to (`operations_digest`).\n";
  index += `const DIGEST = ${JSON.stringify(digest)};\n\n`;
  index += "// Every operation by id: how queue() and the entity methods send it.\n";
  index += "const OPERATIONS = Object.freeze({\n";
  for (const op of operations) {
    const entry = {
      entity: op.entity,
      action: op.action,
      method: op.method,
      path: op.path.slice("/connections/{connection_id}/".length),
      paramsIn: op.params_in,
      paged: op.paged === true,
    };
    const fields = Object.entries(entry).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");
    index += `  ${JSON.stringify(op.id)}: Object.freeze({ ${fields} }),\n`;
  }
  index += "});\n\n";
  index += "// The Client's entity accessors, each loading its module on first use.\n";
  index += "const ENTITIES = Object.freeze({\n";
  for (const entity of entityNames) {
    index += `  ${camel(entity)}: () => require("./${entity}.js").${pascal(entity)},\n`;
  }
  index += "});\n\nmodule.exports = { DIGEST, OPERATIONS, ENTITIES };\n";
  files.set("index.js", index);

  // types.d.ts
  let sharedTypes = `${HEADER}\n\n`;
  sharedTypes += `/** A queued request, as the API answers it (snake_case keys). */\nexport type QueuedRequest = { [key: string]: any };\n\n`;
  sharedTypes += "/** The options every operation method takes. */\nexport interface OperationOptions {\n";
  sharedTypes += "  /** Where QuBe Sync POSTs the answered request. Required. */\n  webhookUrl: string;\n";
  sharedTypes += "  /** Default: a fresh UUID per call, reused on that call's retries. */\n  idempotencyKey?: string;\n}\n";
  for (const entry of shared) {
    const refs = new Set();
    sharedTypes += "\n" + types.interfaceFor(entry.name, entry.schema, refs, null);
  }
  files.set("types.d.ts", sharedTypes);

  // client.d.ts
  let clientTypes = `${HEADER}\n\n`;
  for (const entity of entityNames) clientTypes += `import type { ${pascal(entity)} } from "./${entity}";\n`;
  clientTypes += "\n/** The Client's entity accessors: `qube.customer.create(...)`. Each loads its module on first use. */\n";
  clientTypes += "export interface ClientOperations {\n";
  for (const entity of entityNames) clientTypes += `  readonly ${camel(entity)}: ${pascal(entity)};\n`;
  clientTypes += "}\n";
  files.set("client.d.ts", clientTypes);

  for (const entity of entityNames) {
    const ops = entities.get(entity);
    const className = pascal(entity);
    const sharedNames = new Set(shared.map((e) => e.name));

    // <entity>.d.ts
    const refs = new Set();
    let decls = "";
    for (const op of ops) {
      decls += "\n" + types.interfaceFor(paramsName(op), op.params, refs, [`The params of \`${op.id}\`: ${op.summary}.`]);
    }
    for (const entry of localTo.get(entity)) decls += "\n" + types.interfaceFor(entry.name, entry.schema, refs, null);
    let classDecl = `\n/** QuickBooks ${entity.replace(/_/g, " ")} operations: \`qube.${camel(entity)}.<action>(connectionId, params, { webhookUrl })\`. */\n`;
    classDecl += `export declare class ${className} {\n  constructor(client: Client);\n`;
    for (const op of ops) {
      const shape = objectShape(op.params);
      const optionalParams = shape.required.size === 0;
      const lines = [`${op.summary}: \`${op.method} ${op.path}\`, queued for QuickBooks.`, ""];
      lines.push(
        op.paged
          ? "QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook."
          : "The answer comes to `webhookUrl` as one webhook."
      );
      lines.push(`Params go in the ${op.params_in === "body" ? "JSON body" : "query string"}.`);
      if (shape.keys.length) {
        lines.push("");
        lines.push(
          `Fields: ${shape.keys.map((k) => `\`${k}\`${shape.required.has(k) ? " (required)" : ""}`).join(", ")}.`
        );
      }
      if (shape.note) lines.push("", shape.note);
      lines.push("", "Resolves to the queued request.", `@see ${op.docs_url}`);
      classDecl += jsdoc(lines, "  ");
      classDecl += `  ${op.action}(connectionId: string, params: ${paramsName(op)}${
        optionalParams ? " | undefined" : ""
      }, options: OperationOptions): Promise<QueuedRequest>;\n`;
    }
    classDecl += "}\n";
    let dts = `${HEADER}\n\nimport type { Client } from "../index";\n`;
    const imports = ["OperationOptions", "QueuedRequest", ...[...refs].filter((r) => sharedNames.has(r)).sort(compare)];
    dts += `import type { ${imports.join(", ")} } from "./types";\n`;
    dts += classDecl + decls;
    files.set(`${entity}.d.ts`, dts);

    // <entity>.js
    let js = `${HEADER}\n"use strict";\n\n`;
    js += `/** QuickBooks ${entity.replace(/_/g, " ")} operations. Types: ${entity}.d.ts. */\n`;
    js += `class ${className} {\n  #client;\n\n  /** @param {import("../index").Client} client */\n`;
    js += `  constructor(client) {\n    this.#client = client;\n  }\n`;
    for (const op of ops) {
      const lines = [
        `${op.summary}${op.paged ? " (answers in pages, one webhook each)" : ""}.`,
        `@param {string} connectionId`,
        `@param {import("./${entity}").${paramsName(op)}} params`,
        `@param {import("./types").OperationOptions} options`,
        `@returns {Promise<import("./types").QueuedRequest>}`,
        `@see ${op.docs_url}`,
      ];
      js += "\n" + jsdoc(lines, "  ");
      js += `  ${op.action}(connectionId, params, options) {\n`;
      js += `    return this.#client.queue(${JSON.stringify(op.id)}, connectionId, params, options);\n  }\n`;
    }
    js += `}\n\nmodule.exports = { ${className} };\n`;
    files.set(`${entity}.js`, js);
  }

  return { files, stats: { operations: operations.length, entities: entityNames.length, shared: shared.length, named: named.length } };
}

function main() {
  const check = process.argv.includes("--check");
  const bytes = fs.readFileSync(MANIFEST);
  const { files, stats } = generate(JSON.parse(bytes.toString("utf8")), digestOf(bytes));
  const existing = fs.existsSync(OUT) ? fs.readdirSync(OUT).sort(compare) : [];
  const stale = [];
  for (const [name, content] of files) {
    const file = path.join(OUT, name);
    const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    if (current !== content) stale.push(current === null ? `missing operations/${name}` : `stale operations/${name}`);
  }
  const orphans = existing.filter((name) => !files.has(name));
  for (const name of orphans) stale.push(`orphan operations/${name}`);

  if (check) {
    if (stale.length) {
      console.error(`operations/ is out of date with test/fixtures/operations.json (run node ${SCRIPT}):`);
      for (const line of stale.slice(0, 40)) console.error(`  ${line}`);
      if (stale.length > 40) console.error(`  ... and ${stale.length - 40} more`);
      process.exit(1);
    }
    console.log(`operations/ is up to date: ${stats.operations} operations, ${stats.entities} entities, ${stats.shared} shared types.`);
    return;
  }
  fs.mkdirSync(OUT, { recursive: true });
  for (const name of orphans) fs.unlinkSync(path.join(OUT, name));
  for (const [name, content] of files) fs.writeFileSync(path.join(OUT, name), content);
  console.log(
    `wrote operations/: ${stats.operations} operations, ${stats.entities} entities, ${stats.named} named types (${stats.shared} shared); ${stale.length} files changed`
  );
}

main();
