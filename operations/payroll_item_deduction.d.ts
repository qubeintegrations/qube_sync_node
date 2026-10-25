// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ClassRef, LiabilityPaymentSchedule, Taxability } from "./types";

/** QuickBooks payroll item deduction operations: `qube.payrollItemDeduction.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollItemDeduction {
  constructor(client: Client);
  /**
   * Create payroll item deduction: `POST /connections/{connection_id}/payroll-item-deductions`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `calculated_based_on`, `include_ret_element`, `is_active`, `liability_account_ref` (required), `liability_payment_schedule`, `limit`, `limit_time_period`, `name` (required), `net_or_gross`, `payment_template_ref` (required), `payroll_item_detail_type_value`, `rate`, `rate_percent`, `request_id`, `taxability`, `vendor_account_number`, `vendor_ref`, `w2_tracking_type_value`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-deductions/create-payroll-item-deduction
   */
  create(connectionId: string, params: PayrollItemDeductionCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update payroll item deduction: `PUT /connections/{connection_id}/payroll-item-deductions`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `calculated_based_on`, `edit_sequence` (required), `include_ret_element`, `is_active`, `liability_account_ref`, `liability_payment_schedule`, `limit`, `limit_time_period`, `list_id` (required), `name`, `net_or_gross`, `payment_template_ref`, `payroll_item_detail_type_value`, `rate`, `rate_percent`, `request_id`, `taxability`, `vendor_account_number`, `vendor_ref`, `w2_tracking_type_value`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-deductions/update-payroll-item-deduction
   */
  update(connectionId: string, params: PayrollItemDeductionUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_item_deduction.create`: Create payroll item deduction.
 */
export interface PayrollItemDeductionCreateParams {
  calculated_based_on?: "HoursAll" | "HoursWorked" | "Quantity" | "Rate";
  include_ret_element?: Array<"CalculatedBasedOn" | "EditSequence" | "IsActive" | "LiabilityAccountRef" | "LiabilityPaymentSchedule" | "Limit" | "LimitTimePeriod" | "ListID" | "Name" | "NetOrGross" | "PaymentTemplateRef" | "PayrollItemDetailTypeValue" | "Rate" | "RatePercent" | "Taxability" | "TimeCreated" | "TimeModified" | "VendorAccountNumber" | "VendorRef" | "W2TrackingTypeValue">;
  is_active?: boolean;
  liability_account_ref: ClassRef;
  liability_payment_schedule?: LiabilityPaymentSchedule;
  limit?: number;
  limit_time_period?: "Annual" | "Forever";
  name: string;
  net_or_gross?: "Gross" | "Net";
  payment_template_ref: ClassRef;
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
  vendor_account_number?: string;
  vendor_ref?: ClassRef;
  w2_tracking_type_value?: number;
}

/**
 * The params of `payroll_item_deduction.update`: Update payroll item deduction.
 */
export interface PayrollItemDeductionUpdateParams {
  calculated_based_on?: "HoursAll" | "HoursWorked" | "Quantity" | "Rate";
  edit_sequence: string;
  include_ret_element?: Array<"CalculatedBasedOn" | "EditSequence" | "IsActive" | "LiabilityAccountRef" | "LiabilityPaymentSchedule" | "Limit" | "LimitTimePeriod" | "ListID" | "Name" | "NetOrGross" | "PaymentTemplateRef" | "PayrollItemDetailTypeValue" | "Rate" | "RatePercent" | "Taxability" | "TimeCreated" | "TimeModified" | "VendorAccountNumber" | "VendorRef" | "W2TrackingTypeValue">;
  is_active?: boolean;
  liability_account_ref?: ClassRef;
  liability_payment_schedule?: LiabilityPaymentSchedule;
  limit?: number;
  limit_time_period?: "Annual" | "Forever";
  list_id: string;
  name?: string;
  net_or_gross?: "Gross" | "Net";
  payment_template_ref?: ClassRef;
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
  vendor_account_number?: string;
  vendor_ref?: ClassRef;
  w2_tracking_type_value?: number;
}
