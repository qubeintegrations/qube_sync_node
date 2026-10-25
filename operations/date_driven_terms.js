// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks date driven terms operations. Types: date_driven_terms.d.ts. */
class DateDrivenTerms {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create date driven terms.
   * @param {string} connectionId
   * @param {import("./date_driven_terms").DateDrivenTermsCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/date-driven-terms/create-date-driven-terms
   */
  create(connectionId, params, options) {
    return this.#client.queue("date_driven_terms.create", connectionId, params, options);
  }

  /**
   * List date driven terms.
   * @param {string} connectionId
   * @param {import("./date_driven_terms").DateDrivenTermsQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/date-driven-terms/list-date-driven-terms
   */
  query(connectionId, params, options) {
    return this.#client.queue("date_driven_terms.query", connectionId, params, options);
  }
}

module.exports = { DateDrivenTerms };
