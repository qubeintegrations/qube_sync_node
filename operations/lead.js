// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks lead operations. Types: lead.d.ts. */
class Lead {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create lead.
   * @param {string} connectionId
   * @param {import("./lead").LeadCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/leads/create-lead
   */
  create(connectionId, params, options) {
    return this.#client.queue("lead.create", connectionId, params, options);
  }

  /**
   * List leads (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./lead").LeadQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/leads/list-leads
   */
  query(connectionId, params, options) {
    return this.#client.queue("lead.query", connectionId, params, options);
  }

  /**
   * Update lead.
   * @param {string} connectionId
   * @param {import("./lead").LeadUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/leads/update-lead
   */
  update(connectionId, params, options) {
    return this.#client.queue("lead.update", connectionId, params, options);
  }
}

module.exports = { Lead };
