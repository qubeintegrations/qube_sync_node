// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll liability adjustment operations. Types: payroll_liability_adjustment.d.ts. */
class PayrollLiabilityAdjustment {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payroll liability adjustment.
   * @param {string} connectionId
   * @param {import("./payroll_liability_adjustment").PayrollLiabilityAdjustmentCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-liability-adjustments/create-payroll-liability-adjustment
   */
  create(connectionId, params, options) {
    return this.#client.queue("payroll_liability_adjustment.create", connectionId, params, options);
  }

  /**
   * List payroll liability adjustments.
   * @param {string} connectionId
   * @param {import("./payroll_liability_adjustment").PayrollLiabilityAdjustmentQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-liability-adjustments/list-payroll-liability-adjustments
   */
  query(connectionId, params, options) {
    return this.#client.queue("payroll_liability_adjustment.query", connectionId, params, options);
  }
}

module.exports = { PayrollLiabilityAdjustment };
