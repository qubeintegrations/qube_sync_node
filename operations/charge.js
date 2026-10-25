// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks charge operations. Types: charge.d.ts. */
class Charge {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create charge.
   * @param {string} connectionId
   * @param {import("./charge").ChargeCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/charges/create-charge
   */
  create(connectionId, params, options) {
    return this.#client.queue("charge.create", connectionId, params, options);
  }

  /**
   * List charges (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./charge").ChargeQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/charges/list-charges
   */
  query(connectionId, params, options) {
    return this.#client.queue("charge.query", connectionId, params, options);
  }

  /**
   * Update charge.
   * @param {string} connectionId
   * @param {import("./charge").ChargeUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/charges/update-charge
   */
  update(connectionId, params, options) {
    return this.#client.queue("charge.update", connectionId, params, options);
  }
}

module.exports = { Charge };
