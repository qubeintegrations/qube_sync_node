// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks transaction operations. Types: transaction.d.ts. */
class Transaction {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List transactions (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./transaction").TransactionQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/transactions/list-transactions
   */
  query(connectionId, params, options) {
    return this.#client.queue("transaction.query", connectionId, params, options);
  }
}

module.exports = { Transaction };
