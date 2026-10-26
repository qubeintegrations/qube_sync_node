"use strict";

// Writes the .js half of a render: a CommonJS module with an object per workflow, its start and
// input methods, each with a short JSDoc whose types are the .d.ts's. Plain JavaScript for Node
// 16: it requires nothing, not even qubesync (a start calls the client it's given, or the one
// setClient set).

const W = require("./workflow");
const { doc, intro } = require("./text");

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const propertyKey = (key) => (IDENTIFIER.test(key) ? key : JSON.stringify(key));
// A JSDoc type must stay on its tag's line.
const NO_WRAP = { wrapTags: false };

class JsRenderer {
  // types: the specifier the JSDoc imports the .d.ts by ("./qube-workflows").
  constructor(workflows, { header, types }) {
    this.workflows = workflows;
    this.header = header;
    this.types = types;
  }

  render() {
    const lines = [...this.header, '"use strict";', ""];
    lines.push(...topDoc(this.types));
    lines.push("", ...helpers(this.types));
    for (const workflow of this.workflows) lines.push("", ...this.#workflow(workflow));
    lines.push("", "module.exports = {");
    for (const name of ["setClient", "client", "connectionId", ...this.workflows.map((workflow) => workflow.accessor)]) {
      lines.push(`  ${name},`);
    }
    lines.push("};", "");
    return lines.join("\n");
  }

  #t(name) {
    return `import(${JSON.stringify(this.types)}).${name}`;
  }

  #workflow(workflow) {
    const avoid = new Set(this.workflows.map((w) => w.accessor));
    const self = workflow.accessor;
    const key = JSON.stringify(workflow.key);
    const paragraphs = [intro(workflow)];
    if (workflow.discriminated) {
      const names = workflow.branches.map((branch) => `${branch.method} (${JSON.stringify(branch.value)})`);
      paragraphs.push(`A start method per \`${workflow.discriminator}\`: ${names.join(", ")}. start takes any of their inputs.`);
    }
    const lines = [...doc(paragraphs, [], ""), `const ${self} = Object.freeze({`];
    lines.push(`  WORKFLOW: ${key},`);
    lines.push("  // The version these types describe (null for a draft). A start runs the published version");
    lines.push("  // unless given version.");
    lines.push(`  VERSION: ${workflow.version === null ? "null" : workflow.version},`);

    if (workflow.discriminated) {
      for (const branch of workflow.branches) {
        const params = W.paramsFor(branch.inputs, branch.body, avoid);
        const positional = params.filter((p) => p.positional);
        const options = params.filter((p) => !p.positional);
        const value = JSON.stringify(branch.value);
        const optionsType = options.length ? `${this.#t(branch.optionsType)} & ${this.#t("StartOptions")}` : this.#t("StartOptions");
        const names = positional.map((p) => p.name);
        lines.push(
          "",
          ...doc(
            [`Starts ${workflow.key} with \`${workflow.discriminator}\` ${value}. Its docs are in the .d.ts.`],
            [
              `@param {${this.#t("Connection")}} connection`,
              ...positional.map((p) => `@param {${this.#t(branch.inputType)}[${JSON.stringify(p.input.name)}]} ${p.name}`),
              `@param {${optionsType}} options`,
              `@returns {Promise<import("qubesync").ApiObject>}`,
            ],
            "  ",
            NO_WRAP
          ),
          `  ${branch.method}(${["connection", ...names, "options"].join(", ")}) {`,
          `    return ${self}.start(connection, ${self}.${branch.builder}(${[...names, "options"].join(", ")}), options);`,
          "  },"
        );
        const pairs = [`${propertyKey(workflow.discriminator)}: ${value}`, ...pairsOf(params)];
        lines.push(
          "",
          ...doc(
            [`${workflow.key}'s input with \`${workflow.discriminator}\` ${value}, without its null and undefined values.`],
            [
              ...positional.map((p) => `@param {${this.#t(branch.inputType)}[${JSON.stringify(p.input.name)}]} ${p.name}`),
              ...(options.length ? [`@param {${this.#t(branch.optionsType)}} ${optionalParam(options)}`] : []),
              `@returns {${this.#t(branch.inputType)}}`,
            ],
            "  ",
            NO_WRAP
          ),
          `  ${branch.builder}(${[...names, ...(options.length ? [optionsArg(options)] : [])].join(", ")}) {`,
          `    return compact({ ${pairs.join(", ")} });`,
          "  },"
        );
      }
      lines.push(
        "",
        ...doc(
          [`Starts ${workflow.key} with any of its inputs: an object as ${workflow.branches.map((b) => b.builder).join(" or ")} returns it.`],
          [
            `@param {${this.#t("Connection")}} connection`,
            `@param {${this.#t(workflow.inputType)}} input`,
            `@param {${this.#t("StartOptions")}} options`,
            `@returns {Promise<import("qubesync").ApiObject>}`,
          ],
          "  ",
          NO_WRAP
        ),
        "  start(connection, input, options) {",
        `    return run(${key}, connection, input, options);`,
        "  },"
      );
    } else {
      const params = W.paramsFor(workflow.inputs, null, avoid);
      const optionsType = `${workflow.type}Options`;
      lines.push(
        "",
        ...doc(
          [`Starts ${workflow.key}. Its docs are in the .d.ts.`],
          [
            `@param {${this.#t("Connection")}} connection`,
            `@param {${params.length ? `${this.#t(optionsType)} & ` : ""}${this.#t("StartOptions")}} options`,
            `@returns {Promise<import("qubesync").ApiObject>}`,
          ],
          "  ",
          NO_WRAP
        ),
        "  start(connection, options) {",
        `    return run(${key}, connection, ${self}.input(${params.length ? "options" : ""}), options);`,
        "  },",
        "",
        ...doc(
          [`${workflow.key}'s input, without its null and undefined values.`],
          [...(params.length ? [`@param {${this.#t(optionsType)}} ${optionalParam(params)}`] : []), `@returns {${this.#t(workflow.inputType)}}`],
          "  ",
          NO_WRAP
        )
      );
      if (params.length) {
        lines.push(`  input(${optionsArg(params)}) {`, `    return compact({ ${pairsOf(params).join(", ")} });`, "  },");
      } else {
        lines.push("  input() {", "    return {};", "  },");
      }
    }
    lines.push("});");
    return lines;
  }
}

// A builder's options: optional (an empty object) only when every input in them is.
function optionsArg(params) {
  return params.every((param) => !param.input.required) ? "options = {}" : "options";
}

function optionalParam(params) {
  return params.every((param) => !param.input.required) ? "[options]" : "options";
}

// An input's entries: its key in the input, and the parameter or option it comes from.
function pairsOf(params) {
  return params.map((param) => {
    const value = param.positional ? param.name : `options.${param.name}`;
    return param.positional && param.name === param.input.name ? param.input.name : `${propertyKey(param.input.name)}: ${value}`;
  });
}

function topDoc(types) {
  const file = types.replace(/^\.\//, "").replace(/\.cjs$/, "");
  const lines = doc(
    [
      "Your app's QuBe Sync workflows, from their input types: each workflow is an export (addTransaction), with a start method per branch of its input (addTransaction.invoice(connection, body, { ...inputs, reference, webhookUrl })), or start(connection, { ...inputs, reference, webhookUrl }) for a workflow whose input has no branches. Each <branch>Input (or input) returns the input alone, without its null and undefined values. connection is a connection's QuBe Sync id, or anything with a qubeId (a qubesync/kit Connection).",
      "A start uses the client setClient set unless it's passed another as client. Set it once, at boot: setClient(new Client({ apiKey: process.env.QUBE_API_KEY })).",
      `The types and docs are in ${file}${types.endsWith(".cjs") ? ".d.cts" : ".d.ts"}. An operation's body is typed as that operation's params, except that a field the workflow sets itself is optional (and a value given for it is overwritten): QuBe Sync checks an input's fields and types when the run starts, and required fields when it sends the request.`,
    ],
    [],
    ""
  );
  // A plain comment, not a doc comment: it documents the file.
  return lines.slice(1, -1).map((line) => line.replace(/^ \*/, "//"));
}

function helpers(types) {
  const t = (name) => `import(${JSON.stringify(types)}).${name}`;
  return [
    '/** @type {import("qubesync").Client | null} */',
    "let defaultClient = null;",
    "",
    "/**",
    " * Sets the client a start uses unless it's passed client: once, at boot. Returns it.",
    " *",
    ' * @param {import("qubesync").Client} given',
    ' * @returns {import("qubesync").Client}',
    " */",
    "function setClient(given) {",
    "  defaultClient = given;",
    "  return given;",
    "}",
    "",
    "/**",
    " * The client setClient set; throws when none is.",
    " *",
    ' * @returns {import("qubesync").Client}',
    " */",
    "function client() {",
    "  if (!defaultClient) {",
    "    throw new Error(\"no QuBe Sync client is set: call setClient(new Client({ apiKey })) once, at boot, or pass client\");",
    "  }",
    "  return defaultClient;",
    "}",
    "",
    "/**",
    " * A connection's QuBe Sync id: connection itself, or its qubeId (null when it has none).",
    " *",
    ` * @param {${t("Connection")}} connection`,
    " * @returns {string | null}",
    " */",
    "function connectionId(connection) {",
    '  if (connection === null || typeof connection !== "object") return connection;',
    "  return connection.qubeId === undefined || connection.qubeId === null ? null : connection.qubeId;",
    "}",
    "",
    "/**",
    " * The input without its null and undefined values.",
    " *",
    " * @param {{ [key: string]: unknown }} input",
    " * @returns {any}",
    " */",
    "function compact(input) {",
    "  /** @type {{ [key: string]: unknown }} */",
    "  const out = {};",
    "  for (const [key, value] of Object.entries(input)) if (value !== undefined && value !== null) out[key] = value;",
    "  return out;",
    "}",
    "",
    "/**",
    " * Starts workflow's run on connection, through options.client or the one setClient set.",
    " *",
    " * @param {string} workflow",
    ` * @param {${t("Connection")}} connection`,
    " * @param {import(\"qubesync\").ApiObject} input",
    ` * @param {${t("StartOptions")}} options`,
    ' * @returns {Promise<import("qubesync").ApiObject>}',
    " */",
    "async function run(workflow, connection, input, options) {",
    "  const { reference, webhookUrl, version, client: given } = options || {};",
    "  // A connection without a qubeId is null here, which startRun refuses.",
    "  const id = /** @type {string} */ (connectionId(connection));",
    "  return (given || client()).startRun(id, workflow, input, { reference, webhookUrl, version });",
    "}",
  ];
}

module.exports = { JsRenderer };
