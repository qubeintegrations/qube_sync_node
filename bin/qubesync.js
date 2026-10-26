#!/usr/bin/env node
"use strict";

// npx qubesync workflows [--drafts] [--check] [--output qube-workflows.js]
//
// Writes your app's typed workflow starts (qubesync/workflow-types). QUBE_API_KEY is your app's
// API key; QUBE_BASE_URL is https://qubesync.com unless set.

const { cli } = require("../workflow-types");

cli(process.argv.slice(2)).then(
  (status) => {
    process.exitCode = status;
  },
  (error) => {
    process.stderr.write(`qubesync: ${error && error.stack ? error.stack : error}\n`);
    process.exitCode = 1;
  }
);
