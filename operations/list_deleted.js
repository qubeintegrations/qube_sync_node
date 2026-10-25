// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks list deleted operations. Types: list_deleted.d.ts. */
class ListDeleted {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List list deleteds.
   * @param {string} connectionId
   * @param {import("./list_deleted").ListDeletedQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/list-deleteds/list-list-deleteds
   */
  query(connectionId, params, options) {
    return this.#client.queue("list_deleted.query", connectionId, params, options);
  }
}

module.exports = { ListDeleted };
