// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks alert operations. Types: alert.d.ts. */
class Alert {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create alert.
   * @param {string} connectionId
   * @param {import("./alert").AlertCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/alerts/create-alert
   */
  create(connectionId, params, options) {
    return this.#client.queue("alert.create", connectionId, params, options);
  }

  /**
   * Delete alert.
   * @param {string} connectionId
   * @param {import("./alert").AlertDeleteParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/alerts/delete-alert
   */
  delete(connectionId, params, options) {
    return this.#client.queue("alert.delete", connectionId, params, options);
  }

  /**
   * List alerts.
   * @param {string} connectionId
   * @param {import("./alert").AlertQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/alerts/list-alerts
   */
  query(connectionId, params, options) {
    return this.#client.queue("alert.query", connectionId, params, options);
  }
}

module.exports = { Alert };
