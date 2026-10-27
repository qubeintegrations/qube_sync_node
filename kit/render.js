"use strict";

// renderRunStatus(status, options) and renderQuestion(run, options): a record's sync status and
// its latest run's question, as HTML for the record's page, made of pieces (kit/pieces.js) from
// view-models (kit/views.js). renderAssets writes the behaviour script's and stylesheet's tags.
// README, "Run status and questions" and "Styling".

const path = require("path");

const { SyncStatus } = require("./sync-status");
const { QuestionView, RunStatusView, routes } = require("./views");
const { renderer, escapeHtml } = require("./pieces");

const QUESTION_SCRIPT_PATH = path.join(__dirname, "assets", "question.js");
const STYLESHEET_PATH = path.join(__dirname, "assets", "qubesync.css");
// Where the questions router serves them, under its mount.
const ASSET_ROUTES = Object.freeze({ script: "/qube/assets/question.js", stylesheet: "/qube/assets/qubesync.css" });

function renderQuestion(runOrStatus, options) {
  const opts = options || {};
  const { render } = renderer(opts);
  const run = runOf(runOrStatus);
  const question = QuestionView.fromRun(run, { urls: routes(opts.mount), error: opts.error || null });
  return question ? render("question", question) : render("error", opts.error || null);
}

function renderRunStatus(statusOrRun, options) {
  const opts = options || {};
  const now = opts.now || new Date();
  const { render, ctx } = renderer(opts);
  const sync = syncOf(statusOrRun, now);
  const view = RunStatusView.fromSync(sync, { urls: routes(opts.mount), error: opts.error || null, connection: opts.connection || null, now, messages: ctx.messages });
  return render("run_status/status", view);
}

/**
 * The behaviour script's tag (deferred, with your CSP nonce when you pass one) and, with
 * stylesheet: true, the opt-in stylesheet's, for your layout's <head>. mount is where the
 * questions router (which serves them) is mounted.
 */
function renderAssets({ mount = "", stylesheet = false, nonce = null } = {}) {
  const base = String(mount || "").replace(/\/+$/, "");
  const tags = [];
  if (stylesheet) tags.push(`<link rel="stylesheet" href="${escapeHtml(base + ASSET_ROUTES.stylesheet)}">`);
  const nonceAt = nonce ? ` nonce="${escapeHtml(nonce)}"` : "";
  tags.push(`<script src="${escapeHtml(base + ASSET_ROUTES.script)}" defer${nonceAt}></script>`);
  return tags.join("\n");
}

// A SyncStatus as given, or a bare Run's (no link looked up).
function syncOf(statusOrRun, now) {
  if (statusOrRun instanceof SyncStatus) return statusOrRun;
  return SyncStatus.fromRun(isRun(statusOrRun) ? statusOrRun : null, { now });
}

function runOf(runOrStatus) {
  if (runOrStatus instanceof SyncStatus) return runOrStatus.run;
  return isRun(runOrStatus) ? runOrStatus : null;
}

function isRun(value) {
  return Boolean(value) && typeof value.summaryText === "function" && typeof value.openQuestion === "function";
}

module.exports = { renderQuestion, renderRunStatus, renderAssets, escapeHtml, QUESTION_SCRIPT_PATH, STYLESHEET_PATH, ASSET_ROUTES };
