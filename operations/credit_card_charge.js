// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks credit card charge operations. Types: credit_card_charge.d.ts. */
class CreditCardCharge {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create credit card charge.
   * @param {string} connectionId
   * @param {import("./credit_card_charge").CreditCardChargeCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/credit-card-charges/create-credit-card-charge
   */
  create(connectionId, params, options) {
    return this.#client.queue("credit_card_charge.create", connectionId, params, options);
  }

  /**
   * List credit card charges (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./credit_card_charge").CreditCardChargeQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/credit-card-charges/list-credit-card-charges
   */
  query(connectionId, params, options) {
    return this.#client.queue("credit_card_charge.query", connectionId, params, options);
  }

  /**
   * Update credit card charge.
   * @param {string} connectionId
   * @param {import("./credit_card_charge").CreditCardChargeUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/credit-card-charges/update-credit-card-charge
   */
  update(connectionId, params, options) {
    return this.#client.queue("credit_card_charge.update", connectionId, params, options);
  }
}

module.exports = { CreditCardCharge };
