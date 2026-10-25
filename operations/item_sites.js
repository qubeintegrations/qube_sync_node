// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item sites operations. Types: item_sites.d.ts. */
class ItemSites {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List item sites (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_sites").ItemSitesQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-sites/list-item-sites
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_sites.query", connectionId, params, options);
  }
}

module.exports = { ItemSites };
