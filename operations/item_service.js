// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks item service operations. Types: item_service.d.ts. */
class ItemService {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create item service.
   * @param {string} connectionId
   * @param {import("./item_service").ItemServiceCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-services/create-item-service
   */
  create(connectionId, params, options) {
    return this.#client.queue("item_service.create", connectionId, params, options);
  }

  /**
   * List item services (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./item_service").ItemServiceQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-services/list-item-services
   */
  query(connectionId, params, options) {
    return this.#client.queue("item_service.query", connectionId, params, options);
  }

  /**
   * Update item service.
   * @param {string} connectionId
   * @param {import("./item_service").ItemServiceUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/item-services/update-item-service
   */
  update(connectionId, params, options) {
    return this.#client.queue("item_service.update", connectionId, params, options);
  }
}

module.exports = { ItemService };
