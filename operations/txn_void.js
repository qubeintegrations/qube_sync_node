// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks txn void operations. Types: txn_void.d.ts. */
class TxnVoid {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Execute txn void.
   * @param {string} connectionId
   * @param {import("./txn_void").TxnVoidExecuteParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/txn-void/execute-txn-void
   */
  execute(connectionId, params, options) {
    return this.#client.queue("txn_void.execute", connectionId, params, options);
  }
}

module.exports = { TxnVoid };
