// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks other name operations. Types: other_name.d.ts. */
class OtherName {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create other name.
   * @param {string} connectionId
   * @param {import("./other_name").OtherNameCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/other-names/create-other-name
   */
  create(connectionId, params, options) {
    return this.#client.queue("other_name.create", connectionId, params, options);
  }

  /**
   * List other names.
   * @param {string} connectionId
   * @param {import("./other_name").OtherNameQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/other-names/list-other-names
   */
  query(connectionId, params, options) {
    return this.#client.queue("other_name.query", connectionId, params, options);
  }

  /**
   * Update other name.
   * @param {string} connectionId
   * @param {import("./other_name").OtherNameUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/other-names/update-other-name
   */
  update(connectionId, params, options) {
    return this.#client.queue("other_name.update", connectionId, params, options);
  }
}

module.exports = { OtherName };
