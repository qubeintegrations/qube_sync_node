// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks check operations. Types: check.d.ts. */
class Check {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create check.
   * @param {string} connectionId
   * @param {import("./check").CheckCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/checks/create-check
   */
  create(connectionId, params, options) {
    return this.#client.queue("check.create", connectionId, params, options);
  }

  /**
   * List checks (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./check").CheckQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/checks/list-checks
   */
  query(connectionId, params, options) {
    return this.#client.queue("check.query", connectionId, params, options);
  }

  /**
   * Update check.
   * @param {string} connectionId
   * @param {import("./check").CheckUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/checks/update-check
   */
  update(connectionId, params, options) {
    return this.#client.queue("check.update", connectionId, params, options);
  }
}

module.exports = { Check };
