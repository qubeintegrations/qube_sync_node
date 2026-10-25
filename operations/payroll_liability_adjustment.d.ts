// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilterPaycheck, ClassRef, ModifiedDateRangeFilterPaycheck, PayrollDateRangeFilter, RefNumberFilterPaycheck, RefNumberRangeFilterPaycheck, TxnDateRangeFilterPaycheck } from "./types";

/** QuickBooks payroll liability adjustment operations: `qube.payrollLiabilityAdjustment.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollLiabilityAdjustment {
  constructor(client: Client);
  /**
   * Create payroll liability adjustment: `POST /connections/{connection_id}/payroll-liability-adjustments`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_ref`, `class_ref`, `def_macro`, `employee_ref`, `include_ret_element`, `is_affecting_accounts` (required), `memo`, `payroll_date`, `payroll_liability_adjustment_line_add` (required), `ref_number`, `request_id`, `tax_table_version`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-liability-adjustments/create-payroll-liability-adjustment
   */
  create(connectionId: string, params: PayrollLiabilityAdjustmentCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List payroll liability adjustments: `GET /connections/{connection_id}/payroll-liability-adjustments`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `entity_filter`, `include_line_items`, `include_ret_element`, `max_returned`, `meta_data`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-liability-adjustments/list-payroll-liability-adjustments
   */
  query(connectionId: string, params: PayrollLiabilityAdjustmentQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_liability_adjustment.create`: Create payroll liability adjustment.
 */
export interface PayrollLiabilityAdjustmentCreateParams {
  account_ref?: ClassRef;
  class_ref?: ClassRef;
  def_macro?: string;
  employee_ref?: ClassRef;
  include_ret_element?: Array<"AccountRef" | "Amount" | "ClassRef" | "EditSequence" | "EmployeeRef" | "IsAffectingAccounts" | "Memo" | "PayrollDate" | "PayrollLiabilityAdjustmentLineRet" | "RefNumber" | "TaxTableVersion" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  is_affecting_accounts: boolean;
  memo?: string;
  /**
   * Format: date.
   */
  payroll_date?: string;
  payroll_liability_adjustment_line_add: PayrollLiabilityAdjustmentLineAdd[];
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  tax_table_version?: number;
  /**
   * Format: date.
   */
  txn_date?: string;
}

/**
 * The params of `payroll_liability_adjustment.query`: List payroll liability adjustments.
 */
export interface PayrollLiabilityAdjustmentQueryParams {
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  account_filter?: AccountFilterPaycheck;
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  entity_filter?: AccountFilterPaycheck;
  include_line_items?: boolean;
  include_ret_element?: Array<"AccountRef" | "Amount" | "ClassRef" | "EditSequence" | "EmployeeRef" | "IsAffectingAccounts" | "Memo" | "PayrollDate" | "PayrollLiabilityAdjustmentLineRet" | "RefNumber" | "TaxTableVersion" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * QuickBooks doesn't page this query: at most this many records come back, in one answer, with no sign of whether more matched. Leave it out for every match, in one answer; one over 4 MB as the Web Connector sends it, about 3 MB of qbXML isn't kept (`error_type` `response_too_large`), so narrow a large one with its filters.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  modified_date_range_filter?: ModifiedDateRangeFilterPaycheck;
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  payroll_date_range_filter?: PayrollDateRangeFilter;
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number?: string[];
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_case_sensitive?: string[];
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_filter?: RefNumberFilterPaycheck;
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_range_filter?: RefNumberRangeFilterPaycheck;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_date_range_filter?: TxnDateRangeFilterPaycheck;
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_id?: string[];
}

export interface PayrollLiabilityAdjustmentLineAdd {
  account_ref?: ClassRef;
  amount?: number;
  class_ref?: ClassRef;
  company_paid_attribute?: "IsExpense" | "IsLiability" | "IsLiabilityAndExpense" | "NotApplicable";
  experience_mod_rate_amount?: number;
  income_subject_to_tax_amount?: number;
  memo?: string;
  other_account_ref?: ClassRef;
  payroll_item_ref?: ClassRef;
  wage_base_amount?: number;
  workers_comp_amount?: number;
  workers_comp_code_ref?: ClassRef;
}
