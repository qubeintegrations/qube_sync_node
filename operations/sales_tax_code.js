// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks sales tax code operations. Types: sales_tax_code.d.ts. */
class SalesTaxCode {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create sales tax code.
   * @param {string} connectionId
   * @param {import("./sales_tax_code").SalesTaxCodeCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-codes/create-sales-tax-code
   */
  create(connectionId, params, options) {
    return this.#client.queue("sales_tax_code.create", connectionId, params, options);
  }

  /**
   * List sales tax codes.
   * @param {string} connectionId
   * @param {import("./sales_tax_code").SalesTaxCodeQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-codes/list-sales-tax-codes
   */
  query(connectionId, params, options) {
    return this.#client.queue("sales_tax_code.query", connectionId, params, options);
  }

  /**
   * Update sales tax code.
   * @param {string} connectionId
   * @param {import("./sales_tax_code").SalesTaxCodeUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-codes/update-sales-tax-code
   */
  update(connectionId, params, options) {
    return this.#client.queue("sales_tax_code.update", connectionId, params, options);
  }
}

module.exports = { SalesTaxCode };
