// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item receipt operations. Types: item_receipt.d.ts. */
class ItemReceipt {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item receipt.
   * @param {string} connectionId
   * @param {import("./item_receipt").ItemReceiptCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-receipts/create-item-receipt
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_receipt.create", connectionId, params, options);
  }

  /**
   * List item receipts (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_receipt").ItemReceiptQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-receipts/list-item-receipts
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_receipt.query", connectionId, params, options);
  }

  /**
   * Update item receipt.
   * @param {string} connectionId
   * @param {import("./item_receipt").ItemReceiptUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-receipts/update-item-receipt
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_receipt.update", connectionId, params, options);
  }
}

module.exports = { ItemReceipt };
