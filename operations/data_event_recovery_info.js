// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks data event recovery info operations. Types: data_event_recovery_info.d.ts. */
class DataEventRecoveryInfo {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Delete data event recovery info.
   * @param {string} connectionId
   * @param {import("./data_event_recovery_info").DataEventRecoveryInfoDeleteParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/data-event-recovery-infos/delete-data-event-recovery-info
   */
  delete(connectionId, params, options) {
    return this.#client.queue("data_event_recovery_info.delete", connectionId, params, options);
  }

  /**
   * List data event recovery infos.
   * @param {string} connectionId
   * @param {import("./data_event_recovery_info").DataEventRecoveryInfoQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/data-event-recovery-infos/list-data-event-recovery-infos
   */
  query(connectionId, params, options) {
    return this.#client.queue("data_event_recovery_info.query", connectionId, params, options);
  }
}

module.exports = { DataEventRecoveryInfo };
