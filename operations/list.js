// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks list operations. Types: list.d.ts. */
class List {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Delete list.
   * @param {string} connectionId
   * @param {import("./list").ListDeleteParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/lists/delete-list
   */
  delete(connectionId, params, options) {
    return this.#client.queue("list.delete", connectionId, params, options);
  }
}

module.exports = { List };
