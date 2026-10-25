// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks workers comp code operations. Types: workers_comp_code.d.ts. */
class WorkersCompCode {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create workers comp code.
   * @param {string} connectionId
   * @param {import("./workers_comp_code").WorkersCompCodeCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/workers-comp-codes/create-workers-comp-code
   */
  create(connectionId, params, options) {
    return this.#client.queue("workers_comp_code.create", connectionId, params, options);
  }

  /**
   * List workers comp codes.
   * @param {string} connectionId
   * @param {import("./workers_comp_code").WorkersCompCodeQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/workers-comp-codes/list-workers-comp-codes
   */
  query(connectionId, params, options) {
    return this.#client.queue("workers_comp_code.query", connectionId, params, options);
  }

  /**
   * Update workers comp code.
   * @param {string} connectionId
   * @param {import("./workers_comp_code").WorkersCompCodeUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/workers-comp-codes/update-workers-comp-code
   */
  update(connectionId, params, options) {
    return this.#client.queue("workers_comp_code.update", connectionId, params, options);
  }
}

module.exports = { WorkersCompCode };
