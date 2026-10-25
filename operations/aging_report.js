// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks aging report operations. Types: aging_report.d.ts. */
class AgingReport {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List aging reports.
   * @param {string} connectionId
   * @param {import("./aging_report").AgingReportQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/aging-reports/list-aging-reports
   */
  query(connectionId, params, options) {
    return this.#client.queue("aging_report.query", connectionId, params, options);
  }
}

module.exports = { AgingReport };
