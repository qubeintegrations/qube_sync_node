// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll prior payment operations. Types: payroll_prior_payment.d.ts. */
class PayrollPriorPayment {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payroll prior payment.
   * @param {string} connectionId
   * @param {import("./payroll_prior_payment").PayrollPriorPaymentCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-prior-payments/create-payroll-prior-payment
   */
  create(connectionId, params, options) {
    return this.#client.queue("payroll_prior_payment.create", connectionId, params, options);
  }

  /**
   * List payroll prior payments.
   * @param {string} connectionId
   * @param {import("./payroll_prior_payment").PayrollPriorPaymentQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-prior-payments/list-payroll-prior-payments
   */
  query(connectionId, params, options) {
    return this.#client.queue("payroll_prior_payment.query", connectionId, params, options);
  }
}

module.exports = { PayrollPriorPayment };
