// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ClassRef, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks payroll item wage operations: `qube.payrollItemWage.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollItemWage {
  constructor(client: Client);
  /**
   * Create payroll item wage: `POST /connections/{connection_id}/payroll-item-wages`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `expense_account_ref` (required), `include_ret_element`, `is_active`, `name` (required), `request_id`, `wage_type` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-wages/create-payroll-item-wage
   */
  create(connectionId: string, params: PayrollItemWageCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List payroll item wages: `GET /connections/{connection_id}/payroll-item-wages`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-wages/list-payroll-item-wages
   */
  query(connectionId: string, params: PayrollItemWageQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update payroll item wage: `PUT /connections/{connection_id}/payroll-item-wages`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `edit_sequence` (required), `expense_account_ref`, `include_ret_element`, `is_active`, `list_id` (required), `name`, `overtime_multiplier`, `payroll_item_detail_type_value`, `rate`, `rate_percent`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-wages/update-payroll-item-wage
   */
  update(connectionId: string, params: PayrollItemWageUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_item_wage.create`: Create payroll item wage.
 */
export interface PayrollItemWageCreateParams {
  /**
   * Refers to an expense account. If an `expense_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  expense_account_ref: CurrencyRef;
  include_ret_element?: Array<"EditSequence" | "ExpenseAccountRef" | "IsActive" | "ListID" | "Name" | "OvertimeMultiplier" | "PayrollItemDetailTypeValue" | "Rate" | "RatePercent" | "TimeCreated" | "TimeModified" | "WageType">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Description of the wage: for example, Regular Pay or Overtime Pay.
   */
  name: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The type of pay.
   */
  wage_type: "Bonus" | "Commission" | "HourlyOvertime" | "HourlyRegular" | "HourlySick" | "HourlyVacation" | "SalaryRegular" | "SalarySick" | "SalaryVacation";
}

/**
 * The params of `payroll_item_wage.query`: List payroll item wages.
 */
export interface PayrollItemWageQueryParams {
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"EditSequence" | "ExpenseAccountRef" | "IsActive" | "ListID" | "Name" | "OvertimeMultiplier" | "PayrollItemDetailTypeValue" | "Rate" | "RatePercent" | "TimeCreated" | "TimeModified" | "WageType">;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * QuickBooks doesn't page this query: at most this many records come back, in one answer, with no sign of whether more matched. Leave it out for every match, in one answer; one over 4 MB as the Web Connector sends it, about 3 MB of qbXML isn't kept (`error_type` `response_too_large`), so narrow a large one with its filters.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_range_filter?: NameRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters results to objects modified on or before this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to end-of-day (23:59:59).
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `payroll_item_wage.update`: Update payroll item wage.
 */
export interface PayrollItemWageUpdateParams {
  edit_sequence: string;
  expense_account_ref?: ClassRef;
  include_ret_element?: Array<"EditSequence" | "ExpenseAccountRef" | "IsActive" | "ListID" | "Name" | "OvertimeMultiplier" | "PayrollItemDetailTypeValue" | "Rate" | "RatePercent" | "TimeCreated" | "TimeModified" | "WageType">;
  is_active?: boolean;
  list_id: string;
  name?: string;
  overtime_multiplier?: number;
  payroll_item_detail_type_value?: number;
  /**
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate?: number;
  /**
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate_percent?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
