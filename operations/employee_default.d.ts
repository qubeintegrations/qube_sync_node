// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ClassRef } from "./types";

/** QuickBooks employee default operations: `qube.employeeDefault.<action>(connectionId, params, { webhookUrl })`. */
export declare class EmployeeDefault {
  constructor(client: Client);
  /**
   * List employee defaults: `GET /connections/{connection_id}/employee-defaults`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `include_ret_element`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/employee-defaults/list-employee-defaults
   */
  query(connectionId: string, params: EmployeeDefaultQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update employee default: `PUT /connections/{connection_id}/employee-defaults`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `employee_default_payroll_info_mod`, `include_ret_element`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/employee-defaults/update-employee-default
   */
  update(connectionId: string, params: EmployeeDefaultUpdateParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `employee_default.query`: List employee defaults.
 */
export interface EmployeeDefaultQueryParams {
  include_ret_element?: "EmployeeDefaultPayrollInfo"[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `employee_default.update`: Update employee default.
 */
export interface EmployeeDefaultUpdateParams {
  employee_default_payroll_info_mod?: EmployeeDefaultPayrollInfoMod;
  include_ret_element?: "EmployeeDefaultPayrollInfo"[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

export interface EarningsEmployeeDefault {
  payroll_item_wage_ref: ClassRef;
  /**
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate?: number;
  /**
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate_percent?: number;
}

export interface EmployeeDefaultPayrollInfoMod {
  class_ref?: ClassRef;
  /**
   * Choose at most one of: `clear_earnings`, or `earnings`.
   */
  clear_earnings?: boolean;
  /**
   * Choose at most one of: `clear_non_earnings`, or `non_earnings`.
   */
  clear_non_earnings?: boolean;
  /**
   * Choose at most one of: `clear_earnings`, or `earnings`.
   */
  earnings?: EarningsEmployeeDefault[];
  employee_tax_info?: EmployeeTaxInfo;
  is_covered_by_qualified_pension_plan?: boolean;
  /**
   * Choose at most one of: `clear_non_earnings`, or `non_earnings`.
   */
  non_earnings?: NonEarnings[];
  pay_period?: "Biweekly" | "Daily" | "Monthly" | "Quarterly" | "Semimonthly" | "Weekly" | "Yearly";
  sick_hours_default?: SickHoursDefault;
  use_time_data_to_create_paychecks?: "DoNotUseTimeData" | "NotSet" | "UseTimeData";
  vacation_hours_default?: SickHoursDefault;
}

export interface EmployeeTax {
  is_subject_to_tax?: boolean;
  payroll_item_tax_ref: ClassRef;
  tax_info?: TaxInfo[];
  tax_law_version?: number;
}

export interface EmployeeTaxInfo {
  employee_tax?: EmployeeTax[];
  is_standard_taxation_required?: boolean;
  state_lived?: string;
  state_worked?: string;
}

export interface NonEarnings {
  /**
   * Choose at most one of: `amount`, or `rate_percent`.
   */
  amount?: number;
  limit?: number;
  payroll_item_non_wage_ref: ClassRef;
  /**
   * Choose at most one of: `amount`, or `rate_percent`.
   */
  rate_percent?: number;
}

export interface SickHoursDefault {
  accrual_period?: "BeginningOfYear" | "EveryHourOnPaycheck" | "EveryPaycheck";
  hours_accrued?: string;
  is_resetting_hours_each_new_year?: boolean;
  maximum_hours?: string;
}

export interface TaxInfo {
  tax_info_category: string;
  tax_info_value: string;
}
