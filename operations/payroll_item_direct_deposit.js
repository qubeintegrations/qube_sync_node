// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll item direct deposit operations. Types: payroll_item_direct_deposit.d.ts. */
class PayrollItemDirectDeposit {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payroll item direct deposit.
   * @param {string} connectionId
   * @param {import("./payroll_item_direct_deposit").PayrollItemDirectDepositCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-direct-deposits/create-payroll-item-direct-deposit
   */
  create(connectionId, params, options) {
    return this.#client.queue("payroll_item_direct_deposit.create", connectionId, params, options);
  }

  /**
   * Update payroll item direct deposit.
   * @param {string} connectionId
   * @param {import("./payroll_item_direct_deposit").PayrollItemDirectDepositUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-direct-deposits/update-payroll-item-direct-deposit
   */
  update(connectionId, params, options) {
    return this.#client.queue("payroll_item_direct_deposit.update", connectionId, params, options);
  }
}

module.exports = { PayrollItemDirectDeposit };
