// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks job report operations. Types: job_report.d.ts. */
class JobReport {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List job reports.
   * @param {string} connectionId
   * @param {import("./job_report").JobReportQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/job-reports/list-job-reports
   */
  query(connectionId, params, options) {
    return this.#client.queue("job_report.query", connectionId, params, options);
  }
}

module.exports = { JobReport };
