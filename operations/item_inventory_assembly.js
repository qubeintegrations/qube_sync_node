// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item inventory assembly operations. Types: item_inventory_assembly.d.ts. */
class ItemInventoryAssembly {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item inventory assembly.
   * @param {string} connectionId
   * @param {import("./item_inventory_assembly").ItemInventoryAssemblyCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-inventory-assemblies/create-item-inventory-assembly
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_inventory_assembly.create", connectionId, params, options);
  }

  /**
   * List item inventory assemblies (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_inventory_assembly").ItemInventoryAssemblyQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-inventory-assemblies/list-item-inventory-assemblies
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_inventory_assembly.query", connectionId, params, options);
  }

  /**
   * Update item inventory assembly.
   * @param {string} connectionId
   * @param {import("./item_inventory_assembly").ItemInventoryAssemblyUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-inventory-assemblies/update-item-inventory-assembly
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_inventory_assembly.update", connectionId, params, options);
  }
}

module.exports = { ItemInventoryAssembly };
