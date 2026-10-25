// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ClassRef } from "./types";

/** QuickBooks payroll item direct deposit operations: `qube.payrollItemDirectDeposit.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollItemDirectDeposit {
  constructor(client: Client);
  /**
   * Create payroll item direct deposit: `POST /connections/{connection_id}/payroll-item-direct-deposits`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `include_ret_element`, `is_active`, `liability_account_ref` (required), `name` (required), `payroll_item_detail_type_value`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-direct-deposits/create-payroll-item-direct-deposit
   */
  create(connectionId: string, params: PayrollItemDirectDepositCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update payroll item direct deposit: `PUT /connections/{connection_id}/payroll-item-direct-deposits`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `edit_sequence` (required), `include_ret_element`, `is_active`, `liability_account_ref`, `list_id` (required), `name`, `payroll_item_detail_type_value`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-item-direct-deposits/update-payroll-item-direct-deposit
   */
  update(connectionId: string, params: PayrollItemDirectDepositUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_item_direct_deposit.create`: Create payroll item direct deposit.
 */
export interface PayrollItemDirectDepositCreateParams {
  include_ret_element?: Array<"EditSequence" | "IsActive" | "LiabilityAccountRef" | "ListID" | "Name" | "PayrollItemDetailTypeValue" | "TimeCreated" | "TimeModified">;
  is_active?: boolean;
  liability_account_ref: ClassRef;
  name: string;
  payroll_item_detail_type_value?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `payroll_item_direct_deposit.update`: Update payroll item direct deposit.
 */
export interface PayrollItemDirectDepositUpdateParams {
  edit_sequence: string;
  include_ret_element?: Array<"EditSequence" | "IsActive" | "LiabilityAccountRef" | "ListID" | "Name" | "PayrollItemDetailTypeValue" | "TimeCreated" | "TimeModified">;
  is_active?: boolean;
  liability_account_ref?: ClassRef;
  list_id: string;
  name?: string;
  payroll_item_detail_type_value?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
