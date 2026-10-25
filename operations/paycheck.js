// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks paycheck operations. Types: paycheck.d.ts. */
class Paycheck {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List paychecks.
   * @param {string} connectionId
   * @param {import("./paycheck").PaycheckQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/paychecks/list-paychecks
   */
  query(connectionId, params, options) {
    return this.#client.queue("paycheck.query", connectionId, params, options);
  }
}

module.exports = { Paycheck };
