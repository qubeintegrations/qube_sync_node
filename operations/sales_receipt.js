// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks sales receipt operations. Types: sales_receipt.d.ts. */
class SalesReceipt {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create sales receipt.
   * @param {string} connectionId
   * @param {import("./sales_receipt").SalesReceiptCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-receipts/create-sales-receipt
   */
  create(connectionId, params, options) {
    return this.#client.queue("sales_receipt.create", connectionId, params, options);
  }

  /**
   * List sales receipts (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./sales_receipt").SalesReceiptQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-receipts/list-sales-receipts
   */
  query(connectionId, params, options) {
    return this.#client.queue("sales_receipt.query", connectionId, params, options);
  }

  /**
   * Update sales receipt.
   * @param {string} connectionId
   * @param {import("./sales_receipt").SalesReceiptUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-receipts/update-sales-receipt
   */
  update(connectionId, params, options) {
    return this.#client.queue("sales_receipt.update", connectionId, params, options);
  }
}

module.exports = { SalesReceipt };
