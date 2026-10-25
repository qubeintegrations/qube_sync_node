// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks txn operations. Types: txn.d.ts. */
class Txn {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Delete txn.
   * @param {string} connectionId
   * @param {import("./txn").TxnDeleteParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/txns/delete-txn
   */
  delete(connectionId, params, options) {
    return this.#client.queue("txn.delete", connectionId, params, options);
  }
}

module.exports = { Txn };
