// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll item operations. Types: payroll_item.d.ts. */
class PayrollItem {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List payroll items.
   * @param {string} connectionId
   * @param {import("./payroll_item").PayrollItemQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-items/list-payroll-items
   */
  query(connectionId, params, options) {
    return this.#client.queue("payroll_item.query", connectionId, params, options);
  }
}

module.exports = { PayrollItem };
