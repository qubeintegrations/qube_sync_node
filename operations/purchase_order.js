// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks purchase order operations. Types: purchase_order.d.ts. */
class PurchaseOrder {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create purchase order.
   * @param {string} connectionId
   * @param {import("./purchase_order").PurchaseOrderCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/purchase-orders/create-purchase-order
   */
  create(connectionId, params, options) {
    return this.#client.queue("purchase_order.create", connectionId, params, options);
  }

  /**
   * List purchase orders (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./purchase_order").PurchaseOrderQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/purchase-orders/list-purchase-orders
   */
  query(connectionId, params, options) {
    return this.#client.queue("purchase_order.query", connectionId, params, options);
  }

  /**
   * Update purchase order.
   * @param {string} connectionId
   * @param {import("./purchase_order").PurchaseOrderUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/purchase-orders/update-purchase-order
   */
  update(connectionId, params, options) {
    return this.#client.queue("purchase_order.update", connectionId, params, options);
  }
}

module.exports = { PurchaseOrder };
