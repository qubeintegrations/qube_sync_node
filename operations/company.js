// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks company operations. Types: company.d.ts. */
class Company {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List companies.
   * @param {string} connectionId
   * @param {import("./company").CompanyQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/companies/list-companies
   */
  query(connectionId, params, options) {
    return this.#client.queue("company.query", connectionId, params, options);
  }
}

module.exports = { Company };
