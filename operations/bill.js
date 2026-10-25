// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks bill operations. Types: bill.d.ts. */
class Bill {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create bill.
   * @param {string} connectionId
   * @param {import("./bill").BillCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/bills/create-bill
   */
  create(connectionId, params, options) {
    return this.#client.queue("bill.create", connectionId, params, options);
  }

  /**
   * List bills (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./bill").BillQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/bills/list-bills
   */
  query(connectionId, params, options) {
    return this.#client.queue("bill.query", connectionId, params, options);
  }

  /**
   * Update bill.
   * @param {string} connectionId
   * @param {import("./bill").BillUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/bills/update-bill
   */
  update(connectionId, params, options) {
    return this.#client.queue("bill.update", connectionId, params, options);
  }
}

module.exports = { Bill };
