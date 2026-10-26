"use strict";

// Your user's answers to the questions a run asks, from renderQuestion's forms on the record's
// page, a record field's search, and renderRunStatus's buttons:
//   POST <mount>/qube/questions/runs/<run id>         a choice, with its fields
//   GET  <mount>/qube/questions/runs/<run id>/search  a record field's matches, as JSON
//   POST <mount>/qube/runs/<run id>/retry_start       a start QuBe Sync never confirmed, again
//   POST <mount>/qube/runs/<run id>/redeliver         a stuck run's latest event, sent again
// What can't go through goes back to the page with { status: 303, error }: the adapter keeps
// the message for the page to show once (renderRunStatus's error option).
// Each finds the run, its operation (the operations setting) and its record, as the webhooks do,
// and asks authorizeQuestion(request, record, run) before anything is sent: by default, whether
// the signed-in account owns the run's connection. The calls to QuBe Sync are made here, with the
// API key, so the browser only ever talks to your app.

const { APIError } = require("../client");
const { client, isNoAnswer } = require("./client");
const { Run } = require("./records");
const { settings } = require("./settings");

const QUESTION_CHANGED = "This question has changed; reload.";
const NOT_STARTING = "This run isn't waiting for its start to be confirmed.";
const NOT_QUIET = "QuBe Sync has been heard from about this run lately: nothing to ask for.";
const REDELIVERY_REFUSED = Object.freeze({
  409: "QuBe Sync has no news about this run to send yet.",
  429: "That was asked a moment ago: give it a minute.",
});
const NO_ANSWER = "QuBe Sync didn't answer: try again in a minute.";
const SEARCH_LIMITS = Object.freeze({ minQuery: 2, maxQuery: 100, maxField: 100 });

// The run a request names, with its operation and its record, once authorizeQuestion says true,
// as { found: { run, operation, record } }; else { status }. Only true lets it through: a truthy
// record, or a forgotten return, doesn't. A refusal answers as a run that doesn't exist does
// (404), so a user can't tell another customer's run is there. The run's id comes from the URL,
// so this is what keeps one customer's users off another's runs.
//
// The default policy reads currentAccount: unset, it throws NotConfigured, naming the config
// file, as any setting does at its first use.
async function authorizedRun(runId, request, action) {
  const run = await Run.get(String(runId));
  const OperationClass = run ? settings().operationClass(run.operation) : null;
  const record = OperationClass ? await OperationClass.recordFor(run) : null;
  if (record === null) return { status: 404 };

  const allowed = await settings().authorizeQuestion(request, record, run);
  if (allowed !== true) {
    console.warn(`QuBe Sync: refused ${action} for run ${run.id}: authorizeQuestion said no`);
    return { status: 404 };
  }

  return { found: { run, operation: new OperationClass(record, run), record } };
}

/**
 * Posts your user's choice, with its fields, to the question's links.decisions. Resolves to
 * { status: 303 } (back to the page), { status: 303, error } when it can't go through (the
 * question changed: QUESTION_CHANGED; a field refused: refusalMessage), or { status: 404,
 * message }. A question QuBe Sync says was answered or asked again since (a 409, or a 400) is
 * forgotten. form is the posted form: choice, and data[name] (nested or not).
 */
async function answerQuestion({ runId, form, request }) {
  const { status, found } = await authorizedRun(runId, request, "an answer");
  if (!found) return { status, message: "Not found" };
  const question = found.run.openQuestion();
  const links = found.run.links || {};
  const sent = form || {};
  const choice = ((question && question.choices) || []).find((c) => c.id === sent.choice);
  if (!choice || !links.decisions) return back(QUESTION_CHANGED);

  try {
    await client().answer(links.decisions, { choice: choice.id, data: answerData(choice, sent) });
  } catch (err) {
    const refused = err instanceof APIError ? err.status : 0;
    if (![400, 409, 422].includes(refused)) throw err;
    // A field QuBe Sync couldn't take: its errors.detail says which.
    if (refused === 422) return back(refusalMessage(err));

    await found.operation.answered(question.token);
    return back(QUESTION_CHANGED);
  }
  await found.operation.answered(question.token);
  return { status: 303 };
}

/**
 * The matches for a record field, for what your user typed: [{ value, label, detail }], at most
 * 20, from the question's links.search, which a run sets while it asks with one. Resolves to
 * { status, json }: [] for a query under 2 or over 100 characters or a field name over 100
 * (nothing is asked), 404 [] for a run that isn't there or
 * authorizeQuestion doesn't allow, 409 [] when the question no longer searches, and QuBe Sync's
 * own 4xx with [].
 */
async function searchQuestion({ runId, field, q, request }) {
  const { status, found } = await authorizedRun(runId, request, "a search");
  if (!found) return { status, json: [] };
  const links = found.run.links || {};
  if (!links.search) return { status: 409, json: [] };
  const query = typeof q === "string" ? q.trim() : "";
  const name = typeof field === "string" ? field : "";
  if (!isSearchable(query, name)) return { status: 200, json: [] };

  try {
    return { status: 200, json: await client().search(links.search, { field: name, q: query }) };
  } catch (err) {
    const refused = err instanceof APIError ? err.status : 0;
    if (refused < 400 || refused > 499) throw err;
    return { status: refused, json: [] }; // the question has changed (409), say
  }
}

// What a search is asked about: q of 2 to 100 characters, a field name of 1 to 100.
function isSearchable(query, name) {
  const { minQuery, maxQuery, maxField } = SEARCH_LIMITS;
  return query.length >= minQuery && query.length <= maxQuery && name.length >= 1 && name.length <= maxField;
}

/**
 * Sends a start QuBe Sync never confirmed (a run still "starting") again, with the same reference
 * (Run#retryStart). Resolves to { status: 303 } (the page's status says how it went),
 * { status: 303, error: NOT_STARTING } for a run that isn't starting, or { status: 404, message }.
 */
async function retryStart({ runId, request }) {
  const { status, found } = await authorizedRun(runId, request, "a start retry");
  if (!found) return { status, message: "Not found" };
  if (found.run.state !== "starting") return back(NOT_STARTING);

  try {
    await found.run.retryStart();
  } catch (err) {
    if (!(err instanceof APIError) && !isNoAnswer(err)) throw err;
    // Refused (the run is now failed) or no answer again (still unconfirmed): the status on the
    // page says which.
    console.warn(`QuBe Sync: run ${found.run.id}'s start retry didn't go through (${err.name}${err.code ? ` ${err.code}` : ""})`);
  }
  return { status: 303 };
}

/**
 * Asks QuBe Sync to send a stuck run's latest event (Run#looksStuck) again, to the run's webhook
 * URL: renderRunStatus's "Send its latest news again". Resolves to { status: 303 }, { status: 303,
 * error } (not stuck: NOT_QUIET; refused: REDELIVERY_REFUSED[409 or 429]; no answer: NO_ANSWER),
 * or { status: 404, message }.
 */
async function redeliver({ runId, request }) {
  const { status, found } = await authorizedRun(runId, request, "a redelivery");
  if (!found) return { status, message: "Not found" };
  const { run } = found;
  if (!run.looksStuck()) return back(NOT_QUIET);

  try {
    await client().redeliverRun(run.connection.qubeId, run.qubeRunId);
  } catch (err) {
    if (err instanceof APIError && REDELIVERY_REFUSED[err.status]) return back(REDELIVERY_REFUSED[err.status]);
    if (isNoAnswer(err)) return back(NO_ANSWER);
    throw err;
  }
  return { status: 303 };
}

// Back to the page, with a message for it to show once.
function back(error) {
  return { status: 303, error };
}

/**
 * The choice's own fields from the form, each as its type: a checkbox true or false, a number as
 * a number (or as typed, for QuBe Sync's 422 to name), and a blank one left out. The form's
 * data[name] is read whether your app's urlencoded parser nests it or not.
 */
function answerData(choice, form) {
  const nested = (form && typeof form.data === "object" && form.data) || {};
  const data = {};
  for (const field of choice.fields || []) {
    const flat = form ? form[`data[${field.name}]`] : undefined;
    const sent = flat !== undefined && flat !== null ? flat : nested[field.name];
    const text = String(sent === undefined || sent === null ? "" : sent).trim();
    if (field.type === "boolean") {
      data[field.name] = text === "true";
    } else if (text) {
      data[field.name] = field.type === "number" ? number(text) : text;
    }
  }
  return data;
}

// A whole number as an integer, a decimal as a number, and anything else as typed.
function number(text) {
  if (/^-?\d+$/.test(text)) return Number.parseInt(text, 10);
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : text;
}

/** What QuBe Sync said was wrong with an answer, in words (its errors.detail). */
function refusalMessage(err) {
  const errors = err && err.errors;
  const detail = errors && typeof errors === "object" && !Array.isArray(errors) ? errors.detail : null;
  if (detail) return `QuBe Sync couldn't take that answer: ${detail}`;
  return "QuBe Sync couldn't take that answer.";
}

module.exports = {
  QUESTION_CHANGED,
  NOT_STARTING,
  NOT_QUIET,
  REDELIVERY_REFUSED,
  NO_ANSWER,
  SEARCH_LIMITS,
  authorizedRun,
  answerQuestion,
  searchQuestion,
  retryStart,
  redeliver,
  answerData,
  refusalMessage,
};
