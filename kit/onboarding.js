"use strict";

// Connects a customer's QuickBooks Desktop. QuBe Sync hosts the setup and walks them through the
// Web Connector, on the computer where QuickBooks is installed, and tells your app how it went by
// webhook (your connection class, a ConnectionEvents): connection.connected, or
// connection.setup_cancelled.

const { client } = require("./client");
const { settings } = require("./settings");

/**
 * Onboarding for the signed-in customer (from a "Connect QuickBooks Desktop" button, best clicked
 * on the computer where QuickBooks is installed): their connection, made the first time and the
 * same one after that, with its webhook URL brought up to date and a fresh link. Resolves to
 * { status: 303, location } (the setup page), or { status: 401 } when currentAccount finds no
 * account. Until connection.connected comes, show the account as waiting for QuickBooks: the
 * setup doesn't come back here.
 */
async function startOnboarding(request) {
  const current = settings();
  const account = await current.currentAccount(request);
  if (account === null || account === undefined) {
    console.warn("QuBe Sync: onboarding refused: currentAccount found no signed-in account (is the route behind your sign-in?)");
    return { status: 401 };
  }

  // Where QuBe Sync says the connection is set up (connection.connected): your connection
  // class, by this account's id.
  const events = new current.connection(account);
  const webhookUrl = events.webhookUrl();
  const connectionId = await events.savedConnectionId();
  let connection;
  if (connectionId) {
    // Connected before: the same connection, its webhook URL brought up to date, with a fresh
    // link.
    await client().updateConnection(connectionId, { webhookUrl });
    connection = await client().regenerateOnboarding(connectionId);
  } else {
    connection = await client().createConnection({ webhookUrl });
    await events.saveConnectionId(connection.id);
  }
  return { status: 303, location: connection.links.onboarding };
}

module.exports = { startOnboarding };
