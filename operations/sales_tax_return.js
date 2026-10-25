// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks sales tax return operations. Types: sales_tax_return.d.ts. */
class SalesTaxReturn {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List sales tax returns.
   * @param {string} connectionId
   * @param {import("./sales_tax_return").SalesTaxReturnQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-returns/list-sales-tax-returns
   */
  query(connectionId, params, options) {
    return this.#client.queue("sales_tax_return.query", connectionId, params, options);
  }
}

module.exports = { SalesTaxReturn };
