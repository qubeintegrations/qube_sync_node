// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks standard terms operations. Types: standard_terms.d.ts. */
class StandardTerms {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create standard terms.
   * @param {string} connectionId
   * @param {import("./standard_terms").StandardTermsCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/standard-terms/create-standard-terms
   */
  create(connectionId, params, options) {
    return this.#client.queue("standard_terms.create", connectionId, params, options);
  }

  /**
   * List standard terms.
   * @param {string} connectionId
   * @param {import("./standard_terms").StandardTermsQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/standard-terms/list-standard-terms
   */
  query(connectionId, params, options) {
    return this.#client.queue("standard_terms.query", connectionId, params, options);
  }
}

module.exports = { StandardTerms };
