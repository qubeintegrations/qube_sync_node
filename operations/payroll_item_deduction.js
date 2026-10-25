// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll item deduction operations. Types: payroll_item_deduction.d.ts. */
class PayrollItemDeduction {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payroll item deduction.
   * @param {string} connectionId
   * @param {import("./payroll_item_deduction").PayrollItemDeductionCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-deductions/create-payroll-item-deduction
   */
  create(connectionId, params, options) {
    return this.#client.queue("payroll_item_deduction.create", connectionId, params, options);
  }

  /**
   * Update payroll item deduction.
   * @param {string} connectionId
   * @param {import("./payroll_item_deduction").PayrollItemDeductionUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-deductions/update-payroll-item-deduction
   */
  update(connectionId, params, options) {
    return this.#client.queue("payroll_item_deduction.update", connectionId, params, options);
  }
}

module.exports = { PayrollItemDeduction };
