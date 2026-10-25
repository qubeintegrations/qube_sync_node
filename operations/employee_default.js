// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks employee default operations. Types: employee_default.d.ts. */
class EmployeeDefault {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * List employee defaults.
   * @param {string} connectionId
   * @param {import("./employee_default").EmployeeDefaultQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/employee-defaults/list-employee-defaults
   */
  query(connectionId, params, options) {
    return this.#client.queue("employee_default.query", connectionId, params, options);
  }

  /**
   * Update employee default.
   * @param {string} connectionId
   * @param {import("./employee_default").EmployeeDefaultUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/employee-defaults/update-employee-default
   */
  update(connectionId, params, options) {
    return this.#client.queue("employee_default.update", connectionId, params, options);
  }
}

module.exports = { EmployeeDefault };
