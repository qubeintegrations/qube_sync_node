// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks customer type operations. Types: customer_type.d.ts. */
class CustomerType {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create customer type.
   * @param {string} connectionId
   * @param {import("./customer_type").CustomerTypeCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/customer-types/create-customer-type
   */
  create(connectionId, params, options) {
    return this.#client.queue("customer_type.create", connectionId, params, options);
  }

  /**
   * List customer types.
   * @param {string} connectionId
   * @param {import("./customer_type").CustomerTypeQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/customer-types/list-customer-types
   */
  query(connectionId, params, options) {
    return this.#client.queue("customer_type.query", connectionId, params, options);
  }
}

module.exports = { CustomerType };
