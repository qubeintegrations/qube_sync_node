// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, Address, CurrencyFilter, CurrencyRef, DataExtBill, LinkToTxn, ModifiedDateRangeFilter, RefNumberFilter, RefNumberRangeFilter, TxnDateRangeFilterBill } from "./types";

/** QuickBooks bill operations: `qube.bill.<action>(connectionId, params, { webhookUrl })`. */
export declare class Bill {
  constructor(client: Client);
  /**
   * Create bill: `POST /connections/{connection_id}/bills`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `ap_account_ref`, `def_macro`, `due_date`, `exchange_rate`, `expense_line_add`, `external_guid`, `include_ret_element`, `is_tax_included`, `item_group_line_add`, `item_line_add`, `link_to_txn_id`, `memo`, `ref_number`, `request_id`, `sales_tax_code_ref`, `terms_ref`, `txn_date`, `vendor_address`, `vendor_ref` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/bills/create-bill
   */
  create(connectionId: string, params: BillCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List bills: `GET /connections/{connection_id}/bills`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `currency_filter`, `entity_filter`, `include_line_items`, `include_linked_txns`, `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `paid_status`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/bills/list-bills
   */
  query(connectionId: string, params: BillQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update bill: `PUT /connections/{connection_id}/bills`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `ap_account_ref`, `clear_expense_lines`, `clear_item_lines`, `due_date`, `edit_sequence` (required), `exchange_rate`, `expense_line_mod`, `include_ret_element`, `is_tax_included`, `item_group_line_mod`, `item_line_mod`, `memo`, `ref_number`, `request_id`, `sales_tax_code_ref`, `terms_ref`, `txn_date`, `txn_id` (required), `vendor_address`, `vendor_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/bills/update-bill
   */
  update(connectionId: string, params: BillUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `bill.create`: Create bill.
 */
export interface BillCreateParams {
  /**
   * Refers to an accounts payable account in the QuickBooks file. (The AccountType of this account will be AccountsPayable.) If `ap_account_ref` is missing, the SDK will use the QuickBooks default AP account. In a request, if an `ap_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  ap_account_ref?: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * The date on which payment is due.
   *
   * Format: date.
   */
  due_date?: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  expense_line_add?: ExpenseLineAddBill[];
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"APAccountRef" | "AmountDue" | "AmountDueInHomeCurrency" | "ClassRef" | "CurrencyRef" | "DataExtRet" | "DueDate" | "EditSequence" | "ExchangeRate" | "ExpenseLineRet" | "ExternalGUID" | "IsPaid" | "IsPending" | "IsTaxIncluded" | "ItemGroupLineRet" | "ItemLineRet" | "LinkedTxn" | "ListID" | "Memo" | "OpenAmount" | "OwnerID" | "RefNumber" | "SalesTaxCodeRef" | "TermsRef" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber" | "VendorAddress" | "VendorRef">;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
  /**
   * Refers to items that are grouped together in QuickBooks for fast entry.
   *
   * `item_line_add` and `item_group_line_add` combine: any number of each. QuickBooks receives them in that order: every `item_line_add`, then every `item_group_line_add`.
   */
  item_group_line_add?: ItemGroupLineAddBill[];
  /**
   * An ItemLine is used to track any portion of a transaction that represents the purchase of an “item.” If `item_line_add` doesn’t specify an Amount, Cost, or Quantity, then QuickBooks will calculate Amount based on a Quantity of 1 and the suggested Cost.
   *
   * `item_line_add` and `item_group_line_add` combine: any number of each. QuickBooks receives them in that order: every `item_line_add`, then every `item_group_line_add`.
   */
  item_line_add?: ItemLineAddBill[];
  link_to_txn_id?: string[];
  /**
   * Appears in the A/P register and in reports that include this bill.
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
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * Refers to the payment terms associated with this entity. (This will be an item on the DateDrivenTerms or StandardTerms list.) If a `terms_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  terms_ref?: CurrencyRef;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
  /**
   * If an address request fails, some combination of address fields might be too long.
   */
  vendor_address?: Address;
  /**
   * A vendor is any person or company from whom a small business owner buys goods and services. (Banks and tax agencies usually are included on the vendor list.) A company’s vendor list contains information such as account balance and contact information about each vendor. A `vendor_ref` aggregate refers to one of the vendors on the list.
   */
  vendor_ref: CurrencyRef;
}

/**
 * The params of `bill.query`: List bills.
 */
export interface BillQueryParams {
  /**
   * Filters according to the account name or `list_id`. If the “Use account numbers” preference is enabled in the QuickBooks company file, you can specify an account number (instead of an account name) for `full_name` and get the account you’re looking for. But if numbers have been used as account names, confusion could arise.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  account_filter?: AccountFilter;
  /**
   * Filters by the specified currency.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  currency_filter?: CurrencyFilter;
  /**
   * An entity refers to a person on the QuickBooks Customer list, Vendor list, Employee list, or Other Names list. You can use an EntityQuery request to get information about all the entities that are set up in the QuickBooks file. In an ARRefundCreditCard query, this must be a customer/customer job.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
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
  include_ret_element?: Array<"APAccountRef" | "AmountDue" | "AmountDueInHomeCurrency" | "ClassRef" | "CurrencyRef" | "DataExtRet" | "DueDate" | "EditSequence" | "ExchangeRate" | "ExpenseLineRet" | "ExternalGUID" | "IsPaid" | "IsPending" | "IsTaxIncluded" | "ItemGroupLineRet" | "ItemLineRet" | "LinkedTxn" | "Memo" | "OpenAmount" | "RefNumber" | "SalesTaxCodeRef" | "TermsRef" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber" | "VendorAddress" | "VendorRef">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records (25 with `include_line_items` or `include_linked_txns`); send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `ref_number`, `ref_number_case_sensitive` or `txn_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  modified_date_range_filter?: ModifiedDateRangeFilter;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id?: string[];
  /**
   * Allows you to filter for transactions according to whether or not they are paid.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  paid_status?: "All" | "NotPaidOnly" | "PaidOnly";
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number?: string[];
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_case_sensitive?: string[];
  /**
   * Filters by `ref_number` range. Numeric-only bounds are compared numerically; otherwise comparison is lexicographic.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_filter?: RefNumberFilter;
  /**
   * Filters by `ref_number` range. Numeric-only bounds are compared numerically; otherwise comparison is lexicographic.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_range_filter?: RefNumberRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters according to the original transaction dates.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_date_range_filter?: TxnDateRangeFilterBill;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `currency_filter`, `entity_filter`, `max_returned`, `modified_date_range_filter`, `paid_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_id?: string[];
}

/**
 * The params of `bill.update`: Update bill.
 */
export interface BillUpdateParams {
  /**
   * Refers to an accounts payable account in the QuickBooks file. (The AccountType of this account will be AccountsPayable.) If `ap_account_ref` is missing, the SDK will use the QuickBooks default AP account. In a request, if an `ap_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  ap_account_ref?: CurrencyRef;
  /**
   * Set `clear_expense_lines` to true to clear all the expense lines. To modify individual lines, use `expense_line_mod`.
   */
  clear_expense_lines?: boolean;
  /**
   * Set `clear_item_lines` to true to clear all the item lines. To modify individual lines, use `item_line_mod`.
   */
  clear_item_lines?: boolean;
  /**
   * The date on which payment is due.
   *
   * Format: date.
   */
  due_date?: string;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  expense_line_mod?: ExpenseLineModBill[];
  include_ret_element?: Array<"APAccountRef" | "AmountDue" | "AmountDueInHomeCurrency" | "ClassRef" | "CurrencyRef" | "DataExtRet" | "DueDate" | "EditSequence" | "ExchangeRate" | "ExpenseLineRet" | "ExternalGUID" | "IsPaid" | "IsPending" | "IsTaxIncluded" | "ItemGroupLineRet" | "ItemLineRet" | "LinkedTxn" | "ListID" | "Memo" | "OpenAmount" | "OwnerID" | "RefNumber" | "SalesTaxCodeRef" | "TermsRef" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber" | "VendorAddress" | "VendorRef">;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
  /**
   * Refers to items that are grouped together in QuickBooks for fast entry.
   *
   * `item_line_mod` and `item_group_line_mod` combine: any number of each. QuickBooks receives them in that order: every `item_line_mod`, then every `item_group_line_mod`.
   */
  item_group_line_mod?: ItemGroupLineModBill[];
  /**
   * An ItemLine is used to track any portion of a transaction that represents the purchase of an “item.” If ItemLineAdd doesn’t specify an Amount, Cost, or Quantity, then QuickBooks will calculate Amount based on a Quantity of 1 and the suggested Cost.
   *
   * `item_line_mod` and `item_group_line_mod` combine: any number of each. QuickBooks receives them in that order: every `item_line_mod`, then every `item_group_line_mod`.
   */
  item_line_mod?: ItemLineModBill[];
  /**
   * Appears in the A/P register and in reports that include this bill.
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
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * Refers to the payment terms associated with this entity. (This will be an item on the DateDrivenTerms or StandardTerms list.) If a `terms_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  terms_ref?: CurrencyRef;
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
  /**
   * If an address request fails, some combination of address fields might be too long.
   */
  vendor_address?: Address;
  /**
   * A vendor is any person or company from whom a small business owner buys goods and services. (Banks and tax agencies usually are included on the vendor list.) A company’s vendor list contains information such as account balance and contact information about each vendor. A `vendor_ref` aggregate refers to one of the vendors on the list.
   */
  vendor_ref?: CurrencyRef;
}

export interface ExpenseLineAddBill {
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
   * Appears in the A/P register and in reports that include this bill.
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

export interface ExpenseLineModBill {
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
   * Appears in the A/P register and in reports that include this bill.
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

export interface ItemGroupLineAddBill {
  data_ext?: DataExtBill[];
  /**
   * A descriptive text field.
   */
  desc?: string;
  /**
   * Location within the Inventory Site
   */
  inventory_site_location_ref?: CurrencyRef;
  /**
   * Site where inventory is located.
   */
  inventory_site_ref?: CurrencyRef;
  /**
   * ItemGroup objects represent items that are grouped together for fast entry, and an `item_group_ref` aggregate refers to one of these item groups. In a request, if an `item_group_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored. You can use an ItemGroupQuery request to get information about all the item groups that are set up in the QuickBooks file.
   */
  item_group_ref: CurrencyRef;
  /**
   * On transaction lines, QuickBooks can derive one value from the other two among Quantity, Rate, and Amount. If you supply Quantity and Amount, QuickBooks calculates Rate. If you supply Quantity and Rate, QuickBooks calculates Amount.
   */
  quantity?: number;
  /**
   * In a transaction line item, the name of the unit of measure selected from within the item’s available units. If the company file is enabled only for single unit of measure per item, this must be the base unit!
   */
  unit_of_measure?: string;
}

export interface ItemGroupLineModBill {
  /**
   * ItemGroup objects represent items that are grouped together for fast entry, and an `item_group_ref` aggregate refers to one of these item groups. In a request, if an `item_group_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored. You can use an ItemGroupQuery request to get information about all the item groups that are set up in the QuickBooks file.
   */
  item_group_ref?: CurrencyRef;
  /**
   * An ItemLine is used to track any portion of a transaction that represents the purchase of an “item.” If ItemLineAdd doesn’t specify an Amount, Cost, or Quantity, then QuickBooks will calculate Amount based on a Quantity of 1 and the suggested Cost.
   */
  item_line_mod?: ItemLineModBill[];
  /**
   * When you modify a transaction line to change the unit of measure used in that line, you use this aggregate to specify the UOM set within which you are choosing an available unit of measure. The “override” here refers to the unit within the set, not the UOM Set itself, which you can’t change or override–the UOM set that can be set or changed only in the item itself via an Item Mod request.
   */
  override_uom_set_ref?: CurrencyRef;
  /**
   * On transaction lines, QuickBooks can derive one value from the other two among Quantity, Rate, and Amount. If you supply Quantity and Amount, QuickBooks calculates Rate. If you supply Quantity and Rate, QuickBooks calculates Amount.
   */
  quantity?: number;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id: string;
  /**
   * In a transaction line item, the name of the unit of measure selected from within the item’s available units. If the company file is enabled only for single unit of measure per item, this must be the base unit!
   */
  unit_of_measure?: string;
}

export interface ItemLineAddBill {
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
   * If both Quantity and Amount are specified, QuickBooks will use them to calculate Cost. Likewise, if both Quantity and Cost are specified, QuickBooks will use them to calculate the total Amount.
   */
  cost?: number;
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref?: CurrencyRef;
  data_ext?: DataExtBill[];
  /**
   * A descriptive text field.
   */
  desc?: string;
  /**
   * Location within the Inventory Site
   */
  inventory_site_location_ref?: CurrencyRef;
  /**
   * Site where inventory is located.
   */
  inventory_site_ref?: CurrencyRef;
  /**
   * `item_ref` may accept all item types or a restricted subset, depending on the request. Examples: PurchaseOrder and Bill do not allow discount or sales-tax items; VehicleMileageAdd requires a service or other-charge item; BillingRateAdd requires a service item. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  item_ref?: CurrencyRef;
  /**
   * When used with InvoiceAdd, the transaction you are linking to via this field must be a SalesOrder; links to other transactions, such as to estimates, aren’t currently supported. When used with BillAdd or ItemReceiptAdd, the transaction you are linking to via this field must be a PurchaseOrder: links to other transactions aren’t currently supported.
   */
  link_to_txn?: LinkToTxn;
  /**
   * The lot number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  lot_number?: string;
  /**
   * Refers to a QuickBooks account. If an `override_item_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  override_item_account_ref?: CurrencyRef;
  /**
   * On transaction lines, QuickBooks can derive one value from the other two among Quantity, Rate, and Amount. If you supply Quantity and Amount, QuickBooks calculates Rate. If you supply Quantity and Rate, QuickBooks calculates Amount.
   */
  quantity?: number;
  /**
   * A sales representative must be on the Employee, Vendor, or Other Names list within QuickBooks. Sales representative’s names and initials appear on the Rep drop-down list on QuickBooks sales forms. A `sales_rep_ref` refers to a person on the SalesRep list. In a request, if a `sales_rep_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  sales_rep_ref?: CurrencyRef;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * The serial number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  serial_number?: string;
  tax_amount?: number;
  /**
   * In a transaction line item, the name of the unit of measure selected from within the item’s available units. If the company file is enabled only for single unit of measure per item, this must be the base unit!
   */
  unit_of_measure?: string;
}

export interface ItemLineModBill {
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
   * If both Quantity and Amount are specified, QuickBooks will use them to calculate Cost. Likewise, if both Quantity and Cost are specified, QuickBooks will use them to calculate the total Amount.
   */
  cost?: number;
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref?: CurrencyRef;
  /**
   * A descriptive text field.
   */
  desc?: string;
  /**
   * Location within the Inventory Site
   */
  inventory_site_location_ref?: CurrencyRef;
  /**
   * Site where inventory is located.
   */
  inventory_site_ref?: CurrencyRef;
  /**
   * `item_ref` may accept all item types or a restricted subset, depending on the request. Examples: PurchaseOrder and Bill do not allow discount or sales-tax items; VehicleMileageAdd requires a service or other-charge item; BillingRateAdd requires a service item. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  item_ref?: CurrencyRef;
  /**
   * The lot number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  lot_number?: string;
  /**
   * Refers to a QuickBooks account. If an `override_item_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  override_item_account_ref?: CurrencyRef;
  /**
   * When you modify a transaction line to change the unit of measure used in that line, you use this aggregate to specify the UOM set within which you are choosing an available unit of measure. The “override” here refers to the unit within the set, not the UOM Set itself, which you can’t change or override–the UOM set that can be set or changed only in the item itself via an Item Mod request.
   */
  override_uom_set_ref?: CurrencyRef;
  /**
   * On transaction lines, QuickBooks can derive one value from the other two among Quantity, Rate, and Amount. If you supply Quantity and Amount, QuickBooks calculates Rate. If you supply Quantity and Rate, QuickBooks calculates Amount.
   */
  quantity?: number;
  /**
   * A sales representative must be on the Employee, Vendor, or Other Names list within QuickBooks. Sales representative’s names and initials appear on the Rep drop-down list on QuickBooks sales forms. A `sales_rep_ref` refers to a person on the SalesRep list. In a request, if a `sales_rep_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  sales_rep_ref?: CurrencyRef;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * The serial number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  serial_number?: string;
  tax_amount?: number;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id: string;
  /**
   * In a transaction line item, the name of the unit of measure selected from within the item’s available units. If the company file is enabled only for single unit of measure per item, this must be the base unit!
   */
  unit_of_measure?: string;
}
