// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks ship method operations. Types: ship_method.d.ts. */
class ShipMethod {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create ship method.
   * @param {string} connectionId
   * @param {import("./ship_method").ShipMethodCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/ship-methods/create-ship-method
   */
  create(connectionId, params, options) {
    return this.#client.queue("ship_method.create", connectionId, params, options);
  }

  /**
   * List ship methods.
   * @param {string} connectionId
   * @param {import("./ship_method").ShipMethodQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/ship-methods/list-ship-methods
   */
  query(connectionId, params, options) {
    return this.#client.queue("ship_method.query", connectionId, params, options);
  }
}

module.exports = { ShipMethod };
