// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item fixed asset operations. Types: item_fixed_asset.d.ts. */
class ItemFixedAsset {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item fixed asset.
   * @param {string} connectionId
   * @param {import("./item_fixed_asset").ItemFixedAssetCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-fixed-assets/create-item-fixed-asset
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_fixed_asset.create", connectionId, params, options);
  }

  /**
   * List item fixed assets (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_fixed_asset").ItemFixedAssetQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-fixed-assets/list-item-fixed-assets
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_fixed_asset.query", connectionId, params, options);
  }

  /**
   * Update item fixed asset.
   * @param {string} connectionId
   * @param {import("./item_fixed_asset").ItemFixedAssetUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-fixed-assets/update-item-fixed-asset
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_fixed_asset.update", connectionId, params, options);
  }
}

module.exports = { ItemFixedAsset };
