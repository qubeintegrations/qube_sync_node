// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ClassRef, LiabilityPaymentSchedule } from "./types";

/** QuickBooks payroll item workers compensation operations: `qube.payrollItemWorkersCompensation.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollItemWorkersCompensation {
  constructor(client: Client);
  /**
   * Create payroll item workers compensation: `POST /connections/{connection_id}/payroll-item-workers-compensations`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `expense_account_ref` (required), `include_ret_element`, `is_active`, `is_tracked_by_cust_job`, `liability_account_ref` (required), `liability_payment_schedule`, `name` (required), `payment_template_ref` (required), `payroll_item_detail_type_value`, `request_id`, `vendor_account_number`, `vendor_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-workers-compensations/create-payroll-item-workers-compensation
   */
  create(connectionId: string, params: PayrollItemWorkersCompensationCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update payroll item workers compensation: `PUT /connections/{connection_id}/payroll-item-workers-compensations`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `edit_sequence` (required), `expense_account_ref`, `include_ret_element`, `is_active`, `is_tracked_by_cust_job`, `liability_account_ref`, `liability_payment_schedule`, `list_id` (required), `name`, `payment_template_ref`, `payroll_item_detail_type_value`, `request_id`, `vendor_account_number`, `vendor_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-workers-compensations/update-payroll-item-workers-compensation
   */
  update(connectionId: string, params: PayrollItemWorkersCompensationUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_item_workers_compensation.create`: Create payroll item workers compensation.
 */
export interface PayrollItemWorkersCompensationCreateParams {
  expense_account_ref: ClassRef;
  include_ret_element?: Array<"EditSequence" | "ExpenseAccountRef" | "IsActive" | "IsTrackedByCustJob" | "LiabilityAccountRef" | "LiabilityPaymentSchedule" | "ListID" | "Name" | "PaymentTemplateRef" | "PayrollItemDetailTypeValue" | "TimeCreated" | "TimeModified" | "VendorAccountNumber" | "VendorRef">;
  is_active?: boolean;
  is_tracked_by_cust_job?: boolean;
  liability_account_ref: ClassRef;
  liability_payment_schedule?: LiabilityPaymentSchedule;
  name: string;
  payment_template_ref: ClassRef;
  payroll_item_detail_type_value?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  vendor_account_number?: string;
  vendor_ref?: ClassRef;
}

/**
 * The params of `payroll_item_workers_compensation.update`: Update payroll item workers compensation.
 */
export interface PayrollItemWorkersCompensationUpdateParams {
  edit_sequence: string;
  expense_account_ref?: ClassRef;
  include_ret_element?: Array<"EditSequence" | "ExpenseAccountRef" | "IsActive" | "IsTrackedByCustJob" | "LiabilityAccountRef" | "LiabilityPaymentSchedule" | "ListID" | "Name" | "PaymentTemplateRef" | "PayrollItemDetailTypeValue" | "TimeCreated" | "TimeModified" | "VendorAccountNumber" | "VendorRef">;
  is_active?: boolean;
  is_tracked_by_cust_job?: boolean;
  liability_account_ref?: ClassRef;
  liability_payment_schedule?: LiabilityPaymentSchedule;
  list_id: string;
  name?: string;
  payment_template_ref?: ClassRef;
  payroll_item_detail_type_value?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  vendor_account_number?: string;
  vendor_ref?: ClassRef;
}
