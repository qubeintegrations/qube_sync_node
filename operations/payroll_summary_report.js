// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll summary report operations. Types: payroll_summary_report.d.ts. */
class PayrollSummaryReport {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List payroll summary reports.
   * @param {string} connectionId
   * @param {import("./payroll_summary_report").PayrollSummaryReportQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-summary-reports/list-payroll-summary-reports
   */
  query(connectionId, params, options) {
    return this.#client.queue("payroll_summary_report.query", connectionId, params, options);
  }
}

module.exports = { PayrollSummaryReport };
