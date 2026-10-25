// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item subtotal operations. Types: item_subtotal.d.ts. */
class ItemSubtotal {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item subtotal.
   * @param {string} connectionId
   * @param {import("./item_subtotal").ItemSubtotalCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-subtotals/create-item-subtotal
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_subtotal.create", connectionId, params, options);
  }

  /**
   * List item subtotals (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_subtotal").ItemSubtotalQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-subtotals/list-item-subtotals
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_subtotal.query", connectionId, params, options);
  }

  /**
   * Update item subtotal.
   * @param {string} connectionId
   * @param {import("./item_subtotal").ItemSubtotalUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-subtotals/update-item-subtotal
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_subtotal.update", connectionId, params, options);
  }
}

module.exports = { ItemSubtotal };
