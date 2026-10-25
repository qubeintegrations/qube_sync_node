// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, CurrencyFilter, CurrencyRef, ModifiedDateRangeFilter, RefNumberFilter, RefNumberRangeFilter, TxnDateRangeFilter } from "./types";

/** QuickBooks journal entry operations: `qube.journalEntry.<action>(connectionId, params, { webhookUrl })`. */
export declare class JournalEntry {
  constructor(client: Client);
  /**
   * Create journal entry: `POST /connections/{connection_id}/journal-entries`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `currency_ref`, `def_macro`, `exchange_rate`, `external_guid`, `include_ret_element`, `is_adjustment`, `is_amounts_entered_in_home_currency`, `is_home_currency_adjustment`, `journal_credit_line`, `journal_debit_line`, `memo`, `ref_number`, `request_id`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/journal-entries/create-journal-entry
   */
  create(connectionId: string, params: JournalEntryCreateParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List journal entries: `GET /connections/{connection_id}/journal-entries`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `currency_filter`, `entity_filter`, `include_line_items`, `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/journal-entries/list-journal-entries
   */
  query(connectionId: string, params: JournalEntryQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update journal entry: `PUT /connections/{connection_id}/journal-entries`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `currency_ref`, `edit_sequence` (required), `exchange_rate`, `include_ret_element`, `is_adjustment`, `is_amounts_entered_in_home_currency`, `journal_line_mod`, `ref_number`, `request_id`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/journal-entries/update-journal-entry
   */
  update(connectionId: string, params: JournalEntryUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `journal_entry.create`: Create journal entry.
 */
export interface JournalEntryCreateParams {
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   *
   * Choose at most one of: `is_home_currency_adjustment`, or the set (`currency_ref`, `exchange_rate`, `is_amounts_entered_in_home_currency`). Members of a set combine with each other, not with the other choices.
   */
  currency_ref?: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   *
   * Choose at most one of: `is_home_currency_adjustment`, or the set (`currency_ref`, `exchange_rate`, `is_amounts_entered_in_home_currency`). Members of a set combine with each other, not with the other choices.
   */
  exchange_rate?: number;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "IsAdjustment" | "IsAmountsEnteredInHomeCurrency" | "IsHomeCurrencyAdjustment" | "JournalCreditLine" | "JournalDebitLine" | "ListID" | "Memo" | "OwnerID" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * When a change is an “adjustment,” the original information is retained, usually so an accountant can see the effects of the adjustment.
   */
  is_adjustment?: boolean;
  /**
   * Flag that indicates the amount being entered is in the home currency.
   *
   * Choose at most one of: `is_home_currency_adjustment`, or the set (`currency_ref`, `exchange_rate`, `is_amounts_entered_in_home_currency`). Members of a set combine with each other, not with the other choices.
   */
  is_amounts_entered_in_home_currency?: boolean;
  /**
   * Indicates whether the transaction is using a home currency or foreign currency.
   *
   * Choose at most one of: `is_home_currency_adjustment`, or the set (`currency_ref`, `exchange_rate`, `is_amounts_entered_in_home_currency`). Members of a set combine with each other, not with the other choices.
   */
  is_home_currency_adjustment?: boolean;
  /**
   * If no amount is included in the first credit line (or debit line) of a journal entry in the QuickBooks user interface, then subsequent SDK queries on that JournalEntry object will fail XML validation.
   *
   * At least one entry is required across `journal_debit_line` and `journal_credit_line`; they combine, any number of each. QuickBooks receives them in that order: every `journal_debit_line`, then every `journal_credit_line`.
   */
  journal_credit_line?: JournalCreditLine[];
  /**
   * If no amount is included in the first debit line (or credit line) of a journal entry in the QuickBooks user interface, then subsequent SDK queries on that JournalEntry object will fail XML validation.
   *
   * At least one entry is required across `journal_debit_line` and `journal_credit_line`; they combine, any number of each. QuickBooks receives them in that order: every `journal_debit_line`, then every `journal_credit_line`.
   */
  journal_debit_line?: JournalCreditLine[];
  /**
   * Additional information.
   */
  memo?: string;
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
 * The params of `journal_entry.query`: List journal entries.
 */
export interface JournalEntryQueryParams {
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
  include_ret_element?: Array<"CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "IsAdjustment" | "IsAmountsEnteredInHomeCurrency" | "IsHomeCurrencyAdjustment" | "JournalCreditLine" | "JournalDebitLine" | "Memo" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
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
 * The params of `journal_entry.update`: Update journal entry.
 */
export interface JournalEntryUpdateParams {
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  include_ret_element?: Array<"CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "IsAdjustment" | "IsAmountsEnteredInHomeCurrency" | "IsHomeCurrencyAdjustment" | "JournalCreditLine" | "JournalDebitLine" | "ListID" | "Memo" | "OwnerID" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * When a change is an “adjustment,” the original information is retained, usually so an accountant can see the effects of the adjustment.
   */
  is_adjustment?: boolean;
  /**
   * Flag that indicates the amount being entered is in the home currency.
   */
  is_amounts_entered_in_home_currency?: boolean;
  journal_line_mod?: JournalLineMod[];
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
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
}

export interface JournalCreditLine {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref?: CurrencyRef;
  /**
   * A monetary amount.
   */
  amount?: number;
  /**
   * The billing status of this item line or expense line.
   */
  billable_status?: "Billable" | "HasBeenBilled" | "NotBillable";
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * A QuickBooks “entity” is a customer, vendor, employee, or person on the QuickBooks “other names” list. Special cases to note: In a BillToPayQuery message, `entity_ref` refers to the vendor name. In `journal_credit_line` and `journal_debit_line` messages for A/R accounts, `entity_ref` must refer to a customer, or else the transaction won’t be recorded.
   */
  entity_ref?: CurrencyRef;
  /**
   * An ItemSalesTax entry represents one tax rate paid to one tax agency. Use it when a transaction needs a single tax calculation. For multi-rate scenarios, use a sales-tax group instead. If both `full_name` and `list_id` are provided for `item_sales_tax_ref`, `list_id` is used.
   */
  item_sales_tax_ref?: CurrencyRef;
  /**
   * Additional information.
   */
  memo?: string;
  tax_amount?: number;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id?: string;
}

export interface JournalLineMod {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref?: CurrencyRef;
  /**
   * A monetary amount.
   */
  amount?: number;
  /**
   * The billing status of this item line or expense line.
   */
  billable_status?: "Billable" | "HasBeenBilled" | "NotBillable";
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * A QuickBooks “entity” is a customer, vendor, employee, or person on the QuickBooks “other names” list. Special cases to note: In a BillToPayQuery message, `entity_ref` refers to the vendor name. In `journal_credit_line` and `journal_debit_line` messages for A/R accounts, `entity_ref` must refer to a customer, or else the transaction won’t be recorded.
   */
  entity_ref?: CurrencyRef;
  /**
   * An ItemSalesTax entry represents one tax rate paid to one tax agency. Use it when a transaction needs a single tax calculation. For multi-rate scenarios, use a sales-tax group instead. If both `full_name` and `list_id` are provided for `item_sales_tax_ref`, `list_id` is used.
   */
  item_sales_tax_ref?: CurrencyRef;
  /**
   * The type of journal line (debit or credit).
   */
  journal_line_type?: "Credit" | "Debit";
  /**
   * Additional information.
   */
  memo?: string;
  tax_amount?: number;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id: string;
}
