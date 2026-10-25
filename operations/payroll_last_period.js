// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll last period operations. Types: payroll_last_period.d.ts. */
class PayrollLastPeriod {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List payroll last periods.
   * @param {string} connectionId
   * @param {import("./payroll_last_period").PayrollLastPeriodQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-last-periods/list-payroll-last-periods
   */
  query(connectionId, params, options) {
    return this.#client.queue("payroll_last_period.query", connectionId, params, options);
  }
}

module.exports = { PayrollLastPeriod };
