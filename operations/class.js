// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks class operations. Types: class.d.ts. */
class Class {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create class.
   * @param {string} connectionId
   * @param {import("./class").ClassCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/classes/create-class
   */
  create(connectionId, params, options) {
    return this.#client.queue("class.create", connectionId, params, options);
  }

  /**
   * List classes.
   * @param {string} connectionId
   * @param {import("./class").ClassQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/classes/list-classes
   */
  query(connectionId, params, options) {
    return this.#client.queue("class.query", connectionId, params, options);
  }

  /**
   * Update class.
   * @param {string} connectionId
   * @param {import("./class").ClassUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/classes/update-class
   */
  update(connectionId, params, options) {
    return this.#client.queue("class.update", connectionId, params, options);
  }
}

module.exports = { Class };
