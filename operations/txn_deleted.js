// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks txn deleted operations. Types: txn_deleted.d.ts. */
class TxnDeleted {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List txn deleteds.
   * @param {string} connectionId
   * @param {import("./txn_deleted").TxnDeletedQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/txn-deleteds/list-txn-deleteds
   */
  query(connectionId, params, options) {
    return this.#client.queue("txn_deleted.query", connectionId, params, options);
  }
}

module.exports = { TxnDeleted };
