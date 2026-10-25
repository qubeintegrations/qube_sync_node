// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks cleared status operations. Types: cleared_status.d.ts. */
class ClearedStatus {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Update cleared status.
   * @param {string} connectionId
   * @param {import("./cleared_status").ClearedStatusUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/cleared-statuses/update-cleared-status
   */
  update(connectionId, params, options) {
    return this.#client.queue("cleared_status.update", connectionId, params, options);
  }
}

module.exports = { ClearedStatus };
