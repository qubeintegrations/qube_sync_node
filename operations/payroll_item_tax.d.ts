// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ClassRef, LiabilityPaymentSchedule } from "./types";

/** QuickBooks payroll item tax operations: `qube.payrollItemTax.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollItemTax {
  constructor(client: Client);
  /**
   * Create payroll item tax: `POST /connections/{connection_id}/payroll-item-taxes`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `expense_account_ref`, `include_ret_element`, `is_active`, `liability_account_ref` (required), `liability_payment_schedule`, `limit`, `name` (required), `payment_template_ref` (required), `payroll_item_detail_type_value` (required), `rate`, `rate_change`, `rate_percent`, `request_id`, `state`, `tax_calculated_based_on`, `vendor_account_number`, `vendor_ref`, `w2_tracking_type_value`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-taxes/create-payroll-item-tax
   */
  create(connectionId: string, params: PayrollItemTaxCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update payroll item tax: `PUT /connections/{connection_id}/payroll-item-taxes`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `edit_sequence` (required), `expense_account_ref`, `include_ret_element`, `is_active`, `liability_account_ref`, `liability_payment_schedule`, `limit`, `list_id` (required), `name`, `payment_template_ref`, `rate`, `rate_change`, `rate_percent`, `request_id`, `state`, `tax_calculated_based_on`, `vendor_account_number`, `vendor_ref`, `w2_tracking_type_value`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-taxes/update-payroll-item-tax
   */
  update(connectionId: string, params: PayrollItemTaxUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_item_tax.create`: Create payroll item tax.
 */
export interface PayrollItemTaxCreateParams {
  expense_account_ref?: ClassRef;
  include_ret_element?: Array<"EditSequence" | "ExpenseAccountRef" | "IsActive" | "LiabilityAccountRef" | "LiabilityPaymentSchedule" | "Limit" | "ListID" | "Name" | "PaymentTemplateRef" | "PayrollItemDetailTypeValue" | "Rate" | "RateChange" | "RatePercent" | "State" | "TaxCalculatedBasedOn" | "TimeCreated" | "TimeModified" | "VendorAccountNumber" | "VendorRef" | "W2TrackingTypeValue">;
  is_active?: boolean;
  liability_account_ref: ClassRef;
  liability_payment_schedule?: LiabilityPaymentSchedule;
  limit?: number;
  name: string;
  payment_template_ref: ClassRef;
  payroll_item_detail_type_value: number;
  /**
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate?: number;
  rate_change?: RateChange[];
  /**
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate_percent?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  state?: string;
  tax_calculated_based_on?: "Compensation" | "HoursAll" | "HoursWorked" | "Quantity";
  vendor_account_number?: string;
  vendor_ref?: ClassRef;
  w2_tracking_type_value?: number;
}

/**
 * The params of `payroll_item_tax.update`: Update payroll item tax.
 */
export interface PayrollItemTaxUpdateParams {
  edit_sequence: string;
  expense_account_ref?: ClassRef;
  include_ret_element?: Array<"EditSequence" | "ExpenseAccountRef" | "IsActive" | "LiabilityAccountRef" | "LiabilityPaymentSchedule" | "Limit" | "ListID" | "Name" | "PaymentTemplateRef" | "PayrollItemDetailTypeValue" | "Rate" | "RateChange" | "RatePercent" | "State" | "TaxCalculatedBasedOn" | "TimeCreated" | "TimeModified" | "VendorAccountNumber" | "VendorRef" | "W2TrackingTypeValue">;
  is_active?: boolean;
  liability_account_ref?: ClassRef;
  liability_payment_schedule?: LiabilityPaymentSchedule;
  limit?: number;
  list_id: string;
  name?: string;
  payment_template_ref?: ClassRef;
  /**
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate?: number;
  rate_change?: RateChange[];
  /**
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate_percent?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  state?: string;
  tax_calculated_based_on?: "Compensation" | "HoursAll" | "HoursWorked" | "Quantity";
  vendor_account_number?: string;
  vendor_ref?: ClassRef;
  w2_tracking_type_value?: number;
}

export interface RateChange {
  rate_percent: number;
  /**
   * Format: date.
   */
  sunset_date: string;
}
