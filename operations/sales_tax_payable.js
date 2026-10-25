// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks sales tax payable operations. Types: sales_tax_payable.d.ts. */
class SalesTaxPayable {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List sales tax payables.
   * @param {string} connectionId
   * @param {import("./sales_tax_payable").SalesTaxPayableQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-payables/list-sales-tax-payables
   */
  query(connectionId, params, options) {
    return this.#client.queue("sales_tax_payable.query", connectionId, params, options);
  }
}

module.exports = { SalesTaxPayable };
