"use strict";

// Writes the .d.ts half of a render: an interface per workflow (its start methods), an input type
// per branch (`AddTransactionInvoiceInput`, or `<Key>Input` for a workflow without branches) and
// their union (`AddTransactionInput`), the options each method takes, each operation body as that
// operation's params (`InvoiceCreateParams`, from qubesync/operations/invoice), and a nested
// discriminated object (an `adds` entry) as a union of an interface per branch. JSON Schema maps
// to TypeScript as scripts/generate-operations.js maps it.

const W = require("./workflow");
const { doc, intro, inputText, sentence } = require("./text");

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const propertyKey = (key) => (IDENTIFIER.test(key) ? key : JSON.stringify(key));
const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
// The names every render declares or imports.
const COMMON = ["Connection", "StartOptions", "Client", "ApiObject"];
const FREE_OBJECT = "{ [key: string]: unknown }";
const UNKNOWN_BODY = "Record<string, unknown>";

class DtsRenderer {
  constructor(workflows, { header }) {
    this.workflows = workflows;
    this.header = header;
    this.taken = new Set(COMMON);
    this.imports = new Map(); // module -> Set of type names
    // The names the kit refers to, and each method's interfaces, first: they're exact.
    const fixed = new Map();
    const claimFixed = (name, key) => {
      if (fixed.has(name) && fixed.get(name) !== key) {
        throw new W.WorkflowTypesError(`workflows ${fixed.get(name)} and ${key} would share the type name ${name}`);
      }
      if (fixed.has(name) || COMMON.includes(name)) throw new W.WorkflowTypesError(`${key} would declare ${name} twice`);
      fixed.set(name, key);
      this.taken.add(name);
    };
    for (const workflow of workflows) {
      claimFixed(`${workflow.type}Workflow`, workflow.key);
      claimFixed(workflow.inputType, workflow.key);
      if (workflow.discriminated) {
        for (const branch of workflow.branches) {
          claimFixed(branch.inputType, workflow.key);
          claimFixed(branch.optionsType, workflow.key);
        }
      } else {
        claimFixed(`${workflow.type}Options`, workflow.key);
      }
    }
    // Then every operation params type a body may import, so a nested type never takes one's name.
    for (const workflow of workflows) {
      for (const id of operationIds(workflow.schema)) {
        const known = W.knownOperation(id);
        if (known) this.taken.add(known.params);
      }
    }
  }

  render() {
    const blocks = this.workflows.map((workflow) => this.#workflow(workflow));
    const lines = [...this.header, ""];
    lines.push('import type { ApiObject, Client } from "qubesync";');
    for (const module of [...this.imports.keys()].sort(W.compare)) {
      lines.push(`import type { ${[...this.imports.get(module)].sort(W.compare).join(", ")} } from "${module}";`);
    }
    lines.push("");
    lines.push(...topDoc());
    lines.push("");
    lines.push(...common());
    for (const block of blocks) lines.push("", ...block);
    lines.push("");
    return lines.join("\n");
  }

  #workflow(workflow) {
    this.current = workflow;
    this.aliases = new Map();
    this.memo = new Map();
    this.prefix = null;
    const accessor = workflow.accessor;
    const types = [];
    const methods = [];

    if (workflow.discriminated) {
      for (const branch of workflow.branches) {
        // A body's own type is named for its branch.
        this.prefix = branch.title;
        const params = W.paramsFor(branch.inputs, branch.body, this.avoid());
        const positional = params.filter((p) => p.positional);
        const options = params.filter((p) => !p.positional);
        const value = JSON.stringify(branch.value);
        const fields = [{ key: workflow.discriminator, type: literal(branch.value), required: true, doc: [] }].concat(
          branch.inputs.map((input) => this.#inputField(input))
        );
        types.push(
          ...this.#interface(branch.inputType, fields, [
            `${workflow.key}'s input with \`${workflow.discriminator}\` ${value}: what \`${accessor}.${branch.builder}\` returns, for \`${accessor}.start\` or a qubesync/kit Operation's input.`,
          ]),
          ""
        );
        if (options.length) {
          types.push(...this.#optionsInterface(branch.optionsType, options, `\`${accessor}.${branch.method}\` and \`${branch.builder}\``), "");
        }
        const optionsType = options.length ? `${branch.optionsType} & StartOptions` : "StartOptions";
        const startTags = [connectionTag(), ...this.#tags(positional), ...this.#tags(options, "options."), ...runTags(), returnsTag(), ...seeTags(branch.inputs)];
        methods.push(
          "",
          ...doc([`Starts ${workflow.key} with \`${workflow.discriminator}\` ${value}.`, workflow.description], startTags, "  "),
          `  ${branch.method}(${["connection: Connection", ...this.#signature(positional), `options: ${optionsType}`].join(", ")}): Promise<ApiObject>;`
        );
        const builderArgs = [...this.#signature(positional)];
        if (options.length) builderArgs.push(`options${options.every((p) => !p.input.required) ? "?" : ""}: ${branch.optionsType}`);
        methods.push(
          "",
          ...doc(
            [`${workflow.key}'s input with \`${workflow.discriminator}\` ${value}, without its null and undefined values: for start, or a qubesync/kit Operation's input.`],
            [...this.#tags(positional), ...this.#tags(options, "options."), "@returns the input", ...seeTags(branch.inputs)],
            "  "
          ),
          `  ${branch.builder}(${builderArgs.join(", ")}): ${branch.inputType};`
        );
      }
      this.prefix = null;
      const names = workflow.branches.map((branch) => branch.inputType);
      types.push(...doc([`${workflow.key}'s input: any of its branches'.`], [], ""), `export type ${workflow.inputType} = ${names.join(" | ")};`);
      methods.push(
        "",
        ...doc(
          [`Starts ${workflow.key} with any of its inputs: an object as ${workflow.branches.map((b) => b.builder).join(" or ")} returns it.`],
          [connectionTag(), "@param input the input", ...runTags(), returnsTag()],
          "  "
        ),
        `  start(connection: Connection, input: ${workflow.inputType}, options: StartOptions): Promise<ApiObject>;`
      );
    } else {
      const params = W.paramsFor(workflow.inputs, null, this.avoid());
      const optionsType = `${workflow.type}Options`;
      const fields = workflow.inputs.map((input) => this.#inputField(input));
      types.push(
        ...this.#interface(workflow.inputType, fields, [
          `${workflow.key}'s input: what \`${accessor}.input\` returns, for \`${accessor}.start\` or a qubesync/kit Operation's input.`,
        ])
      );
      if (params.length) types.push("", ...this.#optionsInterface(optionsType, params, `\`${accessor}.start\` and \`input\``));
      methods.push(
        "",
        ...doc(
          [`Starts ${workflow.key}.`, workflow.description],
          [connectionTag(), ...this.#tags(params, "options."), ...runTags(), returnsTag(), ...seeTags(workflow.inputs)],
          "  "
        ),
        `  start(connection: Connection, options: ${params.length ? `${optionsType} & StartOptions` : "StartOptions"}): Promise<ApiObject>;`,
        "",
        ...doc(
          [`${workflow.key}'s input, without its null and undefined values: for start, or a qubesync/kit Operation's input.`],
          [...this.#tags(params, "options."), "@returns the input", ...seeTags(workflow.inputs)],
          "  "
        ),
        `  input(${params.length ? `options${params.every((p) => !p.input.required) ? "?" : ""}: ${optionsType}` : ""}): ${workflow.inputType};`
      );
    }

    const lines = [];
    const paragraphs = [intro(workflow)];
    if (workflow.discriminated) {
      const names = workflow.branches.map((branch) => `${branch.method} (${JSON.stringify(branch.value)})`);
      paragraphs.push(`A start method per \`${workflow.discriminator}\`: ${names.join(", ")}. start takes any of their inputs.`);
    }
    lines.push(...doc(paragraphs, [], ""), `export declare const ${accessor}: ${workflow.type}Workflow;`, "");
    lines.push(...doc([`${workflow.key}'s start methods: \`${accessor}.<method>(...)\`.`], [], ""));
    lines.push(`export interface ${workflow.type}Workflow {`);
    lines.push(`  readonly WORKFLOW: ${JSON.stringify(workflow.key)};`);
    lines.push(...doc(["The version these types describe (null for a draft). A start runs the published version unless given `version`."], [], "  "));
    lines.push(`  readonly VERSION: ${workflow.version === null ? "null" : workflow.version};`);
    lines.push(...methods, "}", "");
    lines.push(...types);
    for (const name of [...this.aliases.keys()].sort(W.compare)) lines.push("", ...this.aliases.get(name));
    return lines;
  }

  // Names a positional parameter mustn't take: the workflows' own.
  avoid() {
    return new Set(this.workflows.map((workflow) => workflow.accessor));
  }

  #inputField(input) {
    return { key: input.name, type: this.type(input.schema, input.name, "  "), required: input.required, doc: [sentence(inputText(input.schema))] };
  }

  #optionsInterface(name, params, methods) {
    const fields = params.map((param) => {
      const text = inputText(param.input.schema);
      const renamed = param.name === W.camel(param.input.name) ? [] : [`The \`${param.input.name}\` input.`];
      return {
        key: param.name,
        type: this.type(param.input.schema, param.input.name, "  ", !param.input.required),
        required: param.input.required,
        doc: [[...renamed, sentence(text)].join(" ")],
      };
    });
    return this.#interface(name, fields, [`The inputs ${methods} take as options (snake_case in the input), each left out when null or undefined.`]);
  }

  #interface(name, fields, paragraphs) {
    const lines = [...doc(paragraphs, [], ""), `export interface ${name} {`];
    if (fields.length === 0) lines.push("  [key: string]: never;");
    for (const field of fields) {
      lines.push(...doc(field.doc, [], "  "), `  ${propertyKey(field.key)}${field.required ? "" : "?"}: ${field.type};`);
    }
    lines.push("}");
    return lines;
  }

  #signature(params) {
    return params.map((param) => `${param.name}: ${this.type(param.input.schema, param.input.name, null)}`);
  }

  #tags(params, prefix = "") {
    return params.map((param) => {
      const renamed = !param.positional && param.name !== W.camel(param.input.name);
      const text = inputText(param.input.schema);
      return `@param ${prefix}${param.name} ${renamed ? `the \`${param.input.name}\` input. ` : ""}${text}`.replace(/\s+$/, "");
    });
  }

  // -- Types ----------------------------------------------------------------------------

  type(schema, path, indent, nullable = false) {
    const members = this.members(schema, path, indent);
    if (nullable) members.push("null");
    return union(members);
  }

  members(schema, path, indent) {
    const id = W.operation(schema);
    if (id) return [this.body(id, schema, path)];
    if (W.discriminated(schema)) return [this.named(schema, path)];
    if (has(schema, "const")) return [literal(schema.const)];
    if (Array.isArray(schema.enum)) return schema.enum.map(literal);

    const types = Array.isArray(schema.type) ? [...schema.type] : typeof schema.type === "string" ? [schema.type] : [];
    if (types.length === 0) {
      if (has(schema, "properties")) types.push("object");
      if (has(schema, "items")) types.push("array");
    }
    if (types.length === 0) return ["unknown"];
    return types.map((kind) => {
      switch (kind) {
        case "string":
          return "string";
        case "integer":
        case "number":
          return "number";
        case "boolean":
          return "boolean";
        case "null":
          return "null";
        case "array":
          return arrayOf(this.type(W.isPlainObject(schema.items) ? schema.items : {}, `${path}_item`, indent));
        case "object":
          return this.object(schema, path, indent);
        default:
          return "unknown";
      }
    });
  }

  object(schema, path, indent) {
    const properties = W.isPlainObject(schema.properties) ? schema.properties : {};
    const extra = schema.additionalProperties;
    const names = Object.keys(properties).sort(W.compare);
    if (names.length === 0) {
      return W.isPlainObject(extra) ? `{ [key: string]: ${this.type(extra, `${path}_value`, indent)} }` : FREE_OBJECT;
    }
    const required = new Set(Array.isArray(schema.required) ? schema.required : []);
    const inner = indent === null ? null : `${indent}  `;
    const fields = names.map((name) => ({
      key: name,
      type: this.type(W.isPlainObject(properties[name]) ? properties[name] : {}, `${path}_${name}`, inner),
      required: required.has(name),
    }));
    return record(fields, indent);
  }

  // A nested discriminated object's type: a union of an interface per branch, each named
  // <Workflow><Path><Title>. The same schema at the same place shares one.
  named(schema, path) {
    const key = JSON.stringify(["named", path, schema]);
    if (this.memo.has(key)) return this.memo.get(key);
    const name = this.claim(path);
    this.memo.set(key, name);
    // Shared by every branch of the workflow, so not named for one.
    const prefix = this.prefix;
    this.prefix = null;
    const discriminator = schema.discriminator.propertyName;
    const branches = W.branchSchemas(schema).map(({ title, properties, required }) => {
      const branch = this.claim(`${path}_${title}`);
      const fields = Object.keys(properties)
        .sort((a, b) => (a === discriminator ? 0 : 1) - (b === discriminator ? 0 : 1) || W.compare(a, b))
        .map((field) => {
          const sub = W.isPlainObject(properties[field]) ? properties[field] : {};
          return {
            key: field,
            type: this.type(sub, `${path}_${field}`, "  "),
            required: field === discriminator || required.has(field),
            doc: field === discriminator ? [] : [sentence(inputText(sub))],
          };
        });
      this.aliases.set(branch, this.#interface(branch, fields, []));
      return branch;
    });
    this.aliases.set(name, [`export type ${name} = ${branches.length ? branches.join(" | ") : FREE_OBJECT};`]);
    this.prefix = prefix;
    return name;
  }

  // An operation body: the operation's params type, or, when the workflow sets some of its fields
  // itself (set_by_workflow), a type of its own with those optional, named
  // <Workflow><Branch><Input>Body (<Workflow><Input>Body without branches). An operation this
  // version doesn't know is a plain object.
  body(id, schema, path) {
    const known = W.knownOperation(id);
    if (!known) return UNKNOWN_BODY;
    if (!this.imports.has(known.module)) this.imports.set(known.module, new Set());
    this.imports.get(known.module).add(known.params);
    const set = W.setByWorkflow(schema);
    if (set.length === 0) return known.params;

    const base = this.prefix ? `${this.prefix}_${path}` : path;
    const key = JSON.stringify(["body", base, id, set]);
    if (this.memo.has(key)) return this.memo.get(key);
    const name = this.claim(`${base}_body`);
    this.memo.set(key, name);
    const keys = set.map((field) => JSON.stringify(field)).join(" | ");
    const P = known.params;
    const them = set.length === 1 ? "it" : "them";
    this.aliases.set(name, [
      ...doc(
        [
          `The ${id} body as this workflow takes it: \`${known.method}\`'s params (${P}), except that the workflow sets ${set
            .map((field) => `\`${field}\``)
            .join(", ")} itself, so ${set.length === 1 ? "it's" : "they're"} optional here, and a value given for ${them} is overwritten.`,
        ],
        [],
        ""
      ),
      `export type ${name} = Omit<${P}, ${keys}> & Partial<Pick<${P}, Extract<${keys}, keyof ${P}>>>;`,
    ]);
    return name;
  }

  // A free type name for path, under the workflow's: <Workflow><Path>, then <Workflow><Path>2...
  claim(path) {
    const base = `${this.current.type}${W.pascal(path).replace(/[^A-Za-z0-9_$]/g, "")}`;
    let name = base;
    for (let n = 2; this.taken.has(name); n += 1) name = `${base}${n}`;
    this.taken.add(name);
    return name;
  }
}

// The $operation ids anywhere in a schema, where the renderer looks for types.
function operationIds(schema) {
  const ids = [];
  const visit = (sub) => {
    if (!W.isPlainObject(sub)) return;
    const id = W.operation(sub);
    if (id) ids.push(id);
    if (W.isPlainObject(sub.properties)) Object.values(sub.properties).forEach(visit);
    if (Array.isArray(sub.oneOf)) sub.oneOf.forEach(visit);
    visit(sub.items);
    visit(sub.additionalProperties);
  };
  visit(schema);
  return ids;
}

function union(members) {
  const unique = [...new Set(members)];
  if (unique.length === 0 || unique.includes("unknown")) return "unknown";
  return unique.join(" | ");
}

function arrayOf(inner) {
  return /[|{&]/.test(inner) ? `Array<${inner}>` : `${inner}[]`;
}

// An object type over lines at indent, or on one line when indent is null (in a signature).
function record(fields, indent) {
  const field = (f) => `${propertyKey(f.key)}${f.required ? "" : "?"}: ${f.type}`;
  if (indent === null) return `{ ${fields.map(field).join("; ")} }`;
  return `{\n${fields.map((f) => `${indent}  ${field(f)};`).join("\n")}\n${indent}}`;
}

function literal(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return String(value);
  if (value === null) return "null";
  return "unknown";
}

function connectionTag() {
  return "@param connection the connection's QuBe Sync id, or a qubesync/kit Connection";
}

function runTags() {
  return [
    "@param options.reference your reference for the run, also its Idempotency-Key, so a retry never starts a second run",
    "@param options.webhookUrl where QuBe Sync sends the run's webhooks",
    "@param options.version the version to run; leave it out for the published one",
    "@param options.client defaults to the client setClient set",
  ];
}

function returnsTag() {
  return "@returns the run, as `client.startRun` resolves to it";
}

function seeTags(inputs) {
  const methods = new Set();
  for (const input of inputs) {
    const id = W.operation(input.schema);
    const known = id && W.knownOperation(id);
    if (known) methods.add(known.method);
  }
  return [...methods].sort(W.compare).map((method) => `@see \`${method}\``);
}

function topDoc() {
  return doc(
    [
      "Your app's QuBe Sync workflows, from their input types: each workflow is an export (addTransaction), with a start method per branch of its input (addTransaction.invoice(connection, body, { ...inputs, reference, webhookUrl })), or start(connection, { ...inputs, reference, webhookUrl }) for a workflow whose input has no branches. Each <branch>Input (or input) returns the input alone, without its null and undefined values: what a qubesync/kit Operation's input returns.",
      "An operation's body is typed as that operation's params (qubesync/operations/<entity>), except that a field the workflow sets itself is optional (and a value given for it is overwritten): QuBe Sync checks an input's fields and types when the run starts, and required fields when it sends the request.",
    ],
    [],
    ""
  );
}

function common() {
  return [
    ...doc(["A connection: its QuBe Sync id, or anything with a qubeId (a qubesync/kit Connection or connection row)."], [], ""),
    "export type Connection = string | { readonly qubeId?: string | null };",
    "",
    ...doc(["What every start takes besides its inputs."], [], ""),
    "export interface StartOptions {",
    "  /** Your reference for the run, also its Idempotency-Key, so a retry never starts a second run. */",
    "  reference: string;",
    "  /** Where QuBe Sync sends the run's webhooks. */",
    "  webhookUrl: string;",
    "  /** The version to run; leave it out for the published one. */",
    "  version?: number;",
    "  /** Defaults to the client setClient set. */",
    "  client?: Client;",
    "}",
    "",
    ...doc(["Sets the client a start uses unless it's passed `client`: once, at boot. Returns it."], [], ""),
    "export declare function setClient(client: Client): Client;",
    ...doc(["The client setClient set; throws when none is."], [], ""),
    "export declare function client(): Client;",
    ...doc(["A connection's QuBe Sync id: connection itself, or its qubeId (null when it has none)."], [], ""),
    "export declare function connectionId(connection: Connection): string | null;",
  ];
}

module.exports = { DtsRenderer };
