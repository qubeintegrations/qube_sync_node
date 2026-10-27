"use strict";

// `npx qubesync workflows [--drafts] [--check] [--output qube-workflows.js]`
//
// Fetches the app's workflow types with QUBE_API_KEY (from QUBE_BASE_URL, default
// https://qubesync.com, with or without /api/v2) and writes the typed module and its declarations
// beside it (qube-workflows.js and qube-workflows.d.ts; a .cjs output gets a .d.cts). With --check
// it writes nothing: it exits 1 when the file is out of date (or QuBe Sync refuses the key), and 0
// when it's current or QuBe Sync can't be reached, with a warning, so CI isn't held up by an
// outage.

const fs = require("fs");
const path = require("path");

const { APIError, Client } = require("../client");
const workflowTypes = require("./index");

const USAGE = "Usage: npx qubesync workflows [--drafts] [--check] [--output PATH]";
const HELP = `${USAGE}

  --drafts       Type each workflow's draft where it has one
  --check        Write nothing; exit 1 when the file is out of date
  --output PATH  The module (qube-workflows.js; its types go beside it, as qube-workflows.d.ts)

QUBE_API_KEY is your app's API key; QUBE_BASE_URL is https://qubesync.com unless set.`;
const DEFAULT_BASE_URL = "https://qubesync.com";
const API_PATH = "/api/v2";

// Runs the command and resolves to its exit status. env, out, err and cwd are for tests; out and
// err take write(text); clientFactory takes { apiKey, baseUrl }.
async function cli(argv, options = {}) {
  const env = options.env || process.env;
  const out = options.out || process.stdout;
  const err = options.err || process.stderr;
  const cwd = options.cwd || process.cwd();
  const clientFactory = options.clientFactory || ((settings) => new Client(settings));
  const say = (stream, text) => stream.write(`${text}\n`);

  const [command, ...rest] = argv;
  if (command !== "workflows") {
    say(err, HELP);
    return ["-h", "--help", "help"].includes(command) ? 0 : 1;
  }

  const opts = { drafts: false, check: false, output: "qube-workflows.js" };
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === "--drafts") opts.drafts = true;
    else if (arg === "--check") opts.check = true;
    else if (arg === "--output" && i + 1 < rest.length) opts.output = rest[(i += 1)];
    else if (arg.startsWith("--output=")) opts.output = arg.slice("--output=".length);
    else if (arg === "-h" || arg === "--help") {
      say(out, HELP);
      return 0;
    } else {
      say(err, `qubesync: ${arg === "--output" ? "--output needs a path" : `unknown argument ${arg}`}`);
      say(err, HELP);
      return 1;
    }
  }
  const output = path.resolve(cwd, opts.output);
  const match = /^(.*)\.(js|cjs)$/.exec(path.basename(output));
  if (!match || match[1] === "") {
    say(err, `qubesync: --output must name a .js or .cjs file (the module is CommonJS), not ${opts.output}`);
    return 1;
  }
  const typesFile = path.join(path.dirname(output), `${match[1]}.${match[2] === "cjs" ? "d.cts" : "d.ts"}`);
  const types = match[2] === "cjs" ? `./${match[1]}.cjs` : `./${match[1]}`;

  const apiKey = String(env.QUBE_API_KEY || "").trim();
  if (apiKey === "") {
    say(err, "qubesync: set QUBE_API_KEY to your app's API key");
    return 1;
  }
  // The site, or its API: QUBE_BASE_URL may name either.
  let baseUrl = String(env.QUBE_BASE_URL || "").trim() || DEFAULT_BASE_URL;
  baseUrl = baseUrl.replace(/\/+$/, "");
  if (baseUrl.endsWith(API_PATH)) baseUrl = baseUrl.slice(0, -API_PATH.length);
  let client;
  try {
    client = clientFactory({ apiKey, baseUrl });
  } catch (error) {
    say(err, `qubesync: ${error.message}`);
    return 1;
  }
  const source = `${baseUrl}${API_PATH}/workflows/types`;
  const shown = path.relative(cwd, output) || output;
  try {
    return opts.check
      ? await check(client, source, output, shown, types, { out, err, say })
      : await generate(client, source, output, typesFile, types, opts.drafts, { out, err, say, cwd });
  } catch (error) {
    if (error instanceof workflowTypes.WorkflowTypesError || error instanceof TypeError) {
      say(err, `qubesync: ${error.message}`);
      return 1;
    }
    throw error;
  }
}

async function generate(client, source, output, typesFile, types, drafts, { out, err, say, cwd }) {
  let document;
  try {
    document = await client.workflowTypes({ includeDrafts: drafts });
  } catch (error) {
    if (error instanceof APIError) {
      say(err, `qubesync: ${error.message}`);
      return 1;
    }
    if (error && typeof error.code === "string") {
      say(err, `qubesync: couldn't reach QuBe Sync (${error.code}: ${error.message}); nothing was written`);
      return 1;
    }
    throw error;
  }
  const files = workflowTypes.render(document, { source, drafts, types });
  for (const warning of files.warnings) say(err, `warning: ${warning}`);
  write(output, files.js, { out, say, cwd });
  write(typesFile, files.dts, { out, say, cwd });
  const count = workflowTypes.select(document, drafts).length;
  say(out, `qubesync: ${count} workflow${count === 1 ? "" : "s"} from ${source}${drafts ? " (with drafts)" : ""}`);
  return 0;
}

async function check(client, source, output, shown, types, { out, err, say }) {
  if (!fs.existsSync(output)) {
    say(err, `qubesync: ${shown} isn't there: run \`${workflowTypes.COMMAND}\` to write it`);
    return 1;
  }
  const outcome = await workflowTypes.check(fs.readFileSync(output, "utf8"), { client, source, path: shown, types });
  for (const warning of outcome.warnings) say(err, `warning: ${warning}`);
  if (outcome.status === "current") say(out, `qubesync: ${outcome.message}`);
  else if (outcome.status === "unreachable") say(err, `warning: ${outcome.message}`);
  else say(err, `qubesync: ${outcome.message}`);
  return outcome.exitStatus;
}

function write(file, content, { out, say, cwd }) {
  const shown = path.relative(cwd, file) || file;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) {
    say(out, `identical ${shown}`);
  } else {
    fs.writeFileSync(file, content);
    say(out, `wrote ${shown}`);
  }
}

module.exports = { cli, USAGE };
