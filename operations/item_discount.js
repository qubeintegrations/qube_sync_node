// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item discount operations. Types: item_discount.d.ts. */
class ItemDiscount {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item discount.
   * @param {string} connectionId
   * @param {import("./item_discount").ItemDiscountCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-discounts/create-item-discount
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_discount.create", connectionId, params, options);
  }

  /**
   * List item discounts (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_discount").ItemDiscountQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-discounts/list-item-discounts
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_discount.query", connectionId, params, options);
  }

  /**
   * Update item discount.
   * @param {string} connectionId
   * @param {import("./item_discount").ItemDiscountUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-discounts/update-item-discount
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_discount.update", connectionId, params, options);
  }
}

module.exports = { ItemDiscount };
