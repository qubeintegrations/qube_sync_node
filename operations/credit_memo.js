// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks credit memo operations. Types: credit_memo.d.ts. */
class CreditMemo {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create credit memo.
   * @param {string} connectionId
   * @param {import("./credit_memo").CreditMemoCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/credit-memos/create-credit-memo
   */
  create(connectionId, params, options) {
    return this.#client.queue("credit_memo.create", connectionId, params, options);
  }

  /**
   * List credit memos (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./credit_memo").CreditMemoQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/credit-memos/list-credit-memos
   */
  query(connectionId, params, options) {
    return this.#client.queue("credit_memo.query", connectionId, params, options);
  }

  /**
   * Update credit memo.
   * @param {string} connectionId
   * @param {import("./credit_memo").CreditMemoUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/credit-memos/update-credit-memo
   */
  update(connectionId, params, options) {
    return this.#client.queue("credit_memo.update", connectionId, params, options);
  }
}

module.exports = { CreditMemo };
