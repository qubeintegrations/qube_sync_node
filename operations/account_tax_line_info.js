// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks account tax line info operations. Types: account_tax_line_info.d.ts. */
class AccountTaxLineInfo {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List account tax line infos.
   * @param {string} connectionId
   * @param {import("./account_tax_line_info").AccountTaxLineInfoQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/account-tax-line-infos/list-account-tax-line-infos
   */
  query(connectionId, params, options) {
    return this.#client.queue("account_tax_line_info.query", connectionId, params, options);
  }
}

module.exports = { AccountTaxLineInfo };
