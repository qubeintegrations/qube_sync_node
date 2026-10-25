// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks data ext def operations. Types: data_ext_def.d.ts. */
class DataExtDef {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create data ext def.
   * @param {string} connectionId
   * @param {import("./data_ext_def").DataExtDefCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/data-ext-defs/create-data-ext-def
   */
  create(connectionId, params, options) {
    return this.#client.queue("data_ext_def.create", connectionId, params, options);
  }

  /**
   * Delete data ext def.
   * @param {string} connectionId
   * @param {import("./data_ext_def").DataExtDefDeleteParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/data-ext-defs/delete-data-ext-def
   */
  delete(connectionId, params, options) {
    return this.#client.queue("data_ext_def.delete", connectionId, params, options);
  }

  /**
   * List data ext defs.
   * @param {string} connectionId
   * @param {import("./data_ext_def").DataExtDefQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/data-ext-defs/list-data-ext-defs
   */
  query(connectionId, params, options) {
    return this.#client.queue("data_ext_def.query", connectionId, params, options);
  }

  /**
   * Update data ext def.
   * @param {string} connectionId
   * @param {import("./data_ext_def").DataExtDefUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/data-ext-defs/update-data-ext-def
   */
  update(connectionId, params, options) {
    return this.#client.queue("data_ext_def.update", connectionId, params, options);
  }
}

module.exports = { DataExtDef };
