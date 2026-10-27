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
const { client, isNoAnswer } = require("./client");
const { Connection, Run, QueuedRequest, recordKey } = require("./records");
const { SyncStatus } = require("./sync-status");
const { Operation } = require("./operation");
const { ConnectionEvents } = require("./connection-events");
const { PlainRequest } = require("./request");
const { pruneRuns } = require("./prune");
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
  DAY_MS: settingsModule.DAY_MS,
  // Errors
  NotConfigured: errors.NotConfigured,
  UnknownOperation: errors.UnknownOperation,
  NotReady: errors.NotReady,
  NotConnected: errors.NotConnected,
  MissingReference: errors.MissingReference,
  StoreConflict: errors.StoreConflict,
  RealtimeRequired: errors.RealtimeRequired,
  APIError,
  // The store
  memoryStore,
  STORE_METHODS: store.STORE_METHODS,
  STORE_COLUMNS: store.STORE_COLUMNS,
  SCHEMA_PATH: path.join(__dirname, "schema.sql"),
  familyFor: store.familyFor,
  // The API
  client,
  isNoAnswer,
  // Rows
  Connection,
  Run,
  QueuedRequest,
  recordKey,
  SyncStatus,
  // Bases
  Operation,
  ConnectionEvents,
  PlainRequest,
  // Pruning
  pruneRuns,
  // The webhook endpoint and the job
  receiveWebhook: job.receiveWebhook,
  run: job.run,
  job: job.job,
  retryWait: job.retryWait,
  MAX_BODY_BYTES: job.MAX_BODY_BYTES,
  SIGNATURE_HINTS: job.SIGNATURE_HINTS,
  // Onboarding
  connectQuickbooks: onboarding.connectQuickbooks,
  resendOnboarding: onboarding.resendOnboarding,
  disconnectQuickbooks: onboarding.disconnectQuickbooks,
  RUNS_GOING: onboarding.RUNS_GOING,
  DISCONNECT_NO_ANSWER: onboarding.DISCONNECT_NO_ANSWER,
  // Questions, the start retry and the redelivery
  QUESTION_CHANGED: questions.QUESTION_CHANGED,
  NOT_STARTING: questions.NOT_STARTING,
  NOT_QUIET: questions.NOT_QUIET,
  REDELIVERY_REFUSED: questions.REDELIVERY_REFUSED,
  NO_ANSWER: questions.NO_ANSWER,
  SEARCH_LIMITS: questions.SEARCH_LIMITS,
  answerQuestion: questions.answerQuestion,
  searchQuestion: questions.searchQuestion,
  retryStart: questions.retryStart,
  redeliver: questions.redeliver,
  answerData: questions.answerData,
  refusalMessage: questions.refusalMessage,
  // HTML
  renderQuestion: render.renderQuestion,
  renderRunStatus: render.renderRunStatus,
  escapeHtml: render.escapeHtml,
  SEARCH_SCRIPT: render.SEARCH_SCRIPT,
  ROWS_SCRIPT: render.ROWS_SCRIPT,
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
