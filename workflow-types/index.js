"use strict";

// Turns an app's workflow input types (client.workflowTypes(), GET /api/v2/workflows/types) into
// a typed CommonJS module and its declarations: an object per workflow, and a start method per
// branch of a workflow's input, whose operation bodies are typed as the operation's own params
// (InvoiceCreateParams, from qubesync/operations/invoice).
//
//   const { render } = require("qubesync/workflow-types");
//   const files = render(await qube.workflowTypes(), { source: "https://qubesync.com/api/v2/workflows/types" });
//   fs.writeFileSync("qube-workflows.js", files.js);
//   fs.writeFileSync("qube-workflows.d.ts", files.dts);
//
// `npx qubesync workflows` (bin/qubesync.js, cli below) does this, and `--check` compares a
// written file with what QuBe Sync serves. The same document gives byte-identical files.

const { APIError, NOT_MODIFIED } = require("../client");
const { DIGEST } = require("../operations/index.js");
const W = require("./workflow");
const { DtsRenderer } = require("./dts-renderer");
const { JsRenderer } = require("./js-renderer");

const { Workflow, WorkflowTypesError } = W;
const COMMAND = "npx qubesync workflows";
// The specifier the .js's JSDoc imports its .d.ts by, by default.
const TYPES = "./qube-workflows";

function version() {
  // Required lazily: index.js requires client.js, and owns VERSION.
  return require("../index").VERSION;
}

// Renders a document's workflows: each published one at its published version, or with
// `drafts: true` each workflow's draft where it has one. `source` is the URL the header names,
// `command` the command it says to run again, and `types` the specifier the .js's JSDoc imports
// the .d.ts by ("./qube-workflows"; "./name.cjs" beside a name.d.cts). Returns
// { js, dts, digest, drafts, warnings }.
function render(document, { source, drafts = false, command = COMMAND, types = TYPES } = {}) {
  validate(document);
  for (const [what, text] of [["source", source], ["command", command], ["types", types]]) {
    if (typeof text !== "string" || text === "" || /[\r\n\u2028\u2029]/.test(text)) {
      throw new TypeError(`${what} must be a one-line string`);
    }
  }
  const workflows = select(document, drafts).map(([key, entry]) => new Workflow(key, entry));
  const accessors = new Map();
  for (const workflow of workflows) {
    if (accessors.has(workflow.accessor)) {
      throw new WorkflowTypesError(`workflows ${accessors.get(workflow.accessor)} and ${workflow.key} would share the export ${workflow.accessor}`);
    }
    accessors.set(workflow.accessor, workflow.key);
  }

  const header = headerLines(source, drafts ? `${command} --drafts` : command, document.digest, drafts);
  return {
    js: new JsRenderer(workflows, { header, types }).render(),
    dts: new DtsRenderer(workflows, { header }).render(),
    digest: document.digest,
    drafts,
    warnings: warnings(document),
  };
}

// The workflows a render types, as [key, entry], sorted by key: the published ones, each replaced
// by its draft when drafts is true, and the drafts of workflows never published.
function select(document, drafts) {
  const chosen = { ...(W.isPlainObject(document.workflows) ? document.workflows : {}) };
  if (drafts && W.isPlainObject(document.drafts)) Object.assign(chosen, document.drafts);
  return Object.keys(chosen)
    .sort(W.compare)
    .map((key) => [key, chosen[key]]);
}

// The digest and drafts a generated file's header records, or null when it has none.
function header(text) {
  const lines = String(text).split("\n").slice(0, 10);
  const find = (pattern) => {
    for (const line of lines) {
      const match = pattern.exec(line.replace(/\s+$/, ""));
      if (match) return match[1];
    }
    return null;
  };
  const digest = find(/^\/\/ digest: (\S+)$/);
  const drafts = find(/^\/\/ drafts: (true|false)$/);
  if (digest === null || drafts === null) return null;
  return { digest, drafts: drafts === "true" };
}

// The workflows whose generated object differs between two renders' .js, by key, sorted.
function changes(before, after) {
  const old = workflowBlocks(before);
  const now = workflowBlocks(after);
  const keys = [...new Set([...old.keys(), ...now.keys()])].sort(W.compare);
  const out = [];
  for (const key of keys) {
    if (!old.has(key)) out.push(`${key} (new)`);
    else if (!now.has(key)) out.push(`${key} (removed)`);
    else if (old.get(key) !== now.get(key)) out.push(`${key} (changed)`);
  }
  return out;
}

// Compares a generated .js (its text) with what QuBe Sync serves now, fetched with the drafts flag
// the file records. client is a qubesync Client, or anything answering workflowTypes as it does;
// path names the file in messages. Takes render's options, so the changes it lists are the ones
// running `command` again would make. Resolves to { status, message, changes, warnings,
// exitStatus }: status is "current", "stale" (changes lists the workflows, as "add_transaction
// (changed)", "resolve (new)", "upsert (removed)"), "unreachable" (QuBe Sync didn't answer, or
// answered 5xx: nothing was checked) or "error" (a 401, another 4xx, a file without a header).
// exitStatus is 0 when the file is current and when QuBe Sync couldn't be reached (CI warns, and
// the file keeps working); 1 otherwise.
async function check(existing, { client, source, path, command = COMMAND, types = TYPES }) {
  const recorded = header(existing);
  if (!recorded) return result("error", `${path} has no digest header: run \`${command}\` to write it`);

  const again = recorded.drafts ? `${command} --drafts` : command;
  let document;
  try {
    document = await client.workflowTypes({ includeDrafts: recorded.drafts, etag: recorded.digest });
  } catch (error) {
    if (error instanceof APIError) {
      if (error.status >= 500) return unreachable(`QuBe Sync answered ${error.status}`);
      return result("error", error.message);
    }
    if (networkError(error)) return unreachable(`${error.code || error.name}: ${error.message}`);
    throw error;
  }
  if (document === NOT_MODIFIED) return result("current", `${path} is up to date`);

  const files = render(document, { source, drafts: recorded.drafts, command, types });
  if (files.digest === recorded.digest) return result("current", `${path} is up to date`, [], files.warnings);

  const changed = changes(existing, files.js);
  const what = changed.length ? changed.join(", ") : "the served types changed";
  return result("stale", `${path} is out of date (${what}): run \`${again}\` and commit the result`, changed, files.warnings);
}

function result(status, message, changed = [], warned = []) {
  return { status, message, changes: changed, warnings: warned, exitStatus: status === "current" || status === "unreachable" ? 0 : 1 };
}

function unreachable(why) {
  return result("unreachable", `couldn't reach QuBe Sync (${why}), so the workflow types weren't checked`);
}

// A failure to reach QuBe Sync: Node's own network errors (ECONNREFUSED, ENOTFOUND, ETIMEDOUT...).
function networkError(error) {
  return Boolean(error) && typeof error.code === "string" && /^E[A-Z_]+$/.test(error.code);
}

// A served operations_digest other than this version's: the document's $operation ids may name
// operations this version doesn't type.
function warnings(document) {
  const served = document.operations_digest;
  if (served === undefined || served === null || served === DIGEST) return [];
  return [
    `QuBe Sync's operations (${served}) aren't the ones qubesync ${version()} was generated from (${DIGEST}): an operation it doesn't know is typed as Record<string, unknown>. Update qubesync to type it.`,
  ];
}

function validate(document) {
  if (!W.isPlainObject(document) || typeof document.digest !== "string" || !W.isPlainObject(document.workflows)) {
    throw new WorkflowTypesError("not a workflow types document (expected digest and workflows)");
  }
  if (!/^[\w:.-]+$/.test(document.digest)) {
    throw new WorkflowTypesError(`not a workflow types document: digest ${JSON.stringify(document.digest)}`);
  }
}

function headerLines(source, command, digest, drafts) {
  return [
    `// Generated by \`${command}\` from ${source}: don't edit.`,
    `// Run it again when a workflow changes; \`${command} --check\` fails while this file is out of date.`,
    `// digest: ${digest}`,
    `// drafts: ${drafts}`,
  ];
}

// Each workflow's object in a generated .js, with its doc comment, by its WORKFLOW key.
function workflowBlocks(text) {
  const lines = String(text).split("\n");
  const blocks = new Map();
  lines.forEach((line, i) => {
    if (!/^const [A-Za-z_$][\w$]* = Object\.freeze\(\{$/.test(line)) return;
    let first = i;
    if (first > 0 && /^ \*\/$|^\/\*\*.*\*\/$/.test(lines[first - 1])) {
      first -= 1;
      while (first > 0 && !lines[first].startsWith("/**")) first -= 1;
    }
    let last = i;
    while (last < lines.length - 1 && lines[last] !== "});") last += 1;
    const block = lines.slice(first, last + 1).join("\n");
    const key = /^ {2}WORKFLOW: "([^"]+)",$/m.exec(block);
    if (key) blocks.set(key[1], block);
  });
  return blocks;
}

module.exports = {
  COMMAND,
  TYPES,
  WorkflowTypesError,
  render,
  select,
  header,
  changes,
  check,
  warnings,
};

// `npx qubesync workflows`; last, since it reads the functions above.
module.exports.cli = require("./cli").cli;
