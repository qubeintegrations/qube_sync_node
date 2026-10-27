"use strict";

const { Run } = require("./records");
const { DAY_MS, settings } = require("./settings");

const BATCH = 500;

/**
 * Deletes ended runs (with their notifications) and ended plain requests (with their deliveries)
 * older than the pruneRunsAfter setting, never within a day of their end: a webhook for a deleted
 * row answers 404, which QuBe Sync retries for hours. QuickBooks links and sync marks stay. Does
 * nothing until the setting is set. Schedule it (once a day, say). Resolves to what it deleted.
 */
async function pruneRuns({ now = new Date() } = {}) {
  const after = settings().pruneRunsAfter;
  if (!after) return { runs: 0, requests: 0 };

  const before = new Date(now.getTime() - Math.max(after, DAY_MS));
  const { store } = settings();
  const runs = await inBatches((limit) => store.pruneRuns({ states: Run.ENDED_STATES, before, limit }));
  const requests = await inBatches((limit) => store.pruneRequests({ before, limit }));
  return { runs, requests };
}

async function inBatches(prune) {
  let total = 0;
  for (;;) {
    const deleted = await prune(BATCH);
    total += deleted;
    if (deleted < BATCH) return total;
  }
}

module.exports = { pruneRuns };
