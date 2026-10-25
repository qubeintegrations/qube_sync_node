// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks time tracking operations. Types: time_tracking.d.ts. */
class TimeTracking {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create time tracking.
   * @param {string} connectionId
   * @param {import("./time_tracking").TimeTrackingCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/time-trackings/create-time-tracking
   */
  create(connectionId, params, options) {
    return this.#client.queue("time_tracking.create", connectionId, params, options);
  }

  /**
   * List time trackings (answers in pages, one webhook each).
   * @param {string} connectionId
   * @param {import("./time_tracking").TimeTrackingQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/time-trackings/list-time-trackings
   */
  query(connectionId, params, options) {
    return this.#client.queue("time_tracking.query", connectionId, params, options);
  }

  /**
   * Update time tracking.
   * @param {string} connectionId
   * @param {import("./time_tracking").TimeTrackingUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/time-trackings/update-time-tracking
   */
  update(connectionId, params, options) {
    return this.#client.queue("time_tracking.update", connectionId, params, options);
  }
}

module.exports = { TimeTracking };
