"use strict";

// Your user's answers to the questions a run asks, from renderQuestion's forms on the record's
// page, and a record field's search:
//   POST <mount>/qube/questions/<operation>/<record id>         a choice, with its fields
//   GET  <mount>/qube/questions/<operation>/<record id>/search  a record field's matches, as JSON
// Each finds the record through the operations setting, as the webhooks do, and asks the
// authorizeQuestion setting before anything else. The calls to QuBe Sync are made here, with the
// API key, so the browser only ever talks to your app.

const { APIError } = require("../client");
const { client } = require("./client");
const { refuseUnauthorized, settings } = require("./settings");

const QUESTION_CHANGED = "This question has changed; reload.";
const FORBIDDEN = "QuBe Sync: the authorizeQuestion setting isn't set, so every answer is refused.";
const SEARCH_LIMITS = Object.freeze({ minQuery: 2, maxQuery: 100, maxField: 100 });

// The operation the URL names, with its record, once the signed-in user may act on it, and the
// question saved there, as { found }; else { status }: 404 for a slug none of your operations has
// (the connection's own events ask nothing), a record that isn't found, or one authorizeQuestion
// doesn't allow, and 403 (logged) while authorizeQuestion isn't set, a setup mistake to see.
async function lookup(operation, recordId, request) {
  if (typeof operation !== "string") return { status: 404 };
  const operations = settings().operations;
  if (!operations.has(operation)) return { status: 404 };
  const OperationClass = operations.get(operation);
  const record = await OperationClass.findRecord(String(recordId));
  if (record === null || record === undefined) return { status: 404 };
  const authorize = settings().authorizeQuestion;
  // Only true allows: anything else (a record, a count, a Promise left unawaited) is refused.
  const allowed = await authorize(request, record, operation);
  if (authorize === refuseUnauthorized) return { status: 403 };
  if (allowed !== true) {
    if (typeof allowed !== "boolean") {
      console.warn(`QuBe Sync: refused ${operation} ${record.id}: authorizeQuestion returned ${allowed === null ? "null" : typeof allowed}, not true or false`);
    }
    return { status: 404 };
  }
  const instance = new OperationClass(record);
  const question = await instance.savedQuestion();
  return { found: { operation: instance, question, links: (await instance.savedLinks()) || {} } };
}

// The same, as the question or null whichever the refusal.
async function findQuestion(operation, recordId, request) {
  const { found } = await lookup(operation, recordId, request);
  return found || null;
}

/**
 * Posts your user's choice, with what they filled in for its fields, to the question's
 * links.decisions. Resolves to { status: 303 } once it's in (send them back to the page), or
 * { status, message } (plain text) when it isn't: 403 while the authorizeQuestion setting isn't
 * set (logged), 404 for a record that isn't found or authorizeQuestion doesn't allow, 409 when the
 * question has changed, 422 when QuBe Sync couldn't take a field.
 * The question is forgotten once it's answered, or once QuBe Sync says it was answered or asked
 * again since (a 409, or a 400 not_awaiting_input); the run's next webhook says what came of it.
 *
 * form is the posted form: choice, and the choice's fields as data[name] (nested or not).
 */
async function answerQuestion({ operation, recordId, form, request }) {
  const { status, found } = await lookup(operation, recordId, request);
  if (!found) return { status, message: status === 403 ? FORBIDDEN : "Not found" };
  const { question, links } = found;
  const sent = form || {};
  const choice = ((question && question.choices) || []).find((c) => c.id === sent.choice);
  if (!question || !choice || !links.decisions) return { status: 409, message: QUESTION_CHANGED };

  try {
    const data = answerData(choice, sent);
    await client().answer(links.decisions, { choice: choice.id, data });
  } catch (err) {
    const status = err instanceof APIError ? err.status : 0;
    if (![400, 409, 422].includes(status)) throw err;
    // A field QuBe Sync couldn't take: its errors.detail says which.
    if (status === 422) return { status: 422, message: refusalMessage(err) };
    await found.operation.answered(question.token);
    return { status: 409, message: QUESTION_CHANGED };
  }
  await found.operation.answered(question.token);
  return { status: 303 };
}

/**
 * The matches for a record field, for what your user typed: [{ value, label, detail }], at most
 * 20, from the question's links.search, which a run sets while it asks with one. Resolves to
 * { status, json }: [] for a query under 2 or over 100 characters (nothing is asked), a 403 []
 * while the authorizeQuestion setting isn't set (logged), a 404 [] for a record that isn't found
 * or authorizeQuestion doesn't allow, a 409 [] when the question no longer searches, and QuBe
 * Sync's own 4xx with [].
 */
async function searchQuestion({ operation, recordId, field, q, request }) {
  const { status, found } = await lookup(operation, recordId, request);
  if (!found) return { status, json: [] };
  if (!found.links.search) return { status: 409, json: [] };
  const query = typeof q === "string" ? q.trim() : "";
  if (query.length < SEARCH_LIMITS.minQuery || query.length > SEARCH_LIMITS.maxQuery) return { status: 200, json: [] };
  const name = typeof field === "string" ? field : "";
  if (name === "" || name.length > SEARCH_LIMITS.maxField) return { status: 200, json: [] };

  try {
    return { status: 200, json: await client().search(found.links.search, { field: name, q: query }) };
  } catch (err) {
    const status = err instanceof APIError ? err.status : 0;
    if (status < 400 || status > 499) throw err;
    return { status, json: [] }; // the question has changed (409), say
  }
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
      const number = Number(text);
      data[field.name] = field.type === "number" && Number.isFinite(number) ? number : text;
    }
  }
  return data;
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
  SEARCH_LIMITS,
  findQuestion,
  answerQuestion,
  searchQuestion,
  answerData,
  refusalMessage,
};
