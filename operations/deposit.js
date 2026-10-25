// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks deposit operations. Types: deposit.d.ts. */
class Deposit {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create deposit.
   * @param {string} connectionId
   * @param {import("./deposit").DepositCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/deposits/create-deposit
   */
  create(connectionId, params, options) {
    return this.#client.queue("deposit.create", connectionId, params, options);
  }

  /**
   * List deposits (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./deposit").DepositQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/deposits/list-deposits
   */
  query(connectionId, params, options) {
    return this.#client.queue("deposit.query", connectionId, params, options);
  }

  /**
   * Update deposit.
   * @param {string} connectionId
   * @param {import("./deposit").DepositUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/deposits/update-deposit
   */
  update(connectionId, params, options) {
    return this.#client.queue("deposit.update", connectionId, params, options);
  }
}

module.exports = { Deposit };
