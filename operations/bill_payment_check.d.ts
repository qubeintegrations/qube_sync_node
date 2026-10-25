// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, AppliedToTxnAdd, CurrencyFilter, CurrencyRef, ModifiedDateRangeFilter, RefNumberFilter, RefNumberRangeFilter, SetCredit, TxnDateRangeFilter } from "./types";

/** QuickBooks bill payment check operations: `qube.billPaymentCheck.<action>(connectionId, params, { webhookUrl })`. */
export declare class BillPaymentCheck {
  constructor(client: Client);
  /**
   * Create bill payment check: `POST /connections/{connection_id}/bill-payment-checks`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `ap_account_ref`, `applied_to_txn_add` (required), `bank_account_ref` (required), `def_macro`, `exchange_rate`, `external_guid`, `include_ret_element`, `is_to_be_printed`, `memo`, `payee_entity_ref` (required), `ref_number`, `request_id`, `txn_date`.
   *
   * Give exactly one of: `is_to_be_printed`, or `ref_number`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/bill-payment-checks/create-bill-payment-check
   */
  create(connectionId: string, params: BillPaymentCheckCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List bill payment checks: `GET /connections/{connection_id}/bill-payment-checks`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `currency_filter`, `entity_filter`, `include_line_items`, `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/bill-payment-checks/list-bill-payment-checks
   */
  query(connectionId: string, params: BillPaymentCheckQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update bill payment check: `PUT /connections/{connection_id}/bill-payment-checks`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `amount`, `applied_to_txn_mod`, `bank_account_ref`, `edit_sequence` (required), `exchange_rate`, `include_ret_element`, `is_to_be_printed`, `memo`, `ref_number`, `request_id`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/bill-payment-checks/update-bill-payment-check
   */
  update(connectionId: string, params: BillPaymentCheckUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `bill_payment_check.create`: Create bill payment check.
 *
 * Give exactly one of: `is_to_be_printed`, or `ref_number`.
 */
export interface BillPaymentCheckCreateParams {
  /**
   * Refers to an accounts payable account in the QuickBooks file. (The AccountType of this account will be AccountsPayable.) If `ap_account_ref` is missing, the SDK will use the QuickBooks default AP account. In a request, if an `ap_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  ap_account_ref?: CurrencyRef;
  applied_to_txn_add: AppliedToTxnAdd[];
  /**
   * Refers to the account from which the funds are being drawn for this check, for example, Checking or Savings. If a `bank_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  bank_account_ref: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"APAccountRef" | "Address" | "AddressBlock" | "Amount" | "AmountInHomeCurrency" | "AppliedToTxnRet" | "BankAccountRef" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "IsToBePrinted" | "ListID" | "Memo" | "OwnerID" | "PayeeEntityRef" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * If `is_to_be_printed` is true, QuickBooks queues the form for later printing. It does not print immediately; printing is still a user action in QuickBooks.
   */
  is_to_be_printed?: boolean;
  /**
   * Additional information.
   */
  memo?: string;
  /**
   * `payee_entity_ref` identifies the payee (customer, vendor, employee, or Other Name). If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  payee_entity_ref: CurrencyRef;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
}

/**
 * The params of `bill_payment_check.query`: List bill payment checks.
 */
export interface BillPaymentCheckQueryParams {
  /**
   * Filters according to the account name or `list_id`. If the “Use account numbers” preference is enabled in the QuickBooks company file, you can specify an account number (instead of an account name) for `full_name` and get the account you’re looking for. But if numbers have been used as account names, confusion could arise.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  account_filter?: AccountFilter;
  /**
   * Filters by the specified currency.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  currency_filter?: CurrencyFilter;
  /**
   * An entity refers to a person on the QuickBooks Customer list, Vendor list, Employee list, or Other Names list. You can use an EntityQuery request to get information about all the entities that are set up in the QuickBooks file. In an ARRefundCreditCard query, this must be a customer/customer job.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  entity_filter?: AccountFilter;
  /**
   * This filter allows you to omit line items from a query response to get a smaller result. The default value is false, so line items are omitted by default. Set `include_line_items` to true to include line items in the response if you don’t mind getting a larger result.
   */
  include_line_items?: boolean;
  include_ret_element?: Array<"APAccountRef" | "Address" | "AddressBlock" | "Amount" | "AmountInHomeCurrency" | "AppliedToTxnRet" | "BankAccountRef" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "IsToBePrinted" | "Memo" | "PayeeEntityRef" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records (25 with `include_line_items`); send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `ref_number`, `ref_number_case_sensitive` or `txn_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Filters according to the dates when transactions were last modified. The `modified_date_range_filter` aggregate isn’t required to contain any elements, but if it is empty, we recommend that you leave it out altogether. Note that the time portion of the `from_modified_date` and `to_modified_date` fields wasn’t supported in qbXML version 1.0 or 1.1.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  modified_date_range_filter?: ModifiedDateRangeFilter;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id?: string[];
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number?: string[];
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_case_sensitive?: string[];
  /**
   * Filters by `ref_number` range. Numeric-only bounds are compared numerically; otherwise comparison is lexicographic.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_filter?: RefNumberFilter;
  /**
   * Filters by `ref_number` range. Numeric-only bounds are compared numerically; otherwise comparison is lexicographic.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_range_filter?: RefNumberRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters according to the original transaction dates.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_date_range_filter?: TxnDateRangeFilter;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_id?: string[];
}

/**
 * The params of `bill_payment_check.update`: Update bill payment check.
 */
export interface BillPaymentCheckUpdateParams {
  /**
   * A monetary amount.
   */
  amount?: number;
  applied_to_txn_mod?: AppliedToTxnMod[];
  /**
   * Refers to the account from which the funds are being drawn for this check, for example, Checking or Savings. If a `bank_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  bank_account_ref?: CurrencyRef;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  include_ret_element?: Array<"APAccountRef" | "Address" | "AddressBlock" | "Amount" | "AmountInHomeCurrency" | "AppliedToTxnRet" | "BankAccountRef" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "IsToBePrinted" | "ListID" | "Memo" | "OwnerID" | "PayeeEntityRef" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * If `is_to_be_printed` is true, QuickBooks queues the form for later printing. It does not print immediately; printing is still a user action in QuickBooks.
   *
   * Choose at most one of: `is_to_be_printed`, or `ref_number`.
   */
  is_to_be_printed?: boolean;
  /**
   * Additional information.
   */
  memo?: string;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   *
   * Choose at most one of: `is_to_be_printed`, or `ref_number`.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
}

export interface AppliedToTxnMod {
  /**
   * Refers to the account where this discount is tracked. In a request, if a `discount_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  discount_account_ref?: CurrencyRef;
  /**
   * Reduces the receivable amount.
   */
  discount_amount?: number;
  /**
   * Class reference used in the Discount object
   */
  discount_class_ref?: CurrencyRef;
  /**
   * Represents the amount assigned to a particular receivable. The sum of all `payment_amount` elements in any given receive payment transaction must not be greater than TotalAmount.
   */
  payment_amount?: number;
  set_credit?: SetCredit[];
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
}
