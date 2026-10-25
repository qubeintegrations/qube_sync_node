// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item sales tax operations. Types: item_sales_tax.d.ts. */
class ItemSalesTax {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item sales tax.
   * @param {string} connectionId
   * @param {import("./item_sales_tax").ItemSalesTaxCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-sales-taxes/create-item-sales-tax
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_sales_tax.create", connectionId, params, options);
  }

  /**
   * List item sales taxes (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_sales_tax").ItemSalesTaxQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-sales-taxes/list-item-sales-taxes
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_sales_tax.query", connectionId, params, options);
  }

  /**
   * Update item sales tax.
   * @param {string} connectionId
   * @param {import("./item_sales_tax").ItemSalesTaxUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-sales-taxes/update-item-sales-tax
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_sales_tax.update", connectionId, params, options);
  }
}

module.exports = { ItemSalesTax };
