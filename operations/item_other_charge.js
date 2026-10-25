// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item other charge operations. Types: item_other_charge.d.ts. */
class ItemOtherCharge {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item other charge.
   * @param {string} connectionId
   * @param {import("./item_other_charge").ItemOtherChargeCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-other-charges/create-item-other-charge
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_other_charge.create", connectionId, params, options);
  }

  /**
   * List item other charges (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_other_charge").ItemOtherChargeQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-other-charges/list-item-other-charges
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_other_charge.query", connectionId, params, options);
  }

  /**
   * Update item other charge.
   * @param {string} connectionId
   * @param {import("./item_other_charge").ItemOtherChargeUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-other-charges/update-item-other-charge
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_other_charge.update", connectionId, params, options);
  }
}

module.exports = { ItemOtherCharge };
