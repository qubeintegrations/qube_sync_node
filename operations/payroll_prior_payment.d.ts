// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilterPaycheck, ClassRef, ModifiedDateRangeFilterPaycheck, PayrollDateRangeFilter, RefNumberFilterPaycheck, RefNumberRangeFilterPaycheck, TxnDateRangeFilterPaycheck } from "./types";

/** QuickBooks payroll prior payment operations: `qube.payrollPriorPayment.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollPriorPayment {
  constructor(client: Client);
  /**
   * Create payroll prior payment: `POST /connections/{connection_id}/payroll-prior-payments`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_ref`, `def_macro`, `include_ret_element`, `is_affecting_accounts` (required), `memo`, `payroll_date`, `payroll_prior_payment_line_add` (required), `ref_number`, `request_id`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-prior-payments/create-payroll-prior-payment
   */
  create(connectionId: string, params: PayrollPriorPaymentCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List payroll prior payments: `GET /connections/{connection_id}/payroll-prior-payments`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `entity_filter`, `include_line_items`, `include_ret_element`, `max_returned`, `meta_data`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-prior-payments/list-payroll-prior-payments
   */
  query(connectionId: string, params: PayrollPriorPaymentQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_prior_payment.create`: Create payroll prior payment.
 */
export interface PayrollPriorPaymentCreateParams {
  account_ref?: ClassRef;
  def_macro?: string;
  include_ret_element?: Array<"AccountRef" | "Amount" | "EditSequence" | "IsAffectingAccounts" | "Memo" | "PayrollDate" | "PayrollPriorPaymentLineRet" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  is_affecting_accounts: boolean;
  memo?: string;
  /**
   * Format: date.
   */
  payroll_date?: string;
  payroll_prior_payment_line_add: PayrollPriorPaymentLineAdd[];
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Format: date.
   */
  txn_date?: string;
}

/**
 * The params of `payroll_prior_payment.query`: List payroll prior payments.
 */
export interface PayrollPriorPaymentQueryParams {
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  account_filter?: AccountFilterPaycheck;
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `payroll_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  entity_filter?: AccountFilterPaycheck;
  include_line_items?: boolean;
  include_ret_element?: Array<"AccountRef" | "Amount" | "EditSequence" | "IsAffectingAccounts" | "Memo" | "PayrollDate" | "PayrollPriorPaymentLineRet" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
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

export interface PayrollPriorPaymentLineAdd {
  account_ref?: ClassRef;
  amount?: number;
  memo?: string;
  payroll_item_ref?: ClassRef;
}
