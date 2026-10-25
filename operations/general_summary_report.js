// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks general summary report operations. Types: general_summary_report.d.ts. */
class GeneralSummaryReport {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List general summary reports.
   * @param {string} connectionId
   * @param {import("./general_summary_report").GeneralSummaryReportQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/general-summary-reports/list-general-summary-reports
   */
  query(connectionId, params, options) {
    return this.#client.queue("general_summary_report.query", connectionId, params, options);
  }
}

module.exports = { GeneralSummaryReport };
