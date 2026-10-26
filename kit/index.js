"use strict";

// qubesync/kit: QuBe Sync's integration kit without a framework. Everything here is the same for
// every app: your app's code (its config, its store, its operation classes, its connection events
// class) extends and configures it, and a framework adapter (qubesync/express) mounts its routes.
// Update it with `npm update qubesync`; don't copy it into your app.

const path = require("path");

const { APIError } = require("../client");
const settingsModule = require("./settings");
const errors = require("./errors");
const store = require("./store");
const { memoryStore } = require("./memory-store");
const { client } = require("./client");
const { Connection, Run, recordKey } = require("./records");
const { Operation } = require("./operation");
const { ConnectionEvents } = require("./connection-events");
const job = require("./job");
const onboarding = require("./onboarding");
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
  DEFAULT_JOB_ATTEMPTS: settingsModule.DEFAULT_JOB_ATTEMPTS,
  // Errors
  NotConfigured: errors.NotConfigured,
  UnknownOperation: errors.UnknownOperation,
  NotReady: errors.NotReady,
  NotConnected: errors.NotConnected,
  StoreConflict: errors.StoreConflict,
  APIError,
  // The store
  memoryStore,
  STORE_METHODS: store.STORE_METHODS,
  STORE_COLUMNS: store.STORE_COLUMNS,
  SCHEMA_PATH: path.join(__dirname, "schema.sql"),
  familyFor: store.familyFor,
  // The API
  client,
  // Rows
  Connection,
  Run,
  recordKey,
  // Bases
  Operation,
  ConnectionEvents,
  // The webhook endpoint and the job
  receiveWebhook: job.receiveWebhook,
  run: job.run,
  job: job.job,
  retryWait: job.retryWait,
  MAX_BODY_BYTES: job.MAX_BODY_BYTES,
  // Onboarding
  connectQuickbooks: onboarding.connectQuickbooks,
  resendOnboarding: onboarding.resendOnboarding,
  // Questions and the start retry
  QUESTION_CHANGED: questions.QUESTION_CHANGED,
  NOT_STARTING: questions.NOT_STARTING,
  SEARCH_LIMITS: questions.SEARCH_LIMITS,
  answerQuestion: questions.answerQuestion,
  searchQuestion: questions.searchQuestion,
  retryStart: questions.retryStart,
  answerData: questions.answerData,
  refusalMessage: questions.refusalMessage,
  // HTML
  renderQuestion: render.renderQuestion,
  renderRunStatus: render.renderRunStatus,
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
