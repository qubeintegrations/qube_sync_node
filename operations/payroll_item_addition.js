// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll item addition operations. Types: payroll_item_addition.d.ts. */
class PayrollItemAddition {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payroll item addition.
   * @param {string} connectionId
   * @param {import("./payroll_item_addition").PayrollItemAdditionCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-additions/create-payroll-item-addition
   */
  create(connectionId, params, options) {
    return this.#client.queue("payroll_item_addition.create", connectionId, params, options);
  }

  /**
   * Update payroll item addition.
   * @param {string} connectionId
   * @param {import("./payroll_item_addition").PayrollItemAdditionUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-additions/update-payroll-item-addition
   */
  update(connectionId, params, options) {
    return this.#client.queue("payroll_item_addition.update", connectionId, params, options);
  }
}

module.exports = { PayrollItemAddition };
