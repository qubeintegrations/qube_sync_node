// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ClassRef, Taxability } from "./types";

/** QuickBooks payroll item addition operations: `qube.payrollItemAddition.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollItemAddition {
  constructor(client: Client);
  /**
   * Create payroll item addition: `POST /connections/{connection_id}/payroll-item-additions`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `calculated_based_on`, `expense_account_ref` (required), `include_ret_element`, `is_active`, `is_tracked_by_cust_job`, `limit`, `limit_time_period`, `name` (required), `net_or_gross`, `payroll_item_detail_type_value`, `rate`, `rate_percent`, `request_id`, `taxability`, `w2_tracking_type_value`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-additions/create-payroll-item-addition
   */
  create(connectionId: string, params: PayrollItemAdditionCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update payroll item addition: `PUT /connections/{connection_id}/payroll-item-additions`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `calculated_based_on`, `edit_sequence` (required), `expense_account_ref`, `include_ret_element`, `is_active`, `is_tracked_by_cust_job`, `limit`, `limit_time_period`, `list_id` (required), `name`, `net_or_gross`, `payroll_item_detail_type_value`, `rate`, `rate_percent`, `request_id`, `taxability`, `w2_tracking_type_value`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-additions/update-payroll-item-addition
   */
  update(connectionId: string, params: PayrollItemAdditionUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_item_addition.create`: Create payroll item addition.
 */
export interface PayrollItemAdditionCreateParams {
  calculated_based_on?: "HoursAll" | "HoursWorked" | "Quantity" | "Rate";
  expense_account_ref: ClassRef;
  include_ret_element?: Array<"CalculatedBasedOn" | "EditSequence" | "ExpenseAccountRef" | "IsActive" | "IsTrackedByCustJob" | "Limit" | "LimitTimePeriod" | "ListID" | "Name" | "NetOrGross" | "PayrollItemDetailTypeValue" | "Rate" | "RatePercent" | "Taxability" | "TimeCreated" | "TimeModified" | "W2TrackingTypeValue">;
  is_active?: boolean;
  is_tracked_by_cust_job?: boolean;
  limit?: number;
  limit_time_period?: "Annual" | "Forever";
  name: string;
  net_or_gross?: "Gross" | "Net";
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
  taxability?: Taxability[];
  w2_tracking_type_value?: number;
}

/**
 * The params of `payroll_item_addition.update`: Update payroll item addition.
 */
export interface PayrollItemAdditionUpdateParams {
  calculated_based_on?: "HoursAll" | "HoursWorked" | "Quantity" | "Rate";
  edit_sequence: string;
  expense_account_ref?: ClassRef;
  include_ret_element?: Array<"CalculatedBasedOn" | "EditSequence" | "ExpenseAccountRef" | "IsActive" | "IsTrackedByCustJob" | "Limit" | "LimitTimePeriod" | "ListID" | "Name" | "NetOrGross" | "PayrollItemDetailTypeValue" | "Rate" | "RatePercent" | "Taxability" | "TimeCreated" | "TimeModified" | "W2TrackingTypeValue">;
  is_active?: boolean;
  is_tracked_by_cust_job?: boolean;
  limit?: number;
  limit_time_period?: "Annual" | "Forever";
  list_id: string;
  name?: string;
  net_or_gross?: "Gross" | "Net";
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
  taxability?: Taxability[];
  w2_tracking_type_value?: number;
}
