// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll item tax operations. Types: payroll_item_tax.d.ts. */
class PayrollItemTax {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payroll item tax.
   * @param {string} connectionId
   * @param {import("./payroll_item_tax").PayrollItemTaxCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-taxes/create-payroll-item-tax
   */
  create(connectionId, params, options) {
    return this.#client.queue("payroll_item_tax.create", connectionId, params, options);
  }

  /**
   * Update payroll item tax.
   * @param {string} connectionId
   * @param {import("./payroll_item_tax").PayrollItemTaxUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-taxes/update-payroll-item-tax
   */
  update(connectionId, params, options) {
    return this.#client.queue("payroll_item_tax.update", connectionId, params, options);
  }
}

module.exports = { PayrollItemTax };
