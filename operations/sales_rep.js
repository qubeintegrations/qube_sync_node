// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks sales rep operations. Types: sales_rep.d.ts. */
class SalesRep {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create sales rep.
   * @param {string} connectionId
   * @param {import("./sales_rep").SalesRepCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-reps/create-sales-rep
   */
  create(connectionId, params, options) {
    return this.#client.queue("sales_rep.create", connectionId, params, options);
  }

  /**
   * List sales reps.
   * @param {string} connectionId
   * @param {import("./sales_rep").SalesRepQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-reps/list-sales-reps
   */
  query(connectionId, params, options) {
    return this.#client.queue("sales_rep.query", connectionId, params, options);
  }

  /**
   * Update sales rep.
   * @param {string} connectionId
   * @param {import("./sales_rep").SalesRepUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/sales-reps/update-sales-rep
   */
  update(connectionId, params, options) {
    return this.#client.queue("sales_rep.update", connectionId, params, options);
  }
}

module.exports = { SalesRep };
