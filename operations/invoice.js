// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks invoice operations. Types: invoice.d.ts. */
class Invoice {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create invoice.
   * @param {string} connectionId
   * @param {import("./invoice").InvoiceCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/invoices/create-invoice
   */
  create(connectionId, params, options) {
    return this.#client.queue("invoice.create", connectionId, params, options);
  }

  /**
   * List invoices (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./invoice").InvoiceQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/invoices/list-invoices
   */
  query(connectionId, params, options) {
    return this.#client.queue("invoice.query", connectionId, params, options);
  }

  /**
   * Update invoice.
   * @param {string} connectionId
   * @param {import("./invoice").InvoiceUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/invoices/update-invoice
   */
  update(connectionId, params, options) {
    return this.#client.queue("invoice.update", connectionId, params, options);
  }
}

module.exports = { Invoice };
