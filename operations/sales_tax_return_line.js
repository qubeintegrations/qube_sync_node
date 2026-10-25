// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks sales tax return line operations. Types: sales_tax_return_line.d.ts. */
class SalesTaxReturnLine {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List sales tax return lines.
   * @param {string} connectionId
   * @param {import("./sales_tax_return_line").SalesTaxReturnLineQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-return-lines/list-sales-tax-return-lines
   */
  query(connectionId, params, options) {
    return this.#client.queue("sales_tax_return_line.query", connectionId, params, options);
  }
}

module.exports = { SalesTaxReturnLine };
