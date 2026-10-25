// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks transfer operations. Types: transfer.d.ts. */
class Transfer {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create transfer.
   * @param {string} connectionId
   * @param {import("./transfer").TransferCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/transfers/create-transfer
   */
  create(connectionId, params, options) {
    return this.#client.queue("transfer.create", connectionId, params, options);
  }

  /**
   * List transfers (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./transfer").TransferQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/transfers/list-transfers
   */
  query(connectionId, params, options) {
    return this.#client.queue("transfer.query", connectionId, params, options);
  }

  /**
   * Update transfer.
   * @param {string} connectionId
   * @param {import("./transfer").TransferUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/transfers/update-transfer
   */
  update(connectionId, params, options) {
    return this.#client.queue("transfer.update", connectionId, params, options);
  }
}

module.exports = { Transfer };
