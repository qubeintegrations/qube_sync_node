// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks form1099 category account mapping operations. Types: form1099_category_account_mapping.d.ts. */
class Form1099CategoryAccountMapping {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List form1099 category account mappings.
   * @param {string} connectionId
   * @param {import("./form1099_category_account_mapping").Form1099CategoryAccountMappingQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/form1099-category-account-mappings/list-form1099-category-account-mappings
   */
  query(connectionId, params, options) {
    return this.#client.queue("form1099_category_account_mapping.query", connectionId, params, options);
  }

  /**
   * Update form1099 category account mapping.
   * @param {string} connectionId
   * @param {import("./form1099_category_account_mapping").Form1099CategoryAccountMappingUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/form1099-category-account-mappings/update-form1099-category-account-mapping
   */
  update(connectionId, params, options) {
    return this.#client.queue("form1099_category_account_mapping.update", connectionId, params, options);
  }
}

module.exports = { Form1099CategoryAccountMapping };
