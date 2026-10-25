// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll year to date adjustment operations. Types: payroll_year_to_date_adjustment.d.ts. */
class PayrollYearToDateAdjustment {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payroll year to date adjustment.
   * @param {string} connectionId
   * @param {import("./payroll_year_to_date_adjustment").PayrollYearToDateAdjustmentCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-year-to-date-adjustments/create-payroll-year-to-date-adjustment
   */
  create(connectionId, params, options) {
    return this.#client.queue("payroll_year_to_date_adjustment.create", connectionId, params, options);
  }

  /**
   * List payroll year to date adjustments.
   * @param {string} connectionId
   * @param {import("./payroll_year_to_date_adjustment").PayrollYearToDateAdjustmentQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-year-to-date-adjustments/list-payroll-year-to-date-adjustments
   */
  query(connectionId, params, options) {
    return this.#client.queue("payroll_year_to_date_adjustment.query", connectionId, params, options);
  }
}

module.exports = { PayrollYearToDateAdjustment };
