// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks receive payment operations. Types: receive_payment.d.ts. */
class ReceivePayment {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Record payment.
   * @param {string} connectionId
   * @param {import("./receive_payment").ReceivePaymentCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payments/record-payment
   */
  create(connectionId, params, options) {
    return this.#client.queue("receive_payment.create", connectionId, params, options);
  }

  /**
   * List receive payments (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./receive_payment").ReceivePaymentQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/receive-payments/list-receive-payments
   */
  query(connectionId, params, options) {
    return this.#client.queue("receive_payment.query", connectionId, params, options);
  }

  /**
   * Update receive payment.
   * @param {string} connectionId
   * @param {import("./receive_payment").ReceivePaymentUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/receive-payments/update-receive-payment
   */
  update(connectionId, params, options) {
    return this.#client.queue("receive_payment.update", connectionId, params, options);
  }
}

module.exports = { ReceivePayment };
