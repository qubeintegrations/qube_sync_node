// Generated from operations.json by scripts/generate-operations.js: don't edit.
"use strict";

/** QuickBooks payroll item company contribution operations. Types: payroll_item_company_contribution.d.ts. */
class PayrollItemCompanyContribution {
  #client;

  /** @param {import("../index").Client} client */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Create payroll item company contribution.
   * @param {string} connectionId
   * @param {import("./payroll_item_company_contribution").PayrollItemCompanyContributionCreateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-company-contributions/create-payroll-item-company-contribution
   */
  create(connectionId, params, options) {
    return this.#client.queue("payroll_item_company_contribution.create", connectionId, params, options);
  }

  /**
   * Update payroll item company contribution.
   * @param {string} connectionId
   * @param {import("./payroll_item_company_contribution").PayrollItemCompanyContributionUpdateParams} params
   * @param {import("./types").OperationOptions} options
   * @returns {Promise<import("./types").QueuedRequest>}
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-company-contributions/update-payroll-item-company-contribution
   */
  update(connectionId, params, options) {
    return this.#client.queue("payroll_item_company_contribution.update", connectionId, params, options);
  }
}

module.exports = { PayrollItemCompanyContribution };
