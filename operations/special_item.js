// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks special item operations. Types: special_item.d.ts. */
class SpecialItem {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create special item.
   * @param {string} connectionId
   * @param {import("./special_item").SpecialItemCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/special-items/create-special-item
   */
  create(connectionId, params, options) {
    return this.#client.queue("special_item.create", connectionId, params, options);
  }
}

module.exports = { SpecialItem };
