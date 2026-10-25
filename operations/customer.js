// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks customer operations. Types: customer.d.ts. */
class Customer {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create customer.
   * @param {string} connectionId
   * @param {import("./customer").CustomerCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/customers/create-customer
   */
  create(connectionId, params, options) {
    return this.#client.queue("customer.create", connectionId, params, options);
  }

  /**
   * List customers (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./customer").CustomerQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/customers/list-customers
   */
  query(connectionId, params, options) {
    return this.#client.queue("customer.query", connectionId, params, options);
  }

  /**
   * Update customer.
   * @param {string} connectionId
   * @param {import("./customer").CustomerUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/customers/update-customer
   */
  update(connectionId, params, options) {
    return this.#client.queue("customer.update", connectionId, params, options);
  }
}

module.exports = { Customer };
