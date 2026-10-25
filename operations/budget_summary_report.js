// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks budget summary report operations. Types: budget_summary_report.d.ts. */
class BudgetSummaryReport {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List budget summary reports.
   * @param {string} connectionId
   * @param {import("./budget_summary_report").BudgetSummaryReportQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/budget-summary-reports/list-budget-summary-reports
   */
  query(connectionId, params, options) {
    return this.#client.queue("budget_summary_report.query", connectionId, params, options);
  }
}

module.exports = { BudgetSummaryReport };
