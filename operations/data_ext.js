// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks data ext operations. Types: data_ext.d.ts. */
class DataExt {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create data ext.
   * @param {string} connectionId
   * @param {import("./data_ext").DataExtCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/data-exts/create-data-ext
   */
  create(connectionId, params, options) {
    return this.#client.queue("data_ext.create", connectionId, params, options);
  }

  /**
   * Delete data ext.
   * @param {string} connectionId
   * @param {import("./data_ext").DataExtDeleteParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/data-exts/delete-data-ext
   */
  delete(connectionId, params, options) {
    return this.#client.queue("data_ext.delete", connectionId, params, options);
  }

  /**
   * Update data ext.
   * @param {string} connectionId
   * @param {import("./data_ext").DataExtUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/data-exts/update-data-ext
   */
  update(connectionId, params, options) {
    return this.#client.queue("data_ext.update", connectionId, params, options);
  }
}

module.exports = { DataExt };
