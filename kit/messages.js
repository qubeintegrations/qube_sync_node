"use strict";

// Everything the kit's screens and routes say to your users, in English, by key (the same keys as
// qube_rails' qube_rails.* I18n). Reword or translate any of them with the messages setting, or a
// render's messages option (README, "Wording and translations"). Nothing here names QuBe Sync.

const MESSAGES = deepFreeze({
  status: {
    in_quickbooks: "In QuickBooks",
    added: "Added to QuickBooks",
    done: "Done",
    done_with: "Done: %{outcome}",
    failed: "Couldn't sync",
    not_started: "it couldn't be sent",
    cancelled: "Cancelled",
    cancel_reason: "it was stopped before it finished",
    needs_answer: "Needs your answer",
    starting: "Sending to QuickBooks",
    unconfirmed: "Still waiting for QuickBooks",
    running: "Syncing with QuickBooks",
    quiet: "No update from QuickBooks for a while.",
    check_for_updates: "Check for updates",
    try_again: "Try sending again",
    waiting_for_quickbooks: "Waiting for QuickBooks",
    stalled: {
      not_checking_in:
        "QuickBooks hasn't checked in for a while, so this is waiting. Make sure the computer with QuickBooks is on and the Web Connector is running.",
      quickbooks_unavailable: "The Web Connector is checking in but can't open QuickBooks. Open the company file in QuickBooks on that computer.",
      other: "Syncing with QuickBooks has stopped for now. Check the computer with QuickBooks and its Web Connector.",
    },
  },
  errors: {
    not_starting: "This was already sent, so there's nothing to try again.",
    not_quiet: "This was updated recently. Check again in a few minutes.",
    no_update_yet: "There's no update yet. Check again in a few minutes.",
    checked_just_now: "That was checked a moment ago. Try again in a minute.",
    unreachable: "Couldn't reach QuickBooks' sync service just now. Try again in a minute.",
    disconnect_unreachable: "Couldn't reach QuickBooks' sync service just now. Try disconnecting again in a minute.",
    still_syncing: "Something is still syncing with this company file. Let it finish, or answer its question, then disconnect.",
    question_changed: "This question changed after the page loaded, so your answer wasn't sent. The page now shows the latest.",
    answer_refused: "That answer couldn't be used. Check it and try again.",
    answer_refused_with: "That answer couldn't be used: %{detail}",
  },
  question: {
    set_all: "Set all to:",
    use_pick: "Use this one",
    use_for_all: "Use for all %{count}",
    or: "or",
    pick_a_match: "Pick one of the matches.",
    no_matches: "No matches",
    searching: "Searching…",
    search_failed: "Search isn't available right now. Try again in a moment.",
  },
});

function deepFreeze(object) {
  for (const value of Object.values(object)) if (isObject(value)) deepFreeze(value);
  return Object.freeze(object);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Every key, dotted: "status.failed", "status.stalled.other".
function keysOf(node, prefix = "") {
  return Object.entries(node).flatMap(([key, value]) => (isObject(value) ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`]));
}

const MESSAGE_KEYS = Object.freeze(keysOf(MESSAGES));

/**
 * Your words for some keys, checked: nested ({ status: { running: "..." } }) or dotted
 * ({ "status.running": "..." }), each a string. Returns them flat, by dotted key. An unknown key
 * throws, listing the keys there are.
 */
function checkMessages(messages, where = "messages") {
  if (!isObject(messages)) throw new TypeError(`QuBe Sync: ${where} is an object of key → words`);
  const flat = {};
  const walk = (node, prefix) => {
    for (const [key, value] of Object.entries(node)) {
      const name = `${prefix}${key}`;
      if (isObject(value)) {
        walk(value, `${name}.`);
      } else if (!MESSAGE_KEYS.includes(name)) {
        throw new TypeError(`QuBe Sync: ${where} has no key ${JSON.stringify(name)}: it takes ${MESSAGE_KEYS.join(", ")}`);
      } else if (typeof value !== "string") {
        throw new TypeError(`QuBe Sync: ${where}.${name} must be a string`);
      } else {
        flat[name] = value;
      }
    }
  };
  walk(messages, "");
  return Object.freeze(flat);
}

/**
 * The words for key: overrides' (flat, as checkMessages returns), else the English default, with
 * each %{name} filled from vars.
 */
function message(key, vars, overrides) {
  let text = overrides && Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : undefined;
  if (text === undefined) {
    text = key.split(".").reduce((node, part) => (isObject(node) ? node[part] : undefined), MESSAGES);
    if (typeof text !== "string") throw new TypeError(`QuBe Sync: no message ${JSON.stringify(key)}`);
  }
  if (!vars) return text;
  return text.replace(/%\{(\w+)\}/g, (whole, name) => (vars[name] === undefined || vars[name] === null ? whole : String(vars[name])));
}

module.exports = { MESSAGES, MESSAGE_KEYS, checkMessages, message };

/** The words for key, from the messages setting (and extra, checked flat words, over it), else English. */
function t(key, vars, extra) {
  const { settings } = require("./settings");
  const set = settings().messages;
  return message(key, vars, extra ? { ...set, ...extra } : set);
}

module.exports.t = t;
