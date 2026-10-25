// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payment method operations. Types: payment_method.d.ts. */
class PaymentMethod {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payment method.
   * @param {string} connectionId
   * @param {import("./payment_method").PaymentMethodCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payment-methods/create-payment-method
   */
  create(connectionId, params, options) {
    return this.#client.queue("payment_method.create", connectionId, params, options);
  }

  /**
   * List payment methods.
   * @param {string} connectionId
   * @param {import("./payment_method").PaymentMethodQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payment-methods/list-payment-methods
   */
  query(connectionId, params, options) {
    return this.#client.queue("payment_method.query", connectionId, params, options);
  }
}

module.exports = { PaymentMethod };
