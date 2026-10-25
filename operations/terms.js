// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks terms operations. Types: terms.d.ts. */
class Terms {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List terms.
   * @param {string} connectionId
   * @param {import("./terms").TermsQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/terms/list-terms
   */
  query(connectionId, params, options) {
    return this.#client.queue("terms.query", connectionId, params, options);
  }
}

module.exports = { Terms };
