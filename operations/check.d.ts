// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, Address, CurrencyFilter, CurrencyRef, DataExtBill, ItemGroupLineAdd, ItemGroupLineMod, ItemLineAdd, ItemLineMod, ModifiedDateRangeFilter, RefNumberFilter, RefNumberRangeFilter, TxnDateRangeFilter } from "./types";

/** QuickBooks check operations: `qube.check.<action>(connectionId, params, { webhookUrl })`. */
export declare class Check {
  constructor(client: Client);
  /**
   * Create check: `POST /connections/{connection_id}/checks`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_ref` (required), `address`, `apply_check_to_txn_add`, `def_macro`, `exchange_rate`, `expense_line_add`, `external_guid`, `include_ret_element`, `is_tax_included`, `is_to_be_printed`, `item_group_line_add`, `item_line_add`, `memo`, `payee_entity_ref`, `ref_number`, `request_id`, `sales_tax_code_ref`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/checks/create-check
   */
  create(connectionId: string, params: CheckCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List checks: `GET /connections/{connection_id}/checks`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `currency_filter`, `entity_filter`, `include_line_items`, `include_linked_txns`, `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/checks/list-checks
   */
  query(connectionId: string, params: CheckQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update check: `PUT /connections/{connection_id}/checks`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_ref`, `address`, `apply_check_to_txn_mod`, `clear_expense_lines`, `clear_item_lines`, `edit_sequence` (required), `exchange_rate`, `expense_line_mod`, `include_ret_element`, `is_tax_included`, `is_to_be_printed`, `item_group_line_mod`, `item_line_mod`, `memo`, `payee_entity_ref`, `ref_number`, `request_id`, `sales_tax_code_ref`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/checks/update-check
   */
  update(connectionId: string, params: CheckUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `check.create`: Create check.
 */
export interface CheckCreateParams {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for `expense_line_add` it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref: CurrencyRef;
  /**
   * If an address request fails, some combination of address fields might be too long. In a Check, BillPaymentCheck, or SalesTaxPaymentCheck message, Address is the address that will print on the check.
   */
  address?: Address;
  apply_check_to_txn_add?: ApplyCheckToTxnAdd[];
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  expense_line_add?: ExpenseLineAddCheck[];
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"AccountRef" | "Address" | "AddressBlock" | "Amount" | "AmountInHomeCurrency" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExpenseLineRet" | "ExternalGUID" | "IsPending" | "IsTaxIncluded" | "IsToBePrinted" | "ItemGroupLineRet" | "ItemLineRet" | "LinkedTxn" | "ListID" | "Memo" | "OwnerID" | "PayeeEntityRef" | "RefNumber" | "SalesTaxCodeRef" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
  /**
   * If `is_to_be_printed` is true, QuickBooks queues the form for later printing. It does not print immediately; printing is still a user action in QuickBooks.
   */
  is_to_be_printed?: boolean;
  /**
   * Refers to items that are grouped together in QuickBooks for fast entry.
   *
   * `item_line_add` and `item_group_line_add` combine: any number of each. QuickBooks receives them in that order: every `item_line_add`, then every `item_group_line_add`.
   */
  item_group_line_add?: ItemGroupLineAdd[];
  /**
   * An ItemLine is used to track any portion of a transaction that represents the purchase of an “item.” If `item_line_add` doesn’t specify an Amount, Cost, or Quantity, then QuickBooks will calculate Amount based on a Quantity of 1 and the suggested Cost.
   *
   * `item_line_add` and `item_group_line_add` combine: any number of each. QuickBooks receives them in that order: every `item_line_add`, then every `item_group_line_add`.
   */
  item_line_add?: ItemLineAdd[];
  /**
   * The memo that is printed on the check itself.
   */
  memo?: string;
  /**
   * `payee_entity_ref` identifies the payee (customer, vendor, employee, or Other Name). If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  payee_entity_ref?: CurrencyRef;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * The date written on the check. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
}

/**
 * The params of `check.query`: List checks.
 */
export interface CheckQueryParams {
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
  /**
   * If you set `include_linked_txns` to true, then the returned object will include a list of all the transactions linked to the queried object. (This list is similar to the History view of a transaction in the user interface, but not identical, as the SDK list contains only linked transactions, not items.) Each linked transaction will be represented by a `linked_txn` aggregate.
   */
  include_linked_txns?: boolean;
  include_ret_element?: Array<"AccountRef" | "Address" | "AddressBlock" | "Amount" | "AmountInHomeCurrency" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExpenseLineRet" | "ExternalGUID" | "IsPending" | "IsTaxIncluded" | "IsToBePrinted" | "ItemGroupLineRet" | "ItemLineRet" | "LinkedTxn" | "Memo" | "PayeeEntityRef" | "RefNumber" | "SalesTaxCodeRef" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records (25 with `include_line_items` or `include_linked_txns`); send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `ref_number`, `ref_number_case_sensitive` or `txn_id` every match comes back in one answer, so leave `iterator` out.
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
 * The params of `check.update`: Update check.
 */
export interface CheckUpdateParams {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref?: CurrencyRef;
  /**
   * If an address request fails, some combination of address fields might be too long. In a Check, BillPaymentCheck, or SalesTaxPaymentCheck message, Address is the address that will print on the check.
   */
  address?: Address;
  apply_check_to_txn_mod?: ApplyCheckToTxnAdd[];
  /**
   * Set `clear_expense_lines` to true to clear all the expense lines. To modify individual lines, use `expense_line_mod`.
   */
  clear_expense_lines?: boolean;
  /**
   * Set `clear_item_lines` to true to clear all the item lines. To modify individual lines, use `item_line_mod`.
   */
  clear_item_lines?: boolean;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  expense_line_mod?: ExpenseLineModCheck[];
  include_ret_element?: Array<"AccountRef" | "Address" | "AddressBlock" | "Amount" | "AmountInHomeCurrency" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExpenseLineRet" | "ExternalGUID" | "IsPending" | "IsTaxIncluded" | "IsToBePrinted" | "ItemGroupLineRet" | "ItemLineRet" | "LinkedTxn" | "ListID" | "Memo" | "OwnerID" | "PayeeEntityRef" | "RefNumber" | "SalesTaxCodeRef" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
  /**
   * If `is_to_be_printed` is true, QuickBooks queues the form for later printing. It does not print immediately; printing is still a user action in QuickBooks.
   */
  is_to_be_printed?: boolean;
  /**
   * Refers to items that are grouped together in QuickBooks for fast entry.
   *
   * `item_line_mod` and `item_group_line_mod` combine: any number of each. QuickBooks receives them in that order: every `item_line_mod`, then every `item_group_line_mod`.
   */
  item_group_line_mod?: ItemGroupLineMod[];
  /**
   * An ItemLine is used to track any portion of a transaction that represents the purchase of an “item.” If ItemLineAdd doesn’t specify an Amount, Cost, or Quantity, then QuickBooks will calculate Amount based on a Quantity of 1 and the suggested Cost.
   *
   * `item_line_mod` and `item_group_line_mod` combine: any number of each. QuickBooks receives them in that order: every `item_line_mod`, then every `item_group_line_mod`.
   */
  item_line_mod?: ItemLineMod[];
  /**
   * The memo that is printed on the check itself.
   */
  memo?: string;
  /**
   * `payee_entity_ref` identifies the payee (customer, vendor, employee, or Other Name). If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  payee_entity_ref?: CurrencyRef;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * The date written on the check. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
}

export interface ApplyCheckToTxnAdd {
  /**
   * A monetary amount.
   */
  amount?: number;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
}

export interface ExpenseLineAddCheck {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for `expense_line_add` it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
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
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref?: CurrencyRef;
  data_ext?: DataExtBill[];
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * The memo that is printed on the check itself.
   */
  memo?: string;
  /**
   * A sales representative must be on the Employee, Vendor, or Other Names list within QuickBooks. Sales representative’s names and initials appear on the Rep drop-down list on QuickBooks sales forms. A `sales_rep_ref` refers to a person on the SalesRep list. In a request, if a `sales_rep_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  sales_rep_ref?: CurrencyRef;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  tax_amount?: number;
}

export interface ExpenseLineModCheck {
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
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref?: CurrencyRef;
  /**
   * The memo that is printed on the check itself.
   */
  memo?: string;
  /**
   * A sales representative must be on the Employee, Vendor, or Other Names list within QuickBooks. Sales representative’s names and initials appear on the Rep drop-down list on QuickBooks sales forms. A `sales_rep_ref` refers to a person on the SalesRep list. In a request, if a `sales_rep_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  sales_rep_ref?: CurrencyRef;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  tax_amount?: number;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id: string;
}
