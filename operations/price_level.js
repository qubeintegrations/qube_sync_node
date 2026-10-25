// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks price level operations. Types: price_level.d.ts. */
class PriceLevel {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create price level.
   * @param {string} connectionId
   * @param {import("./price_level").PriceLevelCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/price-levels/create-price-level
   */
  create(connectionId, params, options) {
    return this.#client.queue("price_level.create", connectionId, params, options);
  }

  /**
   * List price levels.
   * @param {string} connectionId
   * @param {import("./price_level").PriceLevelQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/price-levels/list-price-levels
   */
  query(connectionId, params, options) {
    return this.#client.queue("price_level.query", connectionId, params, options);
  }

  /**
   * Update price level.
   * @param {string} connectionId
   * @param {import("./price_level").PriceLevelUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/price-levels/update-price-level
   */
  update(connectionId, params, options) {
    return this.#client.queue("price_level.update", connectionId, params, options);
  }
}

module.exports = { PriceLevel };
