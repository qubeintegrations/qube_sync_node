// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll detail report operations. Types: payroll_detail_report.d.ts. */
class PayrollDetailReport {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List payroll detail reports.
   * @param {string} connectionId
   * @param {import("./payroll_detail_report").PayrollDetailReportQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-detail-reports/list-payroll-detail-reports
   */
  query(connectionId, params, options) {
    return this.#client.queue("payroll_detail_report.query", connectionId, params, options);
  }
}

module.exports = { PayrollDetailReport };
