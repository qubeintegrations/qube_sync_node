// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks estimate operations. Types: estimate.d.ts. */
class Estimate {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create estimate.
   * @param {string} connectionId
   * @param {import("./estimate").EstimateCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/estimates/create-estimate
   */
  create(connectionId, params, options) {
    return this.#client.queue("estimate.create", connectionId, params, options);
  }

  /**
   * List estimates (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./estimate").EstimateQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/estimates/list-estimates
   */
  query(connectionId, params, options) {
    return this.#client.queue("estimate.query", connectionId, params, options);
  }

  /**
   * Update estimate.
   * @param {string} connectionId
   * @param {import("./estimate").EstimateUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/estimates/update-estimate
   */
  update(connectionId, params, options) {
    return this.#client.queue("estimate.update", connectionId, params, options);
  }
}

module.exports = { Estimate };
