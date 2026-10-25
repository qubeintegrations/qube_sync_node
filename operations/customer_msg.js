// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks customer msg operations. Types: customer_msg.d.ts. */
class CustomerMsg {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create customer msg.
   * @param {string} connectionId
   * @param {import("./customer_msg").CustomerMsgCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/customer-msgs/create-customer-msg
   */
  create(connectionId, params, options) {
    return this.#client.queue("customer_msg.create", connectionId, params, options);
  }

  /**
   * List customer msgs.
   * @param {string} connectionId
   * @param {import("./customer_msg").CustomerMsgQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/customer-msgs/list-customer-msgs
   */
  query(connectionId, params, options) {
    return this.#client.queue("customer_msg.query", connectionId, params, options);
  }
}

module.exports = { CustomerMsg };
