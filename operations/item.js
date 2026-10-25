// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item operations. Types: item.d.ts. */
class Item {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List items (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item").ItemQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/items/list-items
   */
  query(connectionId, params, options) {
    return this.#client.queue("item.query", connectionId, params, options);
  }
}

module.exports = { Item };
