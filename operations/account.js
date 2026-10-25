// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks account operations. Types: account.d.ts. */
class Account {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create account.
   * @param {string} connectionId
   * @param {import("./account").AccountCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/accounts/create-account
   */
  create(connectionId, params, options) {
    return this.#client.queue("account.create", connectionId, params, options);
  }

  /**
   * List accounts.
   * @param {string} connectionId
   * @param {import("./account").AccountQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/accounts/list-accounts
   */
  query(connectionId, params, options) {
    return this.#client.queue("account.query", connectionId, params, options);
  }

  /**
   * Update account.
   * @param {string} connectionId
   * @param {import("./account").AccountUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/accounts/update-account
   */
  update(connectionId, params, options) {
    return this.#client.queue("account.update", connectionId, params, options);
  }
}

module.exports = { Account };
