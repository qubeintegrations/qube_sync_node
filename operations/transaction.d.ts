// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, CurrencyFilter, RefNumberFilter, RefNumberRangeFilter, ReportTxnTypeFilter, TxnDateRangeFilterBill } from "./types";

/** QuickBooks transaction operations: `qube.transaction.<action>(connectionId, params, { webhookUrl })`. */
export declare class Transaction {
  constructor(client: Client);
  /**
   * List transactions: `GET /connections/{connection_id}/transactions`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `currency_filter`, `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/transactions/list-transactions
   */
  query(connectionId: string, params: TransactionQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `transaction.query`: List transactions.
 */
export interface TransactionQueryParams {
  /**
   * Filters by the specified currency.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  currency_filter?: CurrencyFilter;
  include_ret_element?: Array<"AccountRef" | "Amount" | "AmountInHomeCurrency" | "CurrencyRef" | "EntityRef" | "ExchangeRate" | "Memo" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnLineID" | "TxnType">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `txn_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number?: string[];
  /**
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_case_sensitive?: string[];
  /**
   * Filters by `ref_number` range. Numeric-only bounds are compared numerically; otherwise comparison is lexicographic.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_filter?: RefNumberFilter;
  /**
   * Filters by `ref_number` range. Numeric-only bounds are compared numerically; otherwise comparison is lexicographic.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_range_filter?: RefNumberRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters the transactions based on the `account_ref` in the transaction or transaction line using an account type filter or a specific `list_id`, or a `full_name`, or a `list_id_with_children`, or a `full_name_with_children`. To filter on transaction lines, you must specify the `transaction_detail_level_filter` with a value of either “All” or “AllExceptSummary”.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  transaction_account_filter?: TransactionAccountFilter;
  /**
   * Filters the transactions based on the ClassRef in the transaction or transaction line by using a specific `list_id`, or a `full_name`, or a `list_id_with_children`, or a `full_name_with_children`. To filter on transaction lines, you must specify the `transaction_detail_level_filter` with a value of either “All” or “AllExceptSummary”.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  transaction_class_filter?: AccountFilter;
  /**
   * Filters the transactions based on the transaction’s date either by specifying a “from” and/or “to” date, or by using a `date_macro`.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  transaction_date_range_filter?: TxnDateRangeFilterBill;
  /**
   * Allows you to specify the detail level of the query results. You can specify all, summary only (the default), or all except summary. Summary only refers to the transaction as a whole, whereas all except summary refers to the transaction lines.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  transaction_detail_level_filter?: "All" | "AllExceptSummary" | "SummaryOnly";
  /**
   * Filters the transactions based on the `entity_ref` used in the transaction or transaction line by specifying an entity type filter, a `list_id`, a `full_name`, a `list_id_with_children`, or a `full_name_with_children`. If you want to filter on transaction lines you must specify the `transaction_detail_level_filter` with a value of either “All” or “AllExceptSummary”.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  transaction_entity_filter?: TransactionEntityFilter;
  /**
   * Filters the transactions based on the ItemRef used in the transaction line using an item type filter, or a specific `list_id`, or a `full_name`, or a `list_id_with_children`, or a `full_name_with_children`. To filter on transaction lines, you must specify the `transaction_detail_level_filter` with a value of either “All” or “AllExceptSummary”.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  transaction_item_filter?: TransactionItemFilter;
  /**
   * Filters the transactions based on the transaction’s modified datetime, either by specifying a “from” and/or “to” date or by using a `date_macro`.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  transaction_modified_date_range_filter?: TransactionModifiedDateRangeFilter;
  /**
   * This filter allows you to search for “open” transactions, i.e. transactions with a remaining balance (for example, credits not fully applied or invoices not fully paid). Valid values are closed, open, or either, which is the default.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  transaction_paid_status_filter?: "Closed" | "Either" | "Open";
  /**
   * Allows you to filter transactions based on posting status. Valid values are posting, non-posting, or either. The default is “either.” (Posting status refers to whether QuickBooks records a transaction in one of your account registers.)
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  transaction_posting_status_filter?: "Either" | "NonPosting" | "Posting";
  /**
   * Filters the transactions based on the transaction’s type. You can specify one or more transaction types in the filter. Notice that TimeTracking transactions aren’t supported. If you set the transaction type filter to “All” (or if you don’t set it at all), the query will be searching only those transaction types that are permissible types for the user currently logged in.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  transaction_type_filter?: ReportTxnTypeFilter;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   *
   * Choose at most one of: `txn_id`, or the set (`currency_filter`, `max_returned`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `transaction_account_filter`, `transaction_class_filter`, `transaction_date_range_filter`, `transaction_detail_level_filter`, `transaction_entity_filter`, `transaction_item_filter`, `transaction_modified_date_range_filter`, `transaction_paid_status_filter`, `transaction_posting_status_filter`, `transaction_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_id?: string[];
}

/**
 * Give exactly one of: `account_type_filter`, or `list_id`, or `full_name`, or `list_id_with_children`, or `full_name_with_children`.
 */
export interface TransactionAccountFilter {
  /**
   * Allows you to report on a specific account type.
   */
  account_type_filter?: "APAndSalesTax" | "APOrCreditCard" | "ARAndAP" | "AccountsPayable" | "AccountsReceivable" | "AllowedFor1099" | "Asset" | "BalanceSheet" | "Bank" | "BankAndARAndAPAndUF" | "BankAndUF" | "CostOfSales" | "CreditCard" | "CurrentAsset" | "CurrentAssetAndExpense" | "CurrentLiability" | "Equity" | "EquityAndIncomeAndExpense" | "ExpenseAndOtherExpense" | "FixedAsset" | "IncomeAndExpense" | "IncomeAndOtherIncome" | "Liability" | "LiabilityAndEquity" | "LongTermLiability" | "NonPosting" | "OrdinaryExpense" | "OrdinaryIncome" | "OrdinaryIncomeAndCOGS" | "OrdinaryIncomeAndExpense" | "OtherAsset" | "OtherCurrentAsset" | "OtherCurrentLiability" | "OtherExpense" | "OtherIncome" | "OtherIncomeOrExpense";
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   */
  full_name?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants. For names that don’t have children, `full_name_with_children` is exactly the same as `full_name`.
   */
  full_name_with_children?: string;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants.
   */
  list_id_with_children?: string;
}

/**
 * Give exactly one of: `entity_type_filter`, or `list_id`, or `full_name`, or `list_id_with_children`, or `full_name_with_children`.
 */
export interface TransactionEntityFilter {
  /**
   * Allows you to report on a specific name type.
   */
  entity_type_filter?: "Customer" | "Employee" | "OtherName" | "Vendor";
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   */
  full_name?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants. For names that don’t have children, `full_name_with_children` is exactly the same as `full_name`.
   */
  full_name_with_children?: string;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants.
   */
  list_id_with_children?: string;
}

/**
 * Give exactly one of: `item_type_filter`, or `list_id`, or `full_name`, or `list_id_with_children`, or `full_name_with_children`.
 */
export interface TransactionItemFilter {
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   */
  full_name?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants. For names that don’t have children, `full_name_with_children` is exactly the same as `full_name`.
   */
  full_name_with_children?: string;
  /**
   * Allows you to report on a specific item type.
   */
  item_type_filter?: "AllExceptFixedAsset" | "Assembly" | "Discount" | "FixedAsset" | "Inventory" | "InventoryAndAssembly" | "NonInventory" | "OtherCharge" | "Payment" | "Sales" | "SalesTax" | "Service";
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants.
   */
  list_id_with_children?: string;
}

/**
 * Give exactly one of: (`from_modified_date`, `to_modified_date`), or `date_macro`.
 */
export interface TransactionModifiedDateRangeFilter {
  /**
   * `date_macro` filters by transaction date (not last-modified date). Do not combine `date_macro` with `from_modified_date`/`to_modified_date` in the same query filter set.
   */
  date_macro?: "All" | "LastCalendarQuarter" | "LastCalendarQuarterToDate" | "LastCalendarYear" | "LastCalendarYearToDate" | "LastFiscalQuarter" | "LastFiscalQuarterToDate" | "LastFiscalYear" | "LastFiscalYearToDate" | "LastMonth" | "LastMonthToDate" | "LastWeek" | "LastWeekToDate" | "NextCalendarQuarter" | "NextCalendarYear" | "NextFiscalQuarter" | "NextFiscalYear" | "NextFourWeeks" | "NextMonth" | "NextWeek" | "ThisCalendarQuarter" | "ThisCalendarQuarterToDate" | "ThisCalendarYear" | "ThisCalendarYearToDate" | "ThisFiscalQuarter" | "ThisFiscalQuarterToDate" | "ThisFiscalYear" | "ThisFiscalYearToDate" | "ThisMonth" | "ThisMonthToDate" | "ThisWeek" | "ThisWeekToDate" | "Today" | "Yesterday";
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * Filters results to objects modified on or before this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to end-of-day (23:59:59).
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}
