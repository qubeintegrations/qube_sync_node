// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll liability check operations. Types: payroll_liability_check.d.ts. */
class PayrollLiabilityCheck {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List payroll liability checks.
   * @param {string} connectionId
   * @param {import("./payroll_liability_check").PayrollLiabilityCheckQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-liability-checks/list-payroll-liability-checks
   */
  query(connectionId, params, options) {
    return this.#client.queue("payroll_liability_check.query", connectionId, params, options);
  }
}

module.exports = { PayrollLiabilityCheck };
