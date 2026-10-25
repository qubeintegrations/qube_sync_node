// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilterPaycheck, ClassRef, ModifiedDateRangeFilterPaycheck, PayrollDateRangeFilter, RefNumberFilterPaycheck, RefNumberRangeFilterPaycheck, TxnDateRangeFilterPaycheck } from "./types";

/** QuickBooks payroll year to date adjustment operations: `qube.payrollYearToDateAdjustment.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollYearToDateAdjustment {
  constructor(client: Client);
  /**
   * Create payroll year to date adjustment: `POST /connections/{connection_id}/payroll-year-to-date-adjustments`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_ref`, `class_ref`, `def_macro`, `employee_ref` (required), `include_ret_element`, `is_affecting_accounts` (required), `memo`, `pay_period_begin_date`, `pay_period_end_date`, `payroll_date`, `payroll_year_to_date_adjustment_line_add` (required), `ref_number`, `request_id`, `tax_table_version`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-year-to-date-adjustments/create-payroll-year-to-date-adjustment
   */
  create(connectionId: string, params: PayrollYearToDateAdjustmentCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List payroll year to date adjustments: `GET /connections/{connection_id}/payroll-year-to-date-adjustments`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `entity_filter`, `include_line_items`, `include_ret_element`, `max_returned`, `meta_data`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-year-to-date-adjustments/list-payroll-year-to-date-adjustments
   */
  query(connectionId: string, params: PayrollYearToDateAdjustmentQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_year_to_date_adjustment.create`: Create payroll year to date adjustment.
 */
export interface PayrollYearToDateAdjustmentCreateParams {
  account_ref?: ClassRef;
  class_ref?: ClassRef;
  def_macro?: string;
  employee_ref: ClassRef;
  include_ret_element?: Array<"AccountRef" | "Amount" | "ClassRef" | "EditSequence" | "EmployeeRef" | "IsAffectingAccounts" | "Memo" | "PayPeriodBeginDate" | "PayPeriodEndDate" | "PayrollDate" | "PayrollYearToDateAdjustmentLineRet" | "RefNumber" | "TaxTableVersion" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  is_affecting_accounts: boolean;
  memo?: string;
  /**
   * Format: date.
   */
  pay_period_begin_date?: string;
  /**
   * Format: date.
   */
  pay_period_end_date?: string;
  /**
   * Format: date.
   */
  payroll_date?: string;
  payroll_year_to_date_adjustment_line_add: PayrollYearToDateAdjustmentLineAdd[];
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
 * The params of `payroll_year_to_date_adjustment.query`: List payroll year to date adjustments.
 */
export interface PayrollYearToDateAdjustmentQueryParams {
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  account_filter?: AccountFilterPaycheck;
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  entity_filter?: AccountFilterPaycheck;
  include_line_items?: boolean;
  include_ret_element?: Array<"AccountRef" | "Amount" | "ClassRef" | "EditSequence" | "EmployeeRef" | "IsAffectingAccounts" | "Memo" | "PayPeriodBeginDate" | "PayPeriodEndDate" | "PayrollDate" | "PayrollYearToDateAdjustmentLineRet" | "RefNumber" | "TaxTableVersion" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
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

export interface PayrollYearToDateAdjustmentLineAdd {
  account_ref?: ClassRef;
  amount?: number;
  calculated_amount?: number;
  class_ref?: ClassRef;
  company_paid_attribute?: "IsExpense" | "IsLiability" | "IsLiabilityAndExpense" | "NotApplicable";
  experience_mod_rate_amount?: number;
  hours_worked?: string;
  income_subject_to_tax_amount?: number;
  is_amount_overridden?: boolean;
  memo?: string;
  other_account_ref?: ClassRef;
  payroll_item_ref?: ClassRef;
  /**
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate?: number;
  /**
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate_percent?: number;
  wage_base_amount?: number;
  workers_comp_amount?: number;
  workers_comp_code_ref?: ClassRef;
}
