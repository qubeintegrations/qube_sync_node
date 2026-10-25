// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item non inventory operations. Types: item_non_inventory.d.ts. */
class ItemNonInventory {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item non inventory.
   * @param {string} connectionId
   * @param {import("./item_non_inventory").ItemNonInventoryCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-non-inventories/create-item-non-inventory
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_non_inventory.create", connectionId, params, options);
  }

  /**
   * List item non inventories (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_non_inventory").ItemNonInventoryQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-non-inventories/list-item-non-inventories
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_non_inventory.query", connectionId, params, options);
  }

  /**
   * Update item non inventory.
   * @param {string} connectionId
   * @param {import("./item_non_inventory").ItemNonInventoryUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-non-inventories/update-item-non-inventory
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_non_inventory.update", connectionId, params, options);
  }
}

module.exports = { ItemNonInventory };
