// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item payment operations. Types: item_payment.d.ts. */
class ItemPayment {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item payment.
   * @param {string} connectionId
   * @param {import("./item_payment").ItemPaymentCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-payments/create-item-payment
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_payment.create", connectionId, params, options);
  }

  /**
   * List item payments (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_payment").ItemPaymentQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-payments/list-item-payments
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_payment.query", connectionId, params, options);
  }

  /**
   * Update item payment.
   * @param {string} connectionId
   * @param {import("./item_payment").ItemPaymentUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-payments/update-item-payment
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_payment.update", connectionId, params, options);
  }
}

module.exports = { ItemPayment };
