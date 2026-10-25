// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks inventory site operations. Types: inventory_site.d.ts. */
class InventorySite {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create inventory site.
   * @param {string} connectionId
   * @param {import("./inventory_site").InventorySiteCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/inventory-sites/create-inventory-site
   */
  create(connectionId, params, options) {
    return this.#client.queue("inventory_site.create", connectionId, params, options);
  }

  /**
   * List inventory sites.
   * @param {string} connectionId
   * @param {import("./inventory_site").InventorySiteQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/inventory-sites/list-inventory-sites
   */
  query(connectionId, params, options) {
    return this.#client.queue("inventory_site.query", connectionId, params, options);
  }

  /**
   * Update inventory site.
   * @param {string} connectionId
   * @param {import("./inventory_site").InventorySiteUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/inventory-sites/update-inventory-site
   */
  update(connectionId, params, options) {
    return this.#client.queue("inventory_site.update", connectionId, params, options);
  }
}

module.exports = { InventorySite };
