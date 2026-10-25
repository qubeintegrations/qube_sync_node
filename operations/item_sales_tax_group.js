// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item sales tax group operations. Types: item_sales_tax_group.d.ts. */
class ItemSalesTaxGroup {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item sales tax group.
   * @param {string} connectionId
   * @param {import("./item_sales_tax_group").ItemSalesTaxGroupCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-sales-tax-groups/create-item-sales-tax-group
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_sales_tax_group.create", connectionId, params, options);
  }

  /**
   * List item sales tax groups (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_sales_tax_group").ItemSalesTaxGroupQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-sales-tax-groups/list-item-sales-tax-groups
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_sales_tax_group.query", connectionId, params, options);
  }

  /**
   * Update item sales tax group.
   * @param {string} connectionId
   * @param {import("./item_sales_tax_group").ItemSalesTaxGroupUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-sales-tax-groups/update-item-sales-tax-group
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_sales_tax_group.update", connectionId, params, options);
  }
}

module.exports = { ItemSalesTaxGroup };
