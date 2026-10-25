// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks bill payment check operations. Types: bill_payment_check.d.ts. */
class BillPaymentCheck {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create bill payment check.
   * @param {string} connectionId
   * @param {import("./bill_payment_check").BillPaymentCheckCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/bill-payment-checks/create-bill-payment-check
   */
  create(connectionId, params, options) {
    return this.#client.queue("bill_payment_check.create", connectionId, params, options);
  }

  /**
   * List bill payment checks (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./bill_payment_check").BillPaymentCheckQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/bill-payment-checks/list-bill-payment-checks
   */
  query(connectionId, params, options) {
    return this.#client.queue("bill_payment_check.query", connectionId, params, options);
  }

  /**
   * Update bill payment check.
   * @param {string} connectionId
   * @param {import("./bill_payment_check").BillPaymentCheckUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/bill-payment-checks/update-bill-payment-check
   */
  update(connectionId, params, options) {
    return this.#client.queue("bill_payment_check.update", connectionId, params, options);
  }
}

module.exports = { BillPaymentCheck };
