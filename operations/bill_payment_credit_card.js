// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks bill payment credit card operations. Types: bill_payment_credit_card.d.ts. */
class BillPaymentCreditCard {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create bill payment credit card.
   * @param {string} connectionId
   * @param {import("./bill_payment_credit_card").BillPaymentCreditCardCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/bill-payment-credit-cards/create-bill-payment-credit-card
   */
  create(connectionId, params, options) {
    return this.#client.queue("bill_payment_credit_card.create", connectionId, params, options);
  }

  /**
   * List bill payment credit cards (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./bill_payment_credit_card").BillPaymentCreditCardQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/bill-payment-credit-cards/list-bill-payment-credit-cards
   */
  query(connectionId, params, options) {
    return this.#client.queue("bill_payment_credit_card.query", connectionId, params, options);
  }
}

module.exports = { BillPaymentCreditCard };
