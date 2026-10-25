// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks entity operations. Types: entity.d.ts. */
class Entity {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List entities (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./entity").EntityQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/entities/list-entities
   */
  query(connectionId, params, options) {
    return this.#client.queue("entity.query", connectionId, params, options);
  }
}

module.exports = { Entity };
