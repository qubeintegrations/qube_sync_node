// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks currency operations. Types: currency.d.ts. */
class Currency {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create currency.
   * @param {string} connectionId
   * @param {import("./currency").CurrencyCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/currencies/create-currency
   */
  create(connectionId, params, options) {
    return this.#client.queue("currency.create", connectionId, params, options);
  }

  /**
   * List currencies.
   * @param {string} connectionId
   * @param {import("./currency").CurrencyQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/currencies/list-currencies
   */
  query(connectionId, params, options) {
    return this.#client.queue("currency.query", connectionId, params, options);
  }

  /**
   * Update currency.
   * @param {string} connectionId
   * @param {import("./currency").CurrencyUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/currencies/update-currency
   */
  update(connectionId, params, options) {
    return this.#client.queue("currency.update", connectionId, params, options);
  }
}

module.exports = { Currency };
