// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks special account operations. Types: special_account.d.ts. */
class SpecialAccount {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create special account.
   * @param {string} connectionId
   * @param {import("./special_account").SpecialAccountCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/special-accounts/create-special-account
   */
  create(connectionId, params, options) {
    return this.#client.queue("special_account.create", connectionId, params, options);
  }
}

module.exports = { SpecialAccount };
