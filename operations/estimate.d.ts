// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, BillAddress, CurrencyFilter, CurrencyRef, DataExtBill, ItemGroupLineAdd, ModifiedDateRangeFilter, RefNumberFilter, RefNumberRangeFilter, TxnDateRangeFilter } from "./types";

/** QuickBooks estimate operations: `qube.estimate.<action>(connectionId, params, { webhookUrl })`. */
export declare class Estimate {
  constructor(client: Client);
  /**
   * Create estimate: `POST /connections/{connection_id}/estimates`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `bill_address`, `class_ref`, `customer_msg_ref`, `customer_ref` (required), `customer_sales_tax_code_ref`, `def_macro`, `due_date`, `estimate_line_add`, `estimate_line_group_add`, `exchange_rate`, `external_guid`, `fob`, `include_ret_element`, `is_active`, `is_tax_included`, `is_to_be_emailed`, `item_sales_tax_ref`, `memo`, `other`, `po_number`, `ref_number`, `request_id`, `sales_rep_ref`, `ship_address`, `template_ref`, `terms_ref`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/estimates/create-estimate
   */
  create(connectionId: string, params: EstimateCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List estimates: `GET /connections/{connection_id}/estimates`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `currency_filter`, `entity_filter`, `include_line_items`, `include_linked_txns`, `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/estimates/list-estimates
   */
  query(connectionId: string, params: EstimateQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update estimate: `PUT /connections/{connection_id}/estimates`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `bill_address`, `class_ref`, `create_change_order`, `customer_msg_ref`, `customer_ref`, `customer_sales_tax_code_ref`, `due_date`, `edit_sequence` (required), `estimate_line_group_mod`, `estimate_line_mod`, `exchange_rate`, `fob`, `include_ret_element`, `is_active`, `is_tax_included`, `is_to_be_emailed`, `item_sales_tax_ref`, `memo`, `other`, `po_number`, `ref_number`, `request_id`, `sales_rep_ref`, `ship_address`, `template_ref`, `terms_ref`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/estimates/update-estimate
   */
  update(connectionId: string, params: EstimateUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `estimate.create`: Create estimate.
 */
export interface EstimateCreateParams {
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  bill_address?: BillAddress;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * A standard message such as “Thank you for your business,” or “Please sign and return this estimate to indicate your approval.” A customer message can be included at the bottom of a form. A `customer_msg_ref` aggregate refers to one of the messages on the CustomerMsg list. In a request, if a `customer_msg_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  customer_msg_ref?: CurrencyRef;
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref: CurrencyRef;
  /**
   * Refers to the sales-tax code for sales related to this customer. (That is, it refers to a member of the SalesTaxCode list.) The sales-tax code indicates whether an item is taxable or non-taxable, and why. In a request, if a `customer_sales_tax_code_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  customer_sales_tax_code_ref?: CurrencyRef;
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
   * One line of this estimate. Compare with EstimateLineGroup, which represents a previously defined group of lines in the estimate. In a Mod request, you can add a new line by supplying a `txn_line_id` value of -1.
   *
   * At least one entry is required across `estimate_line_add` and `estimate_line_group_add`; they combine, any number of each. QuickBooks receives them in that order: every `estimate_line_add`, then every `estimate_line_group_add`.
   */
  estimate_line_add?: EstimateLineAdd[];
  /**
   * Represents a previously defined group of lines in the estimate. Compare with EstimateLine, which represents just one line in the estimate.
   *
   * At least one entry is required across `estimate_line_add` and `estimate_line_group_add`; they combine, any number of each. QuickBooks receives them in that order: every `estimate_line_add`, then every `estimate_line_group_add`.
   */
  estimate_line_group_add?: ItemGroupLineAdd[];
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  /**
   * QuickBooks uses the term FOB, “freight on board,” to indicate the place from which the product is shipped. The FOB has no accounting implications.
   */
  fob?: string;
  include_ret_element?: Array<"BillAddress" | "BillAddressBlock" | "ClassRef" | "CurrencyRef" | "CustomerMsgRef" | "CustomerRef" | "CustomerSalesTaxCodeRef" | "DataExtRet" | "DueDate" | "EditSequence" | "EstimateLineGroupRet" | "EstimateLineRet" | "ExchangeRate" | "ExternalGUID" | "FOB" | "IsActive" | "IsTaxIncluded" | "IsToBeEmailed" | "ItemSalesTaxRef" | "LinkedTxn" | "ListID" | "Memo" | "Other" | "OwnerID" | "PONumber" | "RefNumber" | "SalesRepRef" | "SalesTaxPercentage" | "SalesTaxTotal" | "ShipAddress" | "ShipAddressBlock" | "Subtotal" | "TemplateRef" | "TermsRef" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
  /**
   * When enabled, QuickBooks validates the customer email at runtime before sending. If no valid email is available, the request fails.
   */
  is_to_be_emailed?: boolean;
  /**
   * An ItemSalesTax entry represents one tax rate paid to one tax agency. Use it when a transaction needs a single tax calculation. For multi-rate scenarios, use a sales-tax group instead. If both `full_name` and `list_id` are provided for `item_sales_tax_ref`, `list_id` is used.
   */
  item_sales_tax_ref?: CurrencyRef;
  /**
   * Message that appears in reports, but not on the estimate.
   */
  memo?: string;
  /**
   * Other, Other1, and Other2 are built-in transaction custom fields. Other is transaction-level; Other1 and Other2 are line-level. These fields are always available through the SDK and do not require DataExtDef setup. Template labels in the UI can be renamed, but SDK names remain fixed as Other, Other1, and Other2.
   */
  other?: string;
  /**
   * Purchase order number.
   */
  po_number?: string;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * A sales representative must be on the Employee, Vendor, or Other Names list within QuickBooks. Sales representative’s names and initials appear on the Rep drop-down list on QuickBooks sales forms. A `sales_rep_ref` refers to a person on the SalesRep list. In a request, if a `sales_rep_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  sales_rep_ref?: CurrencyRef;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  ship_address?: BillAddress;
  /**
   * QuickBooks templates specify how to print certain transactions. A template query returns the names of all templates that have been defined in QuickBooks. A `template_ref` element refers to one of these templates.
   */
  template_ref?: CurrencyRef;
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
}

/**
 * The params of `estimate.query`: List estimates.
 */
export interface EstimateQueryParams {
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
  include_ret_element?: Array<"BillAddress" | "BillAddressBlock" | "ClassRef" | "CurrencyRef" | "CustomerMsgRef" | "CustomerRef" | "CustomerSalesTaxCodeRef" | "DataExtRet" | "DueDate" | "EditSequence" | "EstimateLineGroupRet" | "EstimateLineRet" | "ExchangeRate" | "ExternalGUID" | "FOB" | "IsActive" | "IsTaxIncluded" | "IsToBeEmailed" | "ItemSalesTaxRef" | "LinkedTxn" | "Memo" | "Other" | "PONumber" | "RefNumber" | "SalesRepRef" | "SalesTaxPercentage" | "SalesTaxTotal" | "ShipAddress" | "ShipAddressBlock" | "Subtotal" | "TemplateRef" | "TermsRef" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber">;
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
 * The params of `estimate.update`: Update estimate.
 */
export interface EstimateUpdateParams {
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  bill_address?: BillAddress;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * If `create_change_order` is true, the modifications are tracked as a “change order” that appears in the description field at the bottom of the estimate form in QuickBooks. A change order specifies exactly what changed, the dollar amount of each change, and the net dollar change to the estimate.
   */
  create_change_order?: boolean;
  /**
   * A standard message such as “Thank you for your business,” or “Please sign and return this estimate to indicate your approval.” A customer message can be included at the bottom of a form. A `customer_msg_ref` aggregate refers to one of the messages on the CustomerMsg list. In a request, if a `customer_msg_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  customer_msg_ref?: CurrencyRef;
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref?: CurrencyRef;
  /**
   * Refers to the sales-tax code for sales related to this customer. (That is, it refers to a member of the SalesTaxCode list.) The sales-tax code indicates whether an item is taxable or non-taxable, and why. In a request, if a `customer_sales_tax_code_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  customer_sales_tax_code_ref?: CurrencyRef;
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
   * Represents a previously defined group of lines in the estimate. Compare with EstimateLine, which represents just one line in the estimate.
   *
   * `estimate_line_mod` and `estimate_line_group_mod` combine: any number of each. QuickBooks receives them in that order: every `estimate_line_mod`, then every `estimate_line_group_mod`.
   */
  estimate_line_group_mod?: EstimateLineGroupMod[];
  /**
   * One line of this estimate. Compare with EstimateLineGroup, which represents a previously defined group of lines in the estimate. In a Mod request, you can add a new line by supplying a `txn_line_id` value of -1.
   *
   * `estimate_line_mod` and `estimate_line_group_mod` combine: any number of each. QuickBooks receives them in that order: every `estimate_line_mod`, then every `estimate_line_group_mod`.
   */
  estimate_line_mod?: EstimateLineMod[];
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  /**
   * QuickBooks uses the term FOB, “freight on board,” to indicate the place from which the product is shipped. The FOB has no accounting implications.
   */
  fob?: string;
  include_ret_element?: Array<"BillAddress" | "BillAddressBlock" | "ClassRef" | "CurrencyRef" | "CustomerMsgRef" | "CustomerRef" | "CustomerSalesTaxCodeRef" | "DataExtRet" | "DueDate" | "EditSequence" | "EstimateLineGroupRet" | "EstimateLineRet" | "ExchangeRate" | "ExternalGUID" | "FOB" | "IsActive" | "IsTaxIncluded" | "IsToBeEmailed" | "ItemSalesTaxRef" | "LinkedTxn" | "ListID" | "Memo" | "Other" | "OwnerID" | "PONumber" | "RefNumber" | "SalesRepRef" | "SalesTaxPercentage" | "SalesTaxTotal" | "ShipAddress" | "ShipAddressBlock" | "Subtotal" | "TemplateRef" | "TermsRef" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
  /**
   * When enabled, QuickBooks validates the customer email at runtime before sending. If no valid email is available, the request fails.
   */
  is_to_be_emailed?: boolean;
  /**
   * An ItemSalesTax entry represents one tax rate paid to one tax agency. Use it when a transaction needs a single tax calculation. For multi-rate scenarios, use a sales-tax group instead. If both `full_name` and `list_id` are provided for `item_sales_tax_ref`, `list_id` is used.
   */
  item_sales_tax_ref?: CurrencyRef;
  /**
   * Message that appears in reports, but not on the estimate.
   */
  memo?: string;
  /**
   * Other, Other1, and Other2 are built-in transaction custom fields. Other is transaction-level; Other1 and Other2 are line-level. These fields are always available through the SDK and do not require DataExtDef setup. Template labels in the UI can be renamed, but SDK names remain fixed as Other, Other1, and Other2.
   */
  other?: string;
  /**
   * Purchase order number.
   */
  po_number?: string;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * A sales representative must be on the Employee, Vendor, or Other Names list within QuickBooks. Sales representative’s names and initials appear on the Rep drop-down list on QuickBooks sales forms. A `sales_rep_ref` refers to a person on the SalesRep list. In a request, if a `sales_rep_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  sales_rep_ref?: CurrencyRef;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  ship_address?: BillAddress;
  /**
   * QuickBooks templates specify how to print certain transactions. A template query returns the names of all templates that have been defined in QuickBooks. A `template_ref` element refers to one of these templates.
   */
  template_ref?: CurrencyRef;
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
}

export interface EstimateLineAdd {
  /**
   * A monetary amount.
   */
  amount?: number;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
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
   * The markup that will be passed on to the customer for this item on this estimate. Amount, quantity, rate, and markup are related in the following way: Amount = (Quantity \* Rate) + amount of markup
   *
   * Choose at most one of: `markup_rate`, or `markup_rate_percent`, or `price_level_ref`.
   */
  markup_rate?: number;
  /**
   * The markup (expressed as a percentage) that will be passed on to the customer for this item on this estimate. Amount, quantity, rate, and markup are related in the following way: Amount = (Quantity \* Rate) + amount of markup
   *
   * Choose at most one of: `markup_rate`, or `markup_rate_percent`, or `price_level_ref`.
   */
  markup_rate_percent?: number;
  /**
   * Flag to override price rule conflict.
   */
  option_for_price_rule_conflict?: "BasePrice" | "Zero";
  /**
   * Other, Other1, and Other2 are built-in transaction custom fields. Other is transaction-level; Other1 and Other2 are line-level. These fields are always available through the SDK and do not require DataExtDef setup. Template labels in the UI can be renamed, but SDK names remain fixed as Other, Other1, and Other2.
   */
  other1?: string;
  /**
   * Other, Other1, and Other2 are built-in transaction custom fields. Other is transaction-level; Other1 and Other2 are line-level. These fields are always available through the SDK and do not require DataExtDef setup. Template labels in the UI can be renamed, but SDK names remain fixed as Other, Other1, and Other2.
   */
  other2?: string;
  /**
   * Refers to a QuickBooks account. If an `override_item_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  override_item_account_ref?: CurrencyRef;
  /**
   * Price levels let you apply custom pricing rules for selected customers. Once assigned, QuickBooks uses those prices automatically on supported sales forms unless explicitly overridden.
   *
   * Choose at most one of: `markup_rate`, or `markup_rate_percent`, or `price_level_ref`.
   */
  price_level_ref?: CurrencyRef;
  /**
   * On transaction lines, QuickBooks can derive one value from the other two among Quantity, Rate, and Amount. If you supply Quantity and Amount, QuickBooks calculates Rate. If you supply Quantity and Rate, QuickBooks calculates Amount.
   */
  quantity?: number;
  /**
   * If you specify both Rate and Amount in a request, the Rate you provide will be ignored, and you will receive a warning. If you specify both Quantity and Amount in an Add request, QuickBooks will use them to calculate Rate. (Rate, Amount, and Quantity can’t be cleared.)
   *
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate?: number;
  /**
   * Indicates the price of something as a percent.
   *
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate_percent?: number;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  tax_amount?: number;
  /**
   * In a transaction line item, the name of the unit of measure selected from within the item’s available units. If the company file is enabled only for single unit of measure per item, this must be the base unit!
   */
  unit_of_measure?: string;
}

export interface EstimateLineGroupMod {
  /**
   * One line of this estimate. Compare with EstimateLineGroup, which represents a previously defined group of lines in the estimate. In a Mod request, you can add a new line by supplying a `txn_line_id` value of -1.
   */
  estimate_line_mod?: EstimateLineMod[];
  /**
   * ItemGroup objects represent items that are grouped together for fast entry, and an `item_group_ref` aggregate refers to one of these item groups. In a request, if an `item_group_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored. You can use an ItemGroupQuery request to get information about all the item groups that are set up in the QuickBooks file.
   */
  item_group_ref?: CurrencyRef;
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

export interface EstimateLineMod {
  /**
   * A monetary amount.
   */
  amount?: number;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
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
   * The markup that will be passed on to the customer for this item on this estimate. Amount, quantity, rate, and markup are related in the following way: Amount = (Quantity \* Rate) + amount of markup
   *
   * Choose at most one of: `markup_rate`, or `markup_rate_percent`, or `price_level_ref`.
   */
  markup_rate?: number;
  /**
   * The markup (expressed as a percentage) that will be passed on to the customer for this item on this estimate. Amount, quantity, rate, and markup are related in the following way: Amount = (Quantity \* Rate) + amount of markup
   *
   * Choose at most one of: `markup_rate`, or `markup_rate_percent`, or `price_level_ref`.
   */
  markup_rate_percent?: number;
  /**
   * Flag to override price rule conflict.
   */
  option_for_price_rule_conflict?: "BasePrice" | "Zero";
  /**
   * Other, Other1, and Other2 are built-in transaction custom fields. Other is transaction-level; Other1 and Other2 are line-level. These fields are always available through the SDK and do not require DataExtDef setup. Template labels in the UI can be renamed, but SDK names remain fixed as Other, Other1, and Other2.
   */
  other1?: string;
  /**
   * Other, Other1, and Other2 are built-in transaction custom fields. Other is transaction-level; Other1 and Other2 are line-level. These fields are always available through the SDK and do not require DataExtDef setup. Template labels in the UI can be renamed, but SDK names remain fixed as Other, Other1, and Other2.
   */
  other2?: string;
  /**
   * When you modify a transaction line to change the unit of measure used in that line, you use this aggregate to specify the UOM set within which you are choosing an available unit of measure. The “override” here refers to the unit within the set, not the UOM Set itself, which you can’t change or override–the UOM set that can be set or changed only in the item itself via an Item Mod request.
   */
  override_uom_set_ref?: CurrencyRef;
  /**
   * Price levels let you apply custom pricing rules for selected customers. Once assigned, QuickBooks uses those prices automatically on supported sales forms unless explicitly overridden.
   *
   * Choose at most one of: `markup_rate`, or `markup_rate_percent`, or `price_level_ref`.
   */
  price_level_ref?: CurrencyRef;
  /**
   * On transaction lines, QuickBooks can derive one value from the other two among Quantity, Rate, and Amount. If you supply Quantity and Amount, QuickBooks calculates Rate. If you supply Quantity and Rate, QuickBooks calculates Amount.
   */
  quantity?: number;
  /**
   * If you specify both Rate and Amount in a request, the Rate you provide will be ignored, and you will receive a warning. If you specify both Quantity and Amount in an Add request, QuickBooks will use them to calculate Rate. (Rate, Amount, and Quantity can’t be cleared.)
   *
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate?: number;
  /**
   * Indicates the price of something as a percent.
   *
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate_percent?: number;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
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
