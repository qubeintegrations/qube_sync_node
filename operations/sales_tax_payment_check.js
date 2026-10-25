// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks sales tax payment check operations. Types: sales_tax_payment_check.d.ts. */
class SalesTaxPaymentCheck {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create sales tax payment check.
   * @param {string} connectionId
   * @param {import("./sales_tax_payment_check").SalesTaxPaymentCheckCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-payment-checks/create-sales-tax-payment-check
   */
  create(connectionId, params, options) {
    return this.#client.queue("sales_tax_payment_check.create", connectionId, params, options);
  }

  /**
   * List sales tax payment checks (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./sales_tax_payment_check").SalesTaxPaymentCheckQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-payment-checks/list-sales-tax-payment-checks
   */
  query(connectionId, params, options) {
    return this.#client.queue("sales_tax_payment_check.query", connectionId, params, options);
  }

  /**
   * Update sales tax payment check.
   * @param {string} connectionId
   * @param {import("./sales_tax_payment_check").SalesTaxPaymentCheckUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-payment-checks/update-sales-tax-payment-check
   */
  update(connectionId, params, options) {
    return this.#client.queue("sales_tax_payment_check.update", connectionId, params, options);
  }
}

module.exports = { SalesTaxPaymentCheck };
