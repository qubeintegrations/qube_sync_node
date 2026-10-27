"use strict";

const { Client, APIError } = require("../client");
const { settings, settingsVersion } = require("./settings");

let made = null;
let madeAt = -1;

// What a call that got no answer throws: a refused, dropped or timed-out connection.
const NO_ANSWER_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ECONNABORTED",
  "EPIPE",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EAI_AGAIN",
  "ENOTFOUND",
]);

/**
 * QuBe Sync's API, through the library's Client, made once from the apiKey and baseUrl settings
 * (QUBE_API_KEY and QUBE_URL): createConnection, startRun, answer, search, getRun, cancelRun,
 * queue and the rest. A non-2xx answer throws APIError (status, code, message, body). A
 * configure(...) after it's made makes a new one.
 */
function client() {
  if (!made || madeAt !== settingsVersion()) {
    const current = settings();
    made = new Client({
      apiKey: current.apiKey,
      baseUrl: current.baseUrl,
      // A call QuBe Sync didn't answer, sent again (safe calls only, within 60 seconds).
      onRetry: (retry) => {
        const { method, url, delayMs, status, error } = retry;
        const why = status || (error && (error.code || error.name));
        console.warn(`QuBe Sync: retrying ${method} ${url} (${why}) in ${delayMs} ms`);
      },
    });
    madeAt = settingsVersion();
  }
  return made;
}

// QuBe Sync refused the call (a 4xx): nothing it would have done was done.
function isRefused(err) {
  return err instanceof APIError && err.status >= 400 && err.status <= 499;
}

// The call got no answer, so it may or may not have been taken.
function isNoAnswer(err) {
  return Boolean(err) && !(err instanceof APIError) && NO_ANSWER_CODES.has(err.code);
}

module.exports = { client, isRefused, isNoAnswer };
