// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks company activity operations. Types: company_activity.d.ts. */
class CompanyActivity {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List company activities.
   * @param {string} connectionId
   * @param {import("./company_activity").CompanyActivityQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/company-activities/list-company-activities
   */
  query(connectionId, params, options) {
    return this.#client.queue("company_activity.query", connectionId, params, options);
  }
}

module.exports = { CompanyActivity };
