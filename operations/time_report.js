// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks time report operations. Types: time_report.d.ts. */
class TimeReport {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List time reports.
   * @param {string} connectionId
   * @param {import("./time_report").TimeReportQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/time-reports/list-time-reports
   */
  query(connectionId, params, options) {
    return this.#client.queue("time_report.query", connectionId, params, options);
  }
}

module.exports = { TimeReport };
