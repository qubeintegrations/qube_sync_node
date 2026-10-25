// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item inventory operations. Types: item_inventory.d.ts. */
class ItemInventory {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item inventory.
   * @param {string} connectionId
   * @param {import("./item_inventory").ItemInventoryCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-inventories/create-item-inventory
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_inventory.create", connectionId, params, options);
  }

  /**
   * List item inventories (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_inventory").ItemInventoryQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-inventories/list-item-inventories
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_inventory.query", connectionId, params, options);
  }

  /**
   * Update item inventory.
   * @param {string} connectionId
   * @param {import("./item_inventory").ItemInventoryUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-inventories/update-item-inventory
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_inventory.update", connectionId, params, options);
  }
}

module.exports = { ItemInventory };
