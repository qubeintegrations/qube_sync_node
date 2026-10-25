// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks payroll item operations: `qube.payrollItem.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollItem {
  constructor(client: Client);
  /**
   * List payroll items: `GET /connections/{connection_id}/payroll-items`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-items/list-payroll-items
   */
  query(connectionId: string, params: PayrollItemQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_item.query`: List payroll items.
 */
export interface PayrollItemQueryParams {
  /**
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"CalculatedBasedOn" | "EditSequence" | "ExpenseAccountRef" | "IsActive" | "IsTrackedByCustJob" | "LiabilityAccountRef" | "LiabilityPaymentSchedule" | "Limit" | "LimitTimePeriod" | "ListID" | "Name" | "NetOrGross" | "OvertimeMultiplier" | "PaymentTemplateRef" | "PayrollItemDetailTypeValue" | "Rate" | "RateChange" | "RatePercent" | "State" | "TaxCalculatedBasedOn" | "Taxability" | "TimeCreated" | "TimeModified" | "VendorAccountNumber" | "VendorRef" | "W2TrackingTypeValue" | "WageType">;
  /**
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * QuickBooks doesn't page this query: at most this many records come back, in one answer, with no sign of whether more matched. Leave it out for every match, in one answer; one over 4 MB as the Web Connector sends it, about 3 MB of qbXML isn't kept (`error_type` `response_too_large`), so narrow a large one with its filters.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilterPayrollItem;
  /**
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_range_filter?: NameRangeFilterPayrollItem;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

export interface NameFilterPayrollItem {
  match_criterion: "Contains" | "EndsWith" | "StartsWith";
  name: string;
}

export interface NameRangeFilterPayrollItem {
  from_name?: string;
  to_name?: string;
}
