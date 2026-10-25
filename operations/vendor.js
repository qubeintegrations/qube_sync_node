// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks vendor operations. Types: vendor.d.ts. */
class Vendor {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create vendor.
   * @param {string} connectionId
   * @param {import("./vendor").VendorCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vendors/create-vendor
   */
  create(connectionId, params, options) {
    return this.#client.queue("vendor.create", connectionId, params, options);
  }

  /**
   * List vendors (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./vendor").VendorQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vendors/list-vendors
   */
  query(connectionId, params, options) {
    return this.#client.queue("vendor.query", connectionId, params, options);
  }

  /**
   * Update vendor.
   * @param {string} connectionId
   * @param {import("./vendor").VendorUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vendors/update-vendor
   */
  update(connectionId, params, options) {
    return this.#client.queue("vendor.update", connectionId, params, options);
  }
}

module.exports = { Vendor };
