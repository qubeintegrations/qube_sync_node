"use strict";

// qubesync/kit: QuBe Sync's integration kit without a framework. Everything here is the same for
// every app: your app's code (its config, its operation classes, its connection class) extends and
// configures it, and a framework adapter (qubesync/express) mounts its routes. Update it with
// `npm update qubesync`; don't copy it into your app.

const { APIError } = require("../client");
const settingsModule = require("./settings");
const { client, connectionWebhookUrl } = require("./client");
const { Operation } = require("./operation");
const { ConnectionEvents } = require("./connection-events");
const { receiveWebhook, run } = require("./job");
const { startOnboarding } = require("./onboarding");
const questions = require("./questions");
const render = require("./render");
const mapping = require("./mapping");

module.exports = {
  // Settings
  configure: settingsModule.configure,
  settings: settingsModule.settings,
  resetSettings: settingsModule.resetSettings,
  Settings: settingsModule.Settings,
  SETTINGS: settingsModule.SETTINGS,
  CONFIG_FILE: settingsModule.CONFIG_FILE,
  CONNECTION_SLUG: settingsModule.CONNECTION_SLUG,
  // The API
  client,
  connectionWebhookUrl,
  APIError,
  // Bases
  Operation,
  ConnectionEvents,
  // The webhook endpoint and the job
  receiveWebhook,
  run,
  // Onboarding
  startOnboarding,
  // Questions
  QUESTION_CHANGED: questions.QUESTION_CHANGED,
  SEARCH_LIMITS: questions.SEARCH_LIMITS,
  findQuestion: questions.findQuestion,
  answerQuestion: questions.answerQuestion,
  searchQuestion: questions.searchQuestion,
  answerData: questions.answerData,
  refusalMessage: questions.refusalMessage,
  renderQuestion: render.renderQuestion,
  escapeHtml: render.escapeHtml,
  SEARCH_SCRIPT: render.SEARCH_SCRIPT,
  // Mapping helpers
  get: mapping.get,
  rows: mapping.rows,
  dig: mapping.dig,
  asString: mapping.asString,
  asNumber: mapping.asNumber,
  asInteger: mapping.asInteger,
  asDate: mapping.asDate,
  withoutNils: mapping.withoutNils,
};
