// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks txn display operations. Types: txn_display.d.ts. */
class TxnDisplay {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create txn display.
   * @param {string} connectionId
   * @param {import("./txn_display").TxnDisplayCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/txn-displays/create-txn-display
   */
  create(connectionId, params, options) {
    return this.#client.queue("txn_display.create", connectionId, params, options);
  }

  /**
   * Update txn display.
   * @param {string} connectionId
   * @param {import("./txn_display").TxnDisplayUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/txn-displays/update-txn-display
   */
  update(connectionId, params, options) {
    return this.#client.queue("txn_display.update", connectionId, params, options);
  }
}

module.exports = { TxnDisplay };
