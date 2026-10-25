// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, CurrencyFilter, CurrencyRef, DataExtBill, ExpenseLineAdd, ExpenseLineMod, ItemGroupLineAdd, ItemGroupLineMod, ItemLineMod, LinkToTxn, ModifiedDateRangeFilter, RefNumberFilter, RefNumberRangeFilter, TxnDateRangeFilter } from "./types";

/** QuickBooks item receipt operations: `qube.itemReceipt.<action>(connectionId, params, { webhookUrl })`. */
export declare class ItemReceipt {
  constructor(client: Client);
  /**
   * Create item receipt: `POST /connections/{connection_id}/item-receipts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `ap_account_ref`, `def_macro`, `exchange_rate`, `expense_line_add`, `external_guid`, `include_ret_element`, `is_tax_included`, `item_group_line_add`, `item_line_add`, `link_to_txn_id`, `memo`, `ref_number`, `request_id`, `sales_tax_code_ref`, `txn_date`, `vendor_ref` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-receipts/create-item-receipt
   */
  create(connectionId: string, params: ItemReceiptCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List item receipts: `GET /connections/{connection_id}/item-receipts`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `currency_filter`, `entity_filter`, `include_line_items`, `include_linked_txns`, `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-receipts/list-item-receipts
   */
  query(connectionId: string, params: ItemReceiptQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update item receipt: `PUT /connections/{connection_id}/item-receipts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `ap_account_ref`, `clear_expense_lines`, `clear_item_lines`, `edit_sequence` (required), `exchange_rate`, `expense_line_mod`, `include_ret_element`, `is_tax_included`, `item_group_line_mod`, `item_line_mod`, `memo`, `ref_number`, `request_id`, `sales_tax_code_ref`, `txn_date`, `txn_id` (required), `vendor_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-receipts/update-item-receipt
   */
  update(connectionId: string, params: ItemReceiptUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `item_receipt.create`: Create item receipt.
 */
export interface ItemReceiptCreateParams {
  /**
   * Refers to an accounts payable account in the QuickBooks file. (The AccountType of this account will be AccountsPayable.) If `ap_account_ref` is missing, the SDK will use the QuickBooks default AP account. In a request, if an `ap_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  ap_account_ref?: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  expense_line_add?: ExpenseLineAdd[];
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"APAccountRef" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExpenseLineRet" | "ExternalGUID" | "IsTaxIncluded" | "ItemGroupLineRet" | "ItemLineRet" | "LiabilityAccountRef" | "LinkedTxn" | "ListID" | "Memo" | "OwnerID" | "RefNumber" | "SalesTaxCodeRef" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber" | "VendorRef">;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
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
  item_line_add?: ItemLineAddItemReceipt[];
  link_to_txn_id?: string[];
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
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
  /**
   * A vendor is any person or company from whom a small business owner buys goods and services. (Banks and tax agencies usually are included on the vendor list.) A company’s vendor list contains information such as account balance and contact information about each vendor. A `vendor_ref` aggregate refers to one of the vendors on the list.
   */
  vendor_ref: CurrencyRef;
}

/**
 * The params of `item_receipt.query`: List item receipts.
 */
export interface ItemReceiptQueryParams {
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
  include_ret_element?: Array<"APAccountRef" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExpenseLineRet" | "ExternalGUID" | "IsTaxIncluded" | "ItemGroupLineRet" | "ItemLineRet" | "LiabilityAccountRef" | "LinkedTxn" | "Memo" | "RefNumber" | "SalesTaxCodeRef" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber" | "VendorRef">;
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
 * The params of `item_receipt.update`: Update item receipt.
 */
export interface ItemReceiptUpdateParams {
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
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  expense_line_mod?: ExpenseLineMod[];
  include_ret_element?: Array<"APAccountRef" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "ExchangeRate" | "ExpenseLineRet" | "ExternalGUID" | "IsTaxIncluded" | "ItemGroupLineRet" | "ItemLineRet" | "LiabilityAccountRef" | "LinkedTxn" | "ListID" | "Memo" | "OwnerID" | "RefNumber" | "SalesTaxCodeRef" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber" | "VendorRef">;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
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
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
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
   * A vendor is any person or company from whom a small business owner buys goods and services. (Banks and tax agencies usually are included on the vendor list.) A company’s vendor list contains information such as account balance and contact information about each vendor. A `vendor_ref` aggregate refers to one of the vendors on the list.
   */
  vendor_ref?: CurrencyRef;
}

export interface ItemLineAddItemReceipt {
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
   * Location within the Inventory Site.
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
