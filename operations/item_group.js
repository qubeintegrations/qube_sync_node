// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item group operations. Types: item_group.d.ts. */
class ItemGroup {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item group.
   * @param {string} connectionId
   * @param {import("./item_group").ItemGroupCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-groups/create-item-group
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_group.create", connectionId, params, options);
  }

  /**
   * List item groups (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_group").ItemGroupQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-groups/list-item-groups
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_group.query", connectionId, params, options);
  }

  /**
   * Update item group.
   * @param {string} connectionId
   * @param {import("./item_group").ItemGroupUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-groups/update-item-group
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_group.update", connectionId, params, options);
  }
}

module.exports = { ItemGroup };
