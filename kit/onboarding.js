"use strict";

// Connects a customer's QuickBooks Desktop. QuBe Sync hosts the setup and walks them through the
// Web Connector, on the computer where QuickBooks is installed, and tells the connection how it
// went by webhook (ConnectionEvents, then your connectionEvents class): connection.connected, or
// connection.setup_cancelled.
//
// An account can have any number of connections (a company file each), so each is its own row
// (Connection), owned by the signed-in account (the currentAccount setting). Both routes go
// behind your sign-in.

const { APIError } = require("../client");
const { client, isNoAnswer } = require("./client");
const { Connection, Run, blank, recordKey } = require("./records");
const { settings } = require("./settings");
const { t } = require("./messages");

// The statuses of a connection that has never connected.
const NEVER_CONNECTED = Object.freeze(["pending", "setup_cancelled"]);

/**
 * POST quickbooks/connections, from a "Connect QuickBooks Desktop" button, with an optional name.
 * Best clicked on the computer where QuickBooks is installed. It sends the account's newest
 * connection that has never connected (pending, or its setup cancelled) back through setup, so
 * clicking Connect again doesn't pile up connections; it makes a new one when the account has
 * none, or with another: true (new=1, from a "Connect another company file" button). A new row is
 * written first, so the connection's webhook URL names it; if QuBe Sync doesn't answer, the row is
 * left without a qubeId and the next click picks it up. Until connection.connected comes, show it
 * as waiting for QuickBooks: the setup doesn't come back here.
 *
 * Resolves to { status: 303, location } (the setup page), or { status: 401 } when currentAccount
 * finds no signed-in account.
 *
 * simulated: true (simulated=1), outside production (NODE_ENV), connects a simulated company file
 * on a new row instead, connected as it's made, and resolves to { status: 303 }: back to the page.
 * In production it's { status: 404 }.
 */
async function connectQuickbooks({ request, name, another = false, simulated = false } = {}) {
  const account = await signedInAccount(request, "a connect");
  if (!account) return { status: 401 };
  if (simulated) return connectSimulated(account, name);

  if (!another) {
    // Newest first, as the store lists them.
    const waiting = (await Connection.ownedBy(account)).find((connection) => NEVER_CONNECTED.includes(connection.status));
    if (waiting) return sendToSetup(waiting);
  }

  const made = await Connection.create(account, { name: connectionName(name) });
  return sendToSetup(made, { fresh: true });
}

/**
 * POST quickbooks/connections/:id/onboarding: sends one of the signed-in account's connections
 * back through setup (a new company file, a Web Connector set up again), with its webhook URL
 * brought up to date. Resolves to { status: 303, location }, { status: 401 } with no signed-in
 * account, or { status: 404 } for a connection that isn't there or is another account's.
 */
async function resendOnboarding({ request, id } = {}) {
  const account = await signedInAccount(request, "an onboarding");
  if (!account) return { status: 401 };

  const connection = await Connection.get(String(id));
  if (!connection || !isOwnedBy(connection, account)) return { status: 404 };

  return sendToSetup(connection);
}

// What the page says when it can't, as message keys (kit/messages.js); the results carry the words.
const RUNS_GOING = "errors.still_syncing";
const DISCONNECT_NO_ANSWER = "errors.disconnect_unreachable";

/**
 * DELETE quickbooks/connections/:id: disconnects one of the signed-in account's connections.
 * QuBe Sync deletes its connection (already gone counts), then connection.disconnect() deletes the
 * row with its runs, requests, QuickBooks ids and sync marks. Resolves to { status: 303 } (back to
 * the page), { status: 303, error } (RUNS_GOING while a run or request hasn't ended;
 * DISCONNECT_NO_ANSWER), { status: 401 }, or { status: 404 } for another account's connection.
 */
async function disconnectQuickbooks({ request, id } = {}) {
  const account = await signedInAccount(request, "a disconnect");
  if (!account) return { status: 401 };

  const connection = await Connection.get(String(id));
  if (!connection || !isOwnedBy(connection, account)) return { status: 404 };
  if (await connection.store.hasWorkGoing(connection.id, { endedStates: Run.ENDED_STATES })) return { status: 303, error: t(RUNS_GOING) };

  try {
    await deleteOnQube(connection);
  } catch (err) {
    if (isNoAnswer(err)) return { status: 303, error: t(DISCONNECT_NO_ANSWER) };
    throw err;
  }
  await connection.disconnect();
  return { status: 303 };
}

// Already gone there (404) is gone.
async function deleteOnQube(connection) {
  if (blank(connection.qubeId)) return;
  try {
    await client().deleteConnection(connection.qubeId);
  } catch (err) {
    if (!(err instanceof APIError && err.status === 404)) throw err;
  }
}

// Never in production: a customer's user can't connect a fake company file.
async function connectSimulated(account, name) {
  if (process.env.NODE_ENV === "production") return { status: 404 };

  const connection = await Connection.create(account, { name: connectionName(name) });
  const made = await client().createConnection({ webhookUrl: connection.webhookUrl(), name: connection.name || undefined, type: "simulated" });
  await connection.update({ qubeId: String(made.id) });
  return { status: 303 };
}

async function signedInAccount(request, what) {
  const account = await settings().currentAccount(request);
  if (account === null || account === undefined) {
    console.warn(`QuBe Sync: refused ${what}: currentAccount found no signed-in account (is the route behind your sign-in?)`);
    return null;
  }
  return account;
}

// The connection is the account's: the same type and id the row keeps.
function isOwnedBy(connection, account) {
  const [type, id] = recordKey(account);
  return connection.ownerType === type && String(connection.ownerId) === id;
}

function connectionName(name) {
  const text = typeof name === "string" ? name.trim() : "";
  return text === "" ? null : text.slice(0, 255);
}

// fresh: a row this request wrote, which no earlier create can have been made for.
async function sendToSetup(connection, { fresh = false } = {}) {
  // An earlier create that landed before its id was saved: that connection, not a second one.
  if (!fresh && blank(connection.qubeId)) await connection.adoptQubeConnection();
  let made;
  if (!blank(connection.qubeId)) {
    await client().updateConnection(connection.qubeId, { webhookUrl: connection.webhookUrl() });
    made = await client().regenerateOnboarding(connection.qubeId);
  } else {
    made = await client().createConnection({
      webhookUrl: connection.webhookUrl(),
      name: connection.name || undefined,
      type: settings().connectionType,
    });
    await connection.update({ qubeId: String(made.id) });
  }

  // 303, so the browser follows the POST with a GET.
  return { status: 303, location: made.links.onboarding };
}

module.exports = { connectQuickbooks, resendOnboarding, disconnectQuickbooks, RUNS_GOING, DISCONNECT_NO_ANSWER };
