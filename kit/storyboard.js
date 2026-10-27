"use strict";

// Every screen the pieces show, from sample data, for the storyboard (qubesync/express's
// storyboard() router): the run status in each state, the one-shot error, and a question of
// each kind (kit/storyboard/*.json, prompts shaped as QuBe Sync sends them). Nothing is read from
// or written to QuBe Sync or the store: runs are built, never saved.

const fs = require("fs");
const path = require("path");

const { Connection, Run } = require("./records");
const { SyncStatus } = require("./sync-status");
const { QuestionView, RunStatusView, FieldView } = require("./views");
const { renderer, escapeHtml } = require("./pieces");

const DIR = path.join(__dirname, "storyboard");
const NOTHING_SENT = "Storyboard: nothing was sent.";

const QUESTIONS = Object.freeze(["near_match", "record_search", "choose", "enum_select", "number_boolean", "name_clash", "ask_about_add", "missing_record", "rows", "refusal"]);

// key, title, SyncStatus status, the run's attributes (ages in seconds), extra pieces, note.
const RUN_STATUSES = [
  ["not_sent", "Not sent", "not_sent", null, [], "A record with no run: renderRunStatus renders nothing."],
  ["starting", "Starting", "sending", { state: "starting", age: 5 }, [], "A start QuBe Sync is confirming."],
  ["unconfirmed", "A start not confirmed", "sending", { state: "starting", age: 120 }, ["run_status/retry"], "QuBe Sync hasn't confirmed the start for a minute: the retry button sends it again, same reference."],
  ["running", "Running", "sending", { state: "running", qubeRunId: "run-sample", age: 30 }, [], "QuBe Sync confirmed it; the Web Connector is working through it."],
  [
    "stalled_not_checking_in",
    "Waiting: QuickBooks isn't checking in",
    "sending",
    { state: "running", qubeRunId: "run-sample", age: 30 * 60, stall: "not_checking_in" },
    ["run_status/stall"],
    "A run going on a connection QuBe Sync says stalled (not_checking_in): the Web Connector hasn't called in. No redeliver button: the cause is known.",
  ],
  [
    "stalled_quickbooks_unavailable",
    "Waiting: QuickBooks is closed",
    "sending",
    { state: "running", qubeRunId: "run-sample", age: 30 * 60, stall: "quickbooks_unavailable" },
    ["run_status/stall"],
    "The same, stalled as quickbooks_unavailable: the Web Connector calls in but can't open the company file.",
  ],
  ["needs_answer", "Waiting for an answer", "needs_answer", { state: "awaiting_input", qubeRunId: "run-sample", age: 30, question: { message: "?" } }, [], "The run asks a question: renderQuestion shows it (below)."],
  ["looks_stuck", "Looks stuck", "sending", { state: "running", qubeRunId: "run-sample", age: 15 * 60 }, ["run_status/redeliver"], "No news for 10 minutes: the redeliver button asks QuBe Sync to send its latest event again."],
  ["in_quickbooks", "In QuickBooks", "in_quickbooks", { state: "completed", outcome: "added", ended: true }, [], "The record is linked to its QuickBooks id."],
  ["done", "Done", "done", { state: "completed", outcome: "completed", ended: true }, [], "Completed, linking nothing (an operation that doesn't link its record)."],
  [
    "failed",
    "Failed",
    "failed",
    {
      state: "failed",
      ended: true,
      error: { message: "QuickBooks refused the invoice because Riverbend Electric is inactive", detail: "Make Riverbend Electric active in QuickBooks, then send it again." },
    },
    ["run_status/detail"],
    "A failure: the pill says it couldn't sync; below it, why (the error's message) and what to do (its detail).",
  ],
  ["cancelled", "Cancelled", "cancelled", { state: "cancelled", ended: true, cancelReason: "The order was cancelled in the app." }, [], "Cancelled by your app, with its reason."],
];

// Rows built in memory need a store to hold; nothing calls it.
const NO_STORE = Object.freeze({});

let cached = null;

/** Every screen: { key, group, title, note, pieces, kind ("run_status", "error" or "question"), sample }. */
function screens() {
  if (!cached) cached = Object.freeze([...runStatusScreens(), errorScreen(), ...QUESTIONS.map(questionScreen)]);
  return cached;
}

function findScreen(key) {
  return screens().find((screen) => screen.key === String(key)) || null;
}

/** The sample's matches for a search: at most 20 whose label holds q. */
function matches(screen, field, q) {
  const list = screen && screen.kind === "question" ? (screen.sample.search || {})[String(field)] || [] : [];
  const query = String(q || "").trim().toLowerCase();
  return list.filter((m) => String(m.label || "").toLowerCase().includes(query)).slice(0, 20);
}

// Every form posts to the storyboard's no-op answer.
function urlsTo(answer) {
  return { question: () => answer, retryStart: () => answer, redeliver: () => answer };
}

function runStatusView(screen, answer, { messages } = {}) {
  const now = new Date();
  return RunStatusView.fromSync(syncStatus(screen.sample, now), { urls: urlsTo(answer), now, messages });
}

function questionView(screen, answer, search) {
  return new QuestionView(screen.sample.prompt, { actionUrl: answer, searchUrl: search, error: screen.sample.error || null });
}

/**
 * The storyboard's body: each screen in a card with its name, a note, the screen on a canvas
 * (rendered by the pieces, yours where you've replaced them) and the pieces to replace for it.
 * mount is where the storyboard router is mounted; list, the screens shown (all, or one).
 */
function renderStoryboard({ mount = "", list = screens(), notice = null, csrfToken = null, csrfField = "_csrf", pieces, uiClasses, messages } = {}) {
  const base = `${String(mount || "").replace(/\/+$/, "")}/qube/storyboard`;
  const { render, ctx } = renderer({ pieces, uiClasses, messages, csrfToken, csrfField });
  const single = list.length === 1;
  const e = escapeHtml;
  const html = [
    `<div class="qube-storyboard" id="qube-storyboard">`,
    `<header class="qube-storyboard-header">`,
    `<div>`,
    `<h1>QuickBooks screens</h1>`,
    `<p class="qube-storyboard-note">Every screen your users can meet, from sample data, in your layout. Replace a piece with the pieces setting; add classes with uiClasses. Nothing here reaches QuBe Sync.` +
      (single ? ` <a href="${e(base)}">All screens</a>` : "") +
      `</p>`,
    `</div>`,
    `<fieldset class="qube-storyboard-theme">`,
    `<legend>Canvas</legend>`,
    ...[["app", "As your page"], ["light", "Light"], ["dark", "Dark"]].map(
      ([value, label]) => `<label><input type="radio" name="qube-storyboard-canvas" value="${value}" data-qube-canvas-theme="${value}"${value === "app" ? " checked" : ""}>${label}</label>`
    ),
    `</fieldset>`,
    `</header>`,
  ];
  if (notice) html.push(`<p class="qube-storyboard-notice" role="status">${e(notice)}</p>`);
  html.push(`<div class="qube-storyboard-body">`, `<nav class="qube-storyboard-nav" aria-label="Screens">`);
  const groups = [];
  for (const screen of screens()) {
    let group = groups.find((g) => g.name === screen.group);
    if (!group) groups.push((group = { name: screen.group, screens: [] }));
    group.screens.push(screen);
  }
  for (const group of groups) {
    html.push(`<div class="qube-storyboard-nav-group">`, `<p class="qube-storyboard-nav-title">${e(group.name)}</p>`, `<ul>`);
    for (const screen of group.screens) {
      const href = single ? `${base}/${screen.key}` : `#qube-storyboard-${screen.key}`;
      const current = single && list[0].key === screen.key ? ` aria-current="page"` : "";
      html.push(`<li><a href="${e(href)}"${current}>${e(screen.title)}</a></li>`);
    }
    html.push(`</ul>`, `</div>`);
  }
  html.push(`</nav>`, `<div class="qube-storyboard-screens">`);
  for (const screen of list) {
    const answer = `${base}/${screen.key}/answer`;
    const id = `qube-storyboard-${screen.key}`;
    html.push(
      `<section class="qube-storyboard-panel" id="${e(id)}" data-qube-storyboard="${e(screen.key)}" aria-labelledby="${e(id)}-title">`,
      `<header class="qube-storyboard-panel-head">`,
      `<h2 id="${e(id)}-title"><a href="#${e(id)}">${e(screen.title)}</a></h2>`,
      `<span class="qube-storyboard-group">${e(screen.group)}</span>`
    );
    if (!single) html.push(`<a href="${e(`${base}/${screen.key}`)}" class="qube-storyboard-open">Open on its own</a>`);
    html.push(`</header>`, `<p class="qube-storyboard-note">${e(screen.note)}</p>`, `<div class="qube-storyboard-canvas" data-qube-storyboard-canvas>`);
    if (screen.kind === "run_status") {
      const view = runStatusView(screen, answer, { messages: ctx.messages });
      html.push(view.visible ? render("run_status/status", view) : `<p class="qube-storyboard-empty">Nothing is shown before a record is sent.</p>`);
    } else if (screen.kind === "error") {
      html.push(render("error", ctx.t(screen.sample.messageKey)));
    } else {
      html.push(render("question", questionView(screen, answer, `${base}/${screen.key}/search`)));
    }
    html.push(`</div>`);
    if (screen.pieces.length) {
      html.push(`<details class="qube-storyboard-files">`, `<summary>Pieces to replace (${screen.pieces.length})</summary>`, `<ul>`);
      for (const name of screen.pieces) {
        html.push(`<li><code>${e(overrideName(name))}</code><button type="button" class="qube-storyboard-copy" data-qube-copy="${e(name)}">Copy</button></li>`);
      }
      html.push(`</ul>`, `</details>`);
    }
    html.push(`</section>`);
  }
  html.push(`</div>`, `</div>`, `</div>`);
  return html.join("\n");
}

/** How an app replaces a piece: pieces["<name>"] in its settings. */
function overrideName(name) {
  return `pieces["${name}"]`;
}

function runStatusScreens() {
  return RUN_STATUSES.map(([key, title, status, run, extra, note]) => {
    const pieces = status === "not_sent" ? [] : ["run_status/status", "run_status/summary", ...extra];
    return Object.freeze({ key, group: "Run status", title, note, pieces, kind: "run_status", sample: { status, run } });
  });
}

function errorScreen() {
  return Object.freeze({
    key: "error",
    group: "Run status",
    title: "A one-shot error",
    note: "A route's message (takeError), shown once by whichever of renderRunStatus and renderQuestion gets it as its error option.",
    pieces: ["error"],
    kind: "error",
    sample: { messageKey: "errors.question_changed" },
  });
}

function questionScreen(key) {
  const sample = JSON.parse(fs.readFileSync(path.join(DIR, `${key}.json`), "utf8"));
  return Object.freeze({ key, group: "Questions", title: sample.title, note: sample.note, pieces: questionPieces(sample), kind: "question", sample });
}

function questionPieces(sample) {
  const { prompt } = sample;
  const list = ["question", "message"];
  if (Array.isArray(prompt.details) && prompt.details.length) list.push("details");
  const view = new QuestionView(prompt, { actionUrl: "", searchUrl: "" });
  if (view.picks.length) list.push("picks", "pick");
  if (view.forms.length || view.exits.length) list.push("choice");
  if (view.exits.length) list.push("footer");
  if (sample.error) list.push("error");
  const fields = (prompt.choices || []).flatMap((choice) => choice.fields || []);
  for (const field of fields) {
    const type = FieldView.typeOf(field);
    if (type !== "rows") list.push("field");
    list.push(`fields/${type}`);
    if (type !== "rows") continue;
    list.push("rows/row", "rows/cell", "rows/segmented", "field");
    for (const column of field.columns || []) list.push(`fields/${FieldView.typeOf(column)}`);
  }
  return [...new Set(list)];
}

function syncStatus(sample, now) {
  const attrs = sample.run;
  if (!attrs) return new SyncStatus("not_sent", null, null, now);
  const created = new Date(now.getTime() - (attrs.age || 0) * 1000);
  const connection = new Connection({ id: "storyboard", status: attrs.stall ? "stalled" : "connected", stallReason: attrs.stall || null }, NO_STORE);
  const run = new Run(
    {
      id: "storyboard",
      state: attrs.state,
      outcome: attrs.outcome || null,
      error: attrs.error || null,
      cancelReason: attrs.cancelReason || null,
      qubeRunId: attrs.qubeRunId || null,
      question: attrs.question || null,
      operation: "storyboard",
      reference: "storyboard",
      createdAt: created,
      updatedAt: created,
      endedAt: attrs.ended ? now : null,
    },
    NO_STORE,
    connection
  );
  return new SyncStatus(sample.status, run, null, now);
}

module.exports = { QUESTIONS, NOTHING_SENT, screens, findScreen, matches, renderStoryboard, overrideName };
