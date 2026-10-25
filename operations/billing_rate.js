// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks billing rate operations. Types: billing_rate.d.ts. */
class BillingRate {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create billing rate.
   * @param {string} connectionId
   * @param {import("./billing_rate").BillingRateCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/billing-rates/create-billing-rate
   */
  create(connectionId, params, options) {
    return this.#client.queue("billing_rate.create", connectionId, params, options);
  }

  /**
   * List billing rates.
   * @param {string} connectionId
   * @param {import("./billing_rate").BillingRateQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/billing-rates/list-billing-rates
   */
  query(connectionId, params, options) {
    return this.#client.queue("billing_rate.query", connectionId, params, options);
  }
}

module.exports = { BillingRate };
