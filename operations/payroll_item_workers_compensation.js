// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll item workers compensation operations. Types: payroll_item_workers_compensation.d.ts. */
class PayrollItemWorkersCompensation {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payroll item workers compensation.
   * @param {string} connectionId
   * @param {import("./payroll_item_workers_compensation").PayrollItemWorkersCompensationCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-workers-compensations/create-payroll-item-workers-compensation
   */
  create(connectionId, params, options) {
    return this.#client.queue("payroll_item_workers_compensation.create", connectionId, params, options);
  }

  /**
   * Update payroll item workers compensation.
   * @param {string} connectionId
   * @param {import("./payroll_item_workers_compensation").PayrollItemWorkersCompensationUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-workers-compensations/update-payroll-item-workers-compensation
   */
  update(connectionId, params, options) {
    return this.#client.queue("payroll_item_workers_compensation.update", connectionId, params, options);
  }
}

module.exports = { PayrollItemWorkersCompensation };
