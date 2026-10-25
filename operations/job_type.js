// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks job type operations. Types: job_type.d.ts. */
class JobType {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create job type.
   * @param {string} connectionId
   * @param {import("./job_type").JobTypeCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/job-types/create-job-type
   */
  create(connectionId, params, options) {
    return this.#client.queue("job_type.create", connectionId, params, options);
  }

  /**
   * List job types.
   * @param {string} connectionId
   * @param {import("./job_type").JobTypeQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/job-types/list-job-types
   */
  query(connectionId, params, options) {
    return this.#client.queue("job_type.query", connectionId, params, options);
  }
}

module.exports = { JobType };
