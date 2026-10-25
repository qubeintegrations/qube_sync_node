// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks receive payment to deposit operations. Types: receive_payment_to_deposit.d.ts. */
class ReceivePaymentToDeposit {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List receive payment to deposits.
   * @param {string} connectionId
   * @param {import("./receive_payment_to_deposit").ReceivePaymentToDepositQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/receive-payment-to-deposits/list-receive-payment-to-deposits
   */
  query(connectionId, params, options) {
    return this.#client.queue("receive_payment_to_deposit.query", connectionId, params, options);
  }
}

module.exports = { ReceivePaymentToDeposit };
