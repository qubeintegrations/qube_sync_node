// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks ar refund credit card operations. Types: ar_refund_credit_card.d.ts. */
class ArRefundCreditCard {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create ar refund credit card.
   * @param {string} connectionId
   * @param {import("./ar_refund_credit_card").ArRefundCreditCardCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/ar-refund-credit-cards/create-ar-refund-credit-card
   */
  create(connectionId, params, options) {
    return this.#client.queue("ar_refund_credit_card.create", connectionId, params, options);
  }

  /**
   * List ar refund credit cards (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./ar_refund_credit_card").ArRefundCreditCardQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/ar-refund-credit-cards/list-ar-refund-credit-cards
   */
  query(connectionId, params, options) {
    return this.#client.queue("ar_refund_credit_card.query", connectionId, params, options);
  }
}

module.exports = { ArRefundCreditCard };
