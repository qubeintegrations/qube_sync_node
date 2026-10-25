// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks custom detail report operations. Types: custom_detail_report.d.ts. */
class CustomDetailReport {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List custom detail reports.
   * @param {string} connectionId
   * @param {import("./custom_detail_report").CustomDetailReportQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/custom-detail-reports/list-custom-detail-reports
   */
  query(connectionId, params, options) {
    return this.#client.queue("custom_detail_report.query", connectionId, params, options);
  }
}

module.exports = { CustomDetailReport };
