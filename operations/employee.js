// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks employee operations. Types: employee.d.ts. */
class Employee {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create employee.
   * @param {string} connectionId
   * @param {import("./employee").EmployeeCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/employees/create-employee
   */
  create(connectionId, params, options) {
    return this.#client.queue("employee.create", connectionId, params, options);
  }

  /**
   * List employees.
   * @param {string} connectionId
   * @param {import("./employee").EmployeeQueryParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/employees/list-employees
   */
  query(connectionId, params, options) {
    return this.#client.queue("employee.query", connectionId, params, options);
  }

  /**
   * Update employee.
   * @param {string} connectionId
   * @param {import("./employee").EmployeeUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/employees/update-employee
   */
  update(connectionId, params, options) {
    return this.#client.queue("employee.update", connectionId, params, options);
  }
}

module.exports = { Employee };
