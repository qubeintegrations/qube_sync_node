// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks inventory adjustment operations. Types: inventory_adjustment.d.ts. */
class InventoryAdjustment {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create inventory adjustment.
   * @param {string} connectionId
   * @param {import("./inventory_adjustment").InventoryAdjustmentCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/inventory-adjustments/create-inventory-adjustment
   */
  create(connectionId, params, options) {
    return this.#client.queue("inventory_adjustment.create", connectionId, params, options);
  }

  /**
   * List inventory adjustments (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./inventory_adjustment").InventoryAdjustmentQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/inventory-adjustments/list-inventory-adjustments
   */
  query(connectionId, params, options) {
    return this.#client.queue("inventory_adjustment.query", connectionId, params, options);
  }

  /**
   * Update inventory adjustment.
   * @param {string} connectionId
   * @param {import("./inventory_adjustment").InventoryAdjustmentUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/inventory-adjustments/update-inventory-adjustment
   */
  update(connectionId, params, options) {
    return this.#client.queue("inventory_adjustment.update", connectionId, params, options);
  }
}

module.exports = { InventoryAdjustment };
