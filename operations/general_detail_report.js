// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks general detail report operations. Types: general_detail_report.d.ts. */
class GeneralDetailReport {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List general detail reports.
   * @param {string} connectionId
   * @param {import("./general_detail_report").GeneralDetailReportQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/general-detail-reports/list-general-detail-reports
   */
  query(connectionId, params, options) {
    return this.#client.queue("general_detail_report.query", connectionId, params, options);
  }
}

module.exports = { GeneralDetailReport };
