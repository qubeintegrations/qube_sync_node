// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks bar code operations. Types: bar_code.d.ts. */
class BarCode {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List bar codes.
   * @param {string} connectionId
   * @param {import("./bar_code").BarCodeQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/bar-codes/list-bar-codes
   */
  query(connectionId, params, options) {
    return this.#client.queue("bar_code.query", connectionId, params, options);
  }
}

module.exports = { BarCode };
