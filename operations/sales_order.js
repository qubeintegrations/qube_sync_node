// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks sales order operations. Types: sales_order.d.ts. */
class SalesOrder {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create sales order.
   * @param {string} connectionId
   * @param {import("./sales_order").SalesOrderCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-orders/create-sales-order
   */
  create(connectionId, params, options) {
    return this.#client.queue("sales_order.create", connectionId, params, options);
  }

  /**
   * List sales orders (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./sales_order").SalesOrderQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-orders/list-sales-orders
   */
  query(connectionId, params, options) {
    return this.#client.queue("sales_order.query", connectionId, params, options);
  }

  /**
   * Update sales order.
   * @param {string} connectionId
   * @param {import("./sales_order").SalesOrderUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-orders/update-sales-order
   */
  update(connectionId, params, options) {
    return this.#client.queue("sales_order.update", connectionId, params, options);
  }
}

module.exports = { SalesOrder };
