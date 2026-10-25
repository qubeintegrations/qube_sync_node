// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks vendor type operations. Types: vendor_type.d.ts. */
class VendorType {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create vendor type.
   * @param {string} connectionId
   * @param {import("./vendor_type").VendorTypeCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vendor-types/create-vendor-type
   */
  create(connectionId, params, options) {
    return this.#client.queue("vendor_type.create", connectionId, params, options);
  }

  /**
   * List vendor types.
   * @param {string} connectionId
   * @param {import("./vendor_type").VendorTypeQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vendor-types/list-vendor-types
   */
  query(connectionId, params, options) {
    return this.#client.queue("vendor_type.query", connectionId, params, options);
  }
}

module.exports = { VendorType };
