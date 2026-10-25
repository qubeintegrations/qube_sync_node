// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks vendor credit operations. Types: vendor_credit.d.ts. */
class VendorCredit {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create vendor credit.
   * @param {string} connectionId
   * @param {import("./vendor_credit").VendorCreditCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vendor-credits/create-vendor-credit
   */
  create(connectionId, params, options) {
    return this.#client.queue("vendor_credit.create", connectionId, params, options);
  }

  /**
   * List vendor credits (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./vendor_credit").VendorCreditQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vendor-credits/list-vendor-credits
   */
  query(connectionId, params, options) {
    return this.#client.queue("vendor_credit.query", connectionId, params, options);
  }

  /**
   * Update vendor credit.
   * @param {string} connectionId
   * @param {import("./vendor_credit").VendorCreditUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/vendor-credits/update-vendor-credit
   */
  update(connectionId, params, options) {
    return this.#client.queue("vendor_credit.update", connectionId, params, options);
  }
}

module.exports = { VendorCredit };
