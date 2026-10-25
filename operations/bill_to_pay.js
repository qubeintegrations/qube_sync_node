// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks bill to pay operations. Types: bill_to_pay.d.ts. */
class BillToPay {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List bill to pays.
   * @param {string} connectionId
   * @param {import("./bill_to_pay").BillToPayQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/bill-to-pays/list-bill-to-pays
   */
  query(connectionId, params, options) {
    return this.#client.queue("bill_to_pay.query", connectionId, params, options);
  }
}

module.exports = { BillToPay };
