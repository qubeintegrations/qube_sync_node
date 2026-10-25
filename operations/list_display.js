// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks list display operations. Types: list_display.d.ts. */
class ListDisplay {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create list display.
   * @param {string} connectionId
   * @param {import("./list_display").ListDisplayCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/list-displays/create-list-display
   */
  create(connectionId, params, options) {
    return this.#client.queue("list_display.create", connectionId, params, options);
  }

  /**
   * Update list display.
   * @param {string} connectionId
   * @param {import("./list_display").ListDisplayUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/list-displays/update-list-display
   */
  update(connectionId, params, options) {
    return this.#client.queue("list_display.update", connectionId, params, options);
  }
}

module.exports = { ListDisplay };
