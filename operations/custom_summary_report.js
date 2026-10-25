// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks custom summary report operations. Types: custom_summary_report.d.ts. */
class CustomSummaryReport {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List custom summary reports.
   * @param {string} connectionId
   * @param {import("./custom_summary_report").CustomSummaryReportQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/custom-summary-reports/list-custom-summary-reports
   */
  query(connectionId, params, options) {
    return this.#client.queue("custom_summary_report.query", connectionId, params, options);
  }
}

module.exports = { CustomSummaryReport };
