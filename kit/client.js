"use strict";

const { Client } = require("../client");
const { settings, settingsVersion } = require("./settings");

let made = null;
let madeAt = -1;

/**
 * QuBe Sync's API, through the library's Client, made once from the apiKey and baseUrl settings
 * (QUBE_API_KEY and QUBE_URL): createConnection, startRun, answer, search, getRun, cancelRun,
 * queue and the rest. A configure(...) after it's made makes a new one.
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
        const why = status || (error && error.message);
        console.warn(`QuBe Sync: retrying ${method} ${url} (${why}) in ${delayMs} ms`);
      },
    });
    madeAt = settingsVersion();
  }
  return made;
}

function webhookBase() {
  return settings().webhookUrl.replace(/\/+$/, "");
}

/**
 * Where a connection's own events go: the webhookUrl setting (QUBE_WEBHOOK_URL), then
 * `connection` and the id of the account that keeps it (ConnectionEvents).
 */
function connectionWebhookUrl(accountId) {
  return `${webhookBase()}/connection/${encodeURIComponent(String(accountId))}`;
}

module.exports = { client, connectionWebhookUrl, webhookBase };
