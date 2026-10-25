// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, CurrencyFilter, CurrencyRef, ModifiedDateRangeFilter, TxnDateRangeFilter } from "./types";

/** QuickBooks deposit operations: `qube.deposit.<action>(connectionId, params, { webhookUrl })`. */
export declare class Deposit {
  constructor(client: Client);
  /**
   * Create deposit: `POST /connections/{connection_id}/deposits`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `cash_back_info_add`, `currency_ref`, `def_macro`, `deposit_line_add`, `deposit_to_account_ref` (required), `exchange_rate`, `external_guid`, `include_ret_element`, `memo`, `request_id`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/deposits/create-deposit
   */
  create(connectionId: string, params: DepositCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List deposits: `GET /connections/{connection_id}/deposits`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `currency_filter`, `entity_filter`, `include_line_items`, `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/deposits/list-deposits
   */
  query(connectionId: string, params: DepositQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update deposit: `PUT /connections/{connection_id}/deposits`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `cash_back_info_mod`, `currency_ref`, `deposit_line_mod`, `deposit_to_account_ref`, `edit_sequence` (required), `exchange_rate`, `include_ret_element`, `memo`, `request_id`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/deposits/update-deposit
   */
  update(connectionId: string, params: DepositUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `deposit.create`: Create deposit.
 */
export interface DepositCreateParams {
  /**
   * This aggregate is included if there is cash back from this deposit. `account_ref` indicates where the cash back Amount is going (for example, into a petty cash account).
   */
  cash_back_info_add?: CashBackInfoAdd;
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  deposit_line_add?: DepositLineAdd[];
  /**
   * Refers to the account where these funds will be (or have been) deposited. In a ReceivePaymentAdd request, the default is Undeposited Funds if this isn’t included in the request. In a request, if a `deposit_to_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  deposit_to_account_ref: CurrencyRef;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"CashBackInfoRet" | "CurrencyRef" | "DataExtRet" | "DepositLineRet" | "DepositToAccountRef" | "DepositTotal" | "DepositTotalInHomeCurrency" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "ListID" | "Memo" | "OwnerID" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Additional information.
   */
  memo?: string;
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
 * The params of `deposit.query`: List deposits.
 */
export interface DepositQueryParams {
  /**
   * Filters according to the account name or `list_id`. If the “Use account numbers” preference is enabled in the QuickBooks company file, you can specify an account number (instead of an account name) for `full_name` and get the account you’re looking for. But if numbers have been used as account names, confusion could arise.
   *
   * Choose at most one of: `txn_id`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  account_filter?: AccountFilter;
  /**
   * Filters by the specified currency.
   *
   * Choose at most one of: `txn_id`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  currency_filter?: CurrencyFilter;
  /**
   * An entity refers to a person on the QuickBooks Customer list, Vendor list, Employee list, or Other Names list. You can use an EntityQuery request to get information about all the entities that are set up in the QuickBooks file. In an ARRefundCreditCard query, this must be a customer/customer job.
   *
   * Choose at most one of: `txn_id`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  entity_filter?: AccountFilter;
  /**
   * This filter allows you to omit line items from a query response to get a smaller result. The default value is false, so line items are omitted by default. Set `include_line_items` to true to include line items in the response if you don’t mind getting a larger result.
   */
  include_line_items?: boolean;
  include_ret_element?: Array<"CashBackInfoRet" | "CurrencyRef" | "DataExtRet" | "DepositLineRet" | "DepositToAccountRef" | "DepositTotal" | "DepositTotalInHomeCurrency" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "Memo" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records (25 with `include_line_items`); send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `txn_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `txn_id`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `txn_id`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  modified_date_range_filter?: ModifiedDateRangeFilter;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id?: string[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters according to the original transaction dates.
   *
   * Choose at most one of: `txn_id`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_date_range_filter?: TxnDateRangeFilter;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   *
   * Choose at most one of: `txn_id`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_id?: string[];
}

/**
 * The params of `deposit.update`: Update deposit.
 */
export interface DepositUpdateParams {
  /**
   * This aggregate is included if there is cash back from this deposit. `account_ref` indicates where the cash back Amount is going (for example, into a petty cash account).
   */
  cash_back_info_mod?: CashBackInfoMod;
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
  deposit_line_mod?: DepositLineMod[];
  /**
   * Refers to the account where these funds will be (or have been) deposited. In a ReceivePaymentAdd request, the default is Undeposited Funds if this isn’t included in the request. In a request, if a `deposit_to_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  deposit_to_account_ref?: CurrencyRef;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  include_ret_element?: Array<"CashBackInfoRet" | "CurrencyRef" | "DataExtRet" | "DepositLineRet" | "DepositToAccountRef" | "DepositTotal" | "DepositTotalInHomeCurrency" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "ListID" | "Memo" | "OwnerID" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Additional information.
   */
  memo?: string;
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

export interface CashBackInfoAdd {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref: CurrencyRef;
  /**
   * A monetary amount.
   */
  amount?: number;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * Additional information.
   */
  memo?: string;
}

export interface CashBackInfoMod {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref?: CurrencyRef;
  /**
   * A monetary amount.
   */
  amount?: number;
  /**
   * Additional information.
   */
  memo?: string;
}

export interface DepositLineAdd {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  account_ref?: CurrencyRef;
  /**
   * A monetary amount.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  amount?: number;
  /**
   * The check number of a check that a QuickBooks user writes or receives from someone else.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  check_number?: string;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  class_ref?: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * A QuickBooks “entity” is a customer, vendor, employee, or person on the QuickBooks “other names” list. Special cases to note: In a BillToPayQuery message, `entity_ref` refers to the vendor name. In JournalCreditLine and JournalDebitLine messages for A/R accounts, `entity_ref` must refer to a customer, or else the transaction won’t be recorded.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  entity_ref?: CurrencyRef;
  /**
   * Additional information.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  memo?: string;
  /**
   * Deposit line check number.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  override_check_number?: string;
  /**
   * Deposit line class reference.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  override_class_ref?: CurrencyRef;
  /**
   * Depost line memo additional information.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  override_memo?: string;
  /**
   * `payment_method_ref` identifies how a payment is made (for example, cash, check, or card type). If both `full_name` and `list_id` are provided, `full_name` is ignored.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  payment_method_ref?: CurrencyRef;
  /**
   * For the `payment_txn_id`, use either of these two values:A `txn_id` value exactly as it is returned by the ReceivePaymentToDepositQuery request, or A `txn_id` value exactly as it is returned in a ReceivePaymentAdd response.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  payment_txn_id?: string;
  /**
   * For the `payment_txn_line_id`, use a `txn_line_id` value exactly as it has been returned by the ReceivePaymentToDepositQuery request. If you don’t include a `payment_txn_line_id` and include a `payment_txn_id` for a transaction that includes payment lines, only the first payment line from that transaction will be deposited.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  payment_txn_line_id?: string;
}

export interface DepositLineMod {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  account_ref?: CurrencyRef;
  /**
   * A monetary amount.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  amount?: number;
  /**
   * The check number of a check that a QuickBooks user writes or receives from someone else.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  check_number?: string;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  class_ref?: CurrencyRef;
  /**
   * A QuickBooks “entity” is a customer, vendor, employee, or person on the QuickBooks “other names” list. Special cases to note: In a BillToPayQuery message, `entity_ref` refers to the vendor name. In JournalCreditLine and JournalDebitLine messages for A/R accounts, `entity_ref` must refer to a customer, or else the transaction won’t be recorded.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  entity_ref?: CurrencyRef;
  /**
   * Additional information.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  memo?: string;
  /**
   * Deposit line check number.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  override_check_number?: string;
  /**
   * Deposit line class reference.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  override_class_ref?: CurrencyRef;
  /**
   * Depost line memo additional information.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  override_memo?: string;
  /**
   * `payment_method_ref` identifies how a payment is made (for example, cash, check, or card type). If both `full_name` and `list_id` are provided, `full_name` is ignored.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  payment_method_ref?: CurrencyRef;
  /**
   * For the `payment_txn_id`, use either of these two values:A `txn_id` value exactly as it is returned by the ReceivePaymentToDepositQuery request, or A `txn_id` value exactly as it is returned in a ReceivePaymentAdd response.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  payment_txn_id?: string;
  /**
   * For the `payment_txn_line_id`, use a `txn_line_id` value exactly as it has been returned by the ReceivePaymentToDepositQuery request. If you don’t include a `payment_txn_line_id` and include a `payment_txn_id` for a transaction that includes payment lines, only the first payment line from that transaction will be deposited.
   *
   * Choose exactly one of: the set (`override_check_number`, `override_class_ref`, `override_memo`, `payment_txn_id`, `payment_txn_line_id`), or the set (`account_ref`, `amount`, `check_number`, `class_ref`, `entity_ref`, `memo`, `payment_method_ref`). Members of a set combine with each other, not with the other choices.
   */
  payment_txn_line_id?: string;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id: string;
}
