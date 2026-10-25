// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll item wage operations. Types: payroll_item_wage.d.ts. */
class PayrollItemWage {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payroll item wage.
   * @param {string} connectionId
   * @param {import("./payroll_item_wage").PayrollItemWageCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-wages/create-payroll-item-wage
   */
  create(connectionId, params, options) {
    return this.#client.queue("payroll_item_wage.create", connectionId, params, options);
  }

  /**
   * List payroll item wages.
   * @param {string} connectionId
   * @param {import("./payroll_item_wage").PayrollItemWageQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-wages/list-payroll-item-wages
   */
  query(connectionId, params, options) {
    return this.#client.queue("payroll_item_wage.query", connectionId, params, options);
  }

  /**
   * Update payroll item wage.
   * @param {string} connectionId
   * @param {import("./payroll_item_wage").PayrollItemWageUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-wages/update-payroll-item-wage
   */
  update(connectionId, params, options) {
    return this.#client.queue("payroll_item_wage.update", connectionId, params, options);
  }
}

module.exports = { PayrollItemWage };
