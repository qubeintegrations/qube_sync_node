// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll item non wage operations. Types: payroll_item_non_wage.d.ts. */
class PayrollItemNonWage {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List payroll item non wages.
   * @param {string} connectionId
   * @param {import("./payroll_item_non_wage").PayrollItemNonWageQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-non-wages/list-payroll-item-non-wages
   */
  query(connectionId, params, options) {
    return this.#client.queue("payroll_item_non_wage.query", connectionId, params, options);
  }
}

module.exports = { PayrollItemNonWage };
