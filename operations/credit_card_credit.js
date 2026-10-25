// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks credit card credit operations. Types: credit_card_credit.d.ts. */
class CreditCardCredit {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create credit card credit.
   * @param {string} connectionId
   * @param {import("./credit_card_credit").CreditCardCreditCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/credit-card-credits/create-credit-card-credit
   */
  create(connectionId, params, options) {
    return this.#client.queue("credit_card_credit.create", connectionId, params, options);
  }

  /**
   * List credit card credits (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./credit_card_credit").CreditCardCreditQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/credit-card-credits/list-credit-card-credits
   */
  query(connectionId, params, options) {
    return this.#client.queue("credit_card_credit.query", connectionId, params, options);
  }

  /**
   * Update credit card credit.
   * @param {string} connectionId
   * @param {import("./credit_card_credit").CreditCardCreditUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/credit-card-credits/update-credit-card-credit
   */
  update(connectionId, params, options) {
    return this.#client.queue("credit_card_credit.update", connectionId, params, options);
  }
}

module.exports = { CreditCardCredit };
