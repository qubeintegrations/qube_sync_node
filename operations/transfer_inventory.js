// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks transfer inventory operations. Types: transfer_inventory.d.ts. */
class TransferInventory {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create transfer inventory.
   * @param {string} connectionId
   * @param {import("./transfer_inventory").TransferInventoryCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/transfer-inventories/create-transfer-inventory
   */
  create(connectionId, params, options) {
    return this.#client.queue("transfer_inventory.create", connectionId, params, options);
  }

  /**
   * List transfer inventories (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./transfer_inventory").TransferInventoryQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/transfer-inventories/list-transfer-inventories
   */
  query(connectionId, params, options) {
    return this.#client.queue("transfer_inventory.query", connectionId, params, options);
  }

  /**
   * Update transfer inventory.
   * @param {string} connectionId
   * @param {import("./transfer_inventory").TransferInventoryUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/transfer-inventories/update-transfer-inventory
   */
  update(connectionId, params, options) {
    return this.#client.queue("transfer_inventory.update", connectionId, params, options);
  }
}

module.exports = { TransferInventory };
