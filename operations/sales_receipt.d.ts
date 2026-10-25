// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, BillAddress, CreditCardTxnInfo, CreditMemoLineGroupAdd, CurrencyFilter, CurrencyRef, DataExtBill, DiscountLineAdd, ModifiedDateRangeFilter, RefNumberFilter, RefNumberRangeFilter, SalesTaxLineAdd, ShippingLineAdd, TxnDateRangeFilter } from "./types";

/** QuickBooks sales receipt operations: `qube.salesReceipt.<action>(connectionId, params, { webhookUrl })`. */
export declare class SalesReceipt {
  constructor(client: Client);
  /**
   * Create sales receipt: `POST /connections/{connection_id}/sales-receipts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `bill_address`, `check_number`, `class_ref`, `credit_card_txn_info`, `customer_msg_ref`, `customer_ref`, `customer_sales_tax_code_ref`, `def_macro`, `deposit_to_account_ref`, `discount_line_add`, `due_date`, `exchange_rate`, `external_guid`, `fob`, `include_ret_element`, `is_pending`, `is_tax_included`, `is_to_be_emailed`, `is_to_be_printed`, `item_sales_tax_ref`, `memo`, `other`, `payment_method_ref`, `ref_number`, `request_id`, `sales_receipt_line_add`, `sales_receipt_line_group_add`, `sales_rep_ref`, `sales_tax_line_add`, `ship_address`, `ship_date`, `ship_method_ref`, `shipping_line_add`, `template_ref`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/sales-receipts/create-sales-receipt
   */
  create(connectionId: string, params: SalesReceiptCreateParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List sales receipts: `GET /connections/{connection_id}/sales-receipts`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `currency_filter`, `entity_filter`, `include_line_items`, `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/sales-receipts/list-sales-receipts
   */
  query(connectionId: string, params: SalesReceiptQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update sales receipt: `PUT /connections/{connection_id}/sales-receipts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `bill_address`, `check_number`, `class_ref`, `customer_msg_ref`, `customer_ref`, `customer_sales_tax_code_ref`, `deposit_to_account_ref`, `due_date`, `edit_sequence` (required), `exchange_rate`, `fob`, `include_ret_element`, `is_pending`, `is_tax_included`, `is_to_be_emailed`, `is_to_be_printed`, `item_sales_tax_ref`, `memo`, `other`, `payment_method_ref`, `ref_number`, `request_id`, `sales_receipt_line_group_mod`, `sales_receipt_line_mod`, `sales_rep_ref`, `ship_address`, `ship_date`, `ship_method_ref`, `template_ref`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/sales-receipts/update-sales-receipt
   */
  update(connectionId: string, params: SalesReceiptUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `sales_receipt.create`: Create sales receipt.
 */
export interface SalesReceiptCreateParams {
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  bill_address?: BillAddress;
  /**
   * The check number of a check that a QuickBooks user writes or receives from someone else.
   */
  check_number?: string;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * Contains data from the credit card transaction used in the payment. This data originates from a previous qbmsXML credit card transaction. The data following the element `credit_card_txn_input_info`” data is the data from the original qbmsXML request. The “`credit_card_txn_result_info`” is the data from the original qbmsXML response.
   */
  credit_card_txn_info?: CreditCardTxnInfo;
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
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * Refers to the account where these funds will be (or have been) deposited. In a ReceivePaymentAdd request, the default is Undeposited Funds if this isn’t included in the request. In a request, if a `deposit_to_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  deposit_to_account_ref?: CurrencyRef;
  discount_line_add?: DiscountLineAdd;
  /**
   * A sales receipt doesn’t ordinarily include a due date, because sales receipts are generally used for point-of-sale payments, where full payment is received at the time of purchase.
   *
   * Format: date.
   */
  due_date?: string;
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
  include_ret_element?: Array<"BillAddress" | "BillAddressBlock" | "CheckNumber" | "ClassRef" | "CreditCardTxnInfo" | "CurrencyRef" | "CustomerMsgRef" | "CustomerRef" | "CustomerSalesTaxCodeRef" | "DataExtRet" | "DepositToAccountRef" | "DiscountLineRet" | "DueDate" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "FOB" | "IsPending" | "IsTaxIncluded" | "IsToBeEmailed" | "IsToBePrinted" | "ItemSalesTaxRef" | "ListID" | "Memo" | "Other" | "OwnerID" | "PaymentMethodRef" | "RefNumber" | "SalesReceiptLineGroupRet" | "SalesReceiptLineRet" | "SalesRepRef" | "SalesTaxLineRet" | "SalesTaxPercentage" | "SalesTaxTotal" | "ShipAddress" | "ShipAddressBlock" | "ShipDate" | "ShipMethodRef" | "ShippingLineRet" | "Subtotal" | "TemplateRef" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * If `is_pending` is set to true, the sales receipt hasn’t been completed. Pending sales might include unpaid orders, estimates, tracked hours that haven’t yet been billed, or sales of back-ordered items.
   */
  is_pending?: boolean;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
  /**
   * When enabled, QuickBooks validates the customer email at runtime before sending. If no valid email is available, the request fails.
   */
  is_to_be_emailed?: boolean;
  /**
   * If `is_to_be_printed` is true, QuickBooks queues the form for later printing. It does not print immediately; printing is still a user action in QuickBooks.
   */
  is_to_be_printed?: boolean;
  /**
   * An ItemSalesTax entry represents one tax rate paid to one tax agency. Use it when a transaction needs a single tax calculation. For multi-rate scenarios, use a sales-tax group instead. If both `full_name` and `list_id` are provided for `item_sales_tax_ref`, `list_id` is used.
   */
  item_sales_tax_ref?: CurrencyRef;
  /**
   * Message that appears in reports, but not on the sales receipt.
   */
  memo?: string;
  /**
   * Other, Other1, and Other2 are built-in transaction custom fields. Other is transaction-level; Other1 and Other2 are line-level. These fields are always available through the SDK and do not require DataExtDef setup. Template labels in the UI can be renamed, but SDK names remain fixed as Other, Other1, and Other2.
   */
  other?: string;
  /**
   * `payment_method_ref` identifies how a payment is made (for example, cash, check, or card type). If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  payment_method_ref?: CurrencyRef;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * One line of the sales receipt. Compare with SalesReceiptLineGroup, which represents a previously defined group of lines in the sales receipt.
   *
   * At least one entry is required across `sales_receipt_line_add` and `sales_receipt_line_group_add`; they combine, any number of each. QuickBooks receives them in that order: every `sales_receipt_line_add`, then every `sales_receipt_line_group_add`.
   */
  sales_receipt_line_add?: SalesReceiptLineAdd[];
  /**
   * Represents a previously defined group of lines in the sales receipt. Compare with SalesReceiptLine, which represents just one line in the sales receipt.
   *
   * At least one entry is required across `sales_receipt_line_add` and `sales_receipt_line_group_add`; they combine, any number of each. QuickBooks receives them in that order: every `sales_receipt_line_add`, then every `sales_receipt_line_group_add`.
   */
  sales_receipt_line_group_add?: CreditMemoLineGroupAdd[];
  /**
   * A sales representative must be on the Employee, Vendor, or Other Names list within QuickBooks. Sales representative’s names and initials appear on the Rep drop-down list on QuickBooks sales forms. A `sales_rep_ref` refers to a person on the SalesRep list. In a request, if a `sales_rep_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  sales_rep_ref?: CurrencyRef;
  sales_tax_line_add?: SalesTaxLineAdd;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  ship_address?: BillAddress;
  /**
   * The date when the product was, or will be, shipped.
   *
   * Format: date.
   */
  ship_date?: string;
  /**
   * A shipping method, for example, standard mail or overnight delivery. A `ship_method_ref` aggregate refers to an item on the ShipMethod list. In a request, if a `ship_method_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  ship_method_ref?: CurrencyRef;
  shipping_line_add?: ShippingLineAdd;
  /**
   * QuickBooks templates specify how to print certain transactions. A template query returns the names of all templates that have been defined in QuickBooks. A `template_ref` element refers to one of these templates.
   */
  template_ref?: CurrencyRef;
  /**
   * The date of the sales receipt. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
}

/**
 * The params of `sales_receipt.query`: List sales receipts.
 */
export interface SalesReceiptQueryParams {
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
  include_ret_element?: Array<"BillAddress" | "BillAddressBlock" | "CheckNumber" | "ClassRef" | "CreditCardTxnInfo" | "CurrencyRef" | "CustomerMsgRef" | "CustomerRef" | "CustomerSalesTaxCodeRef" | "DataExtRet" | "DepositToAccountRef" | "DiscountLineRet" | "DueDate" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "FOB" | "IsPending" | "IsTaxIncluded" | "IsToBeEmailed" | "IsToBePrinted" | "ItemSalesTaxRef" | "Memo" | "Other" | "PaymentMethodRef" | "RefNumber" | "SalesReceiptLineGroupRet" | "SalesReceiptLineRet" | "SalesRepRef" | "SalesTaxLineRet" | "SalesTaxPercentage" | "SalesTaxTotal" | "ShipAddress" | "ShipAddressBlock" | "ShipDate" | "ShipMethodRef" | "ShippingLineRet" | "Subtotal" | "TemplateRef" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber">;
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
 * The params of `sales_receipt.update`: Update sales receipt.
 */
export interface SalesReceiptUpdateParams {
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  bill_address?: BillAddress;
  /**
   * The check number of a check that a QuickBooks user writes or receives from someone else.
   */
  check_number?: string;
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
  customer_ref?: CurrencyRef;
  /**
   * Refers to the sales-tax code for sales related to this customer. (That is, it refers to a member of the SalesTaxCode list.) The sales-tax code indicates whether an item is taxable or non-taxable, and why. In a request, if a `customer_sales_tax_code_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  customer_sales_tax_code_ref?: CurrencyRef;
  /**
   * Refers to the account where these funds will be (or have been) deposited. In a ReceivePaymentAdd request, the default is Undeposited Funds if this isn’t included in the request. In a request, if a `deposit_to_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  deposit_to_account_ref?: CurrencyRef;
  /**
   * A sales receipt doesn’t ordinarily include a due date, because sales receipts are generally used for point-of-sale payments, where full payment is received at the time of purchase.
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
  /**
   * QuickBooks uses the term FOB, “freight on board,” to indicate the place from which the product is shipped. The FOB has no accounting implications.
   */
  fob?: string;
  include_ret_element?: Array<"BillAddress" | "BillAddressBlock" | "CheckNumber" | "ClassRef" | "CreditCardTxnInfo" | "CurrencyRef" | "CustomerMsgRef" | "CustomerRef" | "CustomerSalesTaxCodeRef" | "DataExtRet" | "DepositToAccountRef" | "DiscountLineRet" | "DueDate" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "FOB" | "IsPending" | "IsTaxIncluded" | "IsToBeEmailed" | "IsToBePrinted" | "ItemSalesTaxRef" | "ListID" | "Memo" | "Other" | "OwnerID" | "PaymentMethodRef" | "RefNumber" | "SalesReceiptLineGroupRet" | "SalesReceiptLineRet" | "SalesRepRef" | "SalesTaxLineRet" | "SalesTaxPercentage" | "SalesTaxTotal" | "ShipAddress" | "ShipAddressBlock" | "ShipDate" | "ShipMethodRef" | "ShippingLineRet" | "Subtotal" | "TemplateRef" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * If `is_pending` is set to true, the sales receipt hasn’t been completed. Pending sales might include unpaid orders, estimates, tracked hours that haven’t yet been billed, or sales of back-ordered items.
   */
  is_pending?: boolean;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
  /**
   * When enabled, QuickBooks validates the customer email at runtime before sending. If no valid email is available, the request fails.
   */
  is_to_be_emailed?: boolean;
  /**
   * If `is_to_be_printed` is true, QuickBooks queues the form for later printing. It does not print immediately; printing is still a user action in QuickBooks.
   */
  is_to_be_printed?: boolean;
  /**
   * An ItemSalesTax entry represents one tax rate paid to one tax agency. Use it when a transaction needs a single tax calculation. For multi-rate scenarios, use a sales-tax group instead. If both `full_name` and `list_id` are provided for `item_sales_tax_ref`, `list_id` is used.
   */
  item_sales_tax_ref?: CurrencyRef;
  /**
   * Message that appears in reports, but not on the sales receipt.
   */
  memo?: string;
  /**
   * Other, Other1, and Other2 are built-in transaction custom fields. Other is transaction-level; Other1 and Other2 are line-level. These fields are always available through the SDK and do not require DataExtDef setup. Template labels in the UI can be renamed, but SDK names remain fixed as Other, Other1, and Other2.
   */
  other?: string;
  /**
   * `payment_method_ref` identifies how a payment is made (for example, cash, check, or card type). If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  payment_method_ref?: CurrencyRef;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Represents a previously defined group of lines in the sales receipt. Compare with SalesReceiptLine, which represents just one line in the sales receipt.
   *
   * `sales_receipt_line_mod` and `sales_receipt_line_group_mod` combine: any number of each. QuickBooks receives them in that order: every `sales_receipt_line_mod`, then every `sales_receipt_line_group_mod`.
   */
  sales_receipt_line_group_mod?: SalesReceiptLineGroupMod[];
  /**
   * One line of the sales receipt. Compare with SalesReceiptLineGroup, which represents a previously defined group of lines in the sales receipt.
   *
   * `sales_receipt_line_mod` and `sales_receipt_line_group_mod` combine: any number of each. QuickBooks receives them in that order: every `sales_receipt_line_mod`, then every `sales_receipt_line_group_mod`.
   */
  sales_receipt_line_mod?: SalesReceiptLineMod[];
  /**
   * A sales representative must be on the Employee, Vendor, or Other Names list within QuickBooks. Sales representative’s names and initials appear on the Rep drop-down list on QuickBooks sales forms. A `sales_rep_ref` refers to a person on the SalesRep list. In a request, if a `sales_rep_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  sales_rep_ref?: CurrencyRef;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  ship_address?: BillAddress;
  /**
   * The date when the product was, or will be, shipped.
   *
   * Format: date.
   */
  ship_date?: string;
  /**
   * A shipping method, for example, standard mail or overnight delivery. A `ship_method_ref` aggregate refers to an item on the ShipMethod list. In a request, if a `ship_method_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  ship_method_ref?: CurrencyRef;
  /**
   * QuickBooks templates specify how to print certain transactions. A template query returns the names of all templates that have been defined in QuickBooks. A `template_ref` element refers to one of these templates.
   */
  template_ref?: CurrencyRef;
  /**
   * The date of the sales receipt. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
}

export interface SalesReceiptLineAdd {
  /**
   * A monetary amount.
   */
  amount?: number;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * Contains data from the credit card transaction used in the payment. This data originates from a previous qbmsXML credit card transaction. The data following the element `credit_card_txn_input_info`” data is the data from the original qbmsXML request. The “`credit_card_txn_result_info`” is the data from the original qbmsXML response.
   */
  credit_card_txn_info?: CreditCardTxnInfo;
  data_ext?: DataExtBill[];
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
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
  is_taxable?: boolean;
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
   * Choose at most one of: `rate`, or `rate_percent`, or `price_level_ref`.
   */
  price_level_ref?: CurrencyRef;
  /**
   * On transaction lines, QuickBooks can derive one value from the other two among Quantity, Rate, and Amount. If you supply Quantity and Amount, QuickBooks calculates Rate. If you supply Quantity and Rate, QuickBooks calculates Amount.
   */
  quantity?: number;
  /**
   * If you specify both Rate and Amount in a request, the Rate you provide will be ignored, and you will receive a warning. If you specify both Quantity and Amount in an Add request, QuickBooks will use them to calculate Rate. (Rate, Amount, and Quantity can’t be cleared.)
   *
   * Choose at most one of: `rate`, or `rate_percent`, or `price_level_ref`.
   */
  rate?: number;
  /**
   * Indicates the price of something as a percent.
   *
   * Choose at most one of: `rate`, or `rate_percent`, or `price_level_ref`.
   */
  rate_percent?: number;
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
  /**
   * Indicates the date on which the QuickBooks user performs the service for the customer.
   *
   * Format: date.
   */
  service_date?: string;
  tax_amount?: number;
  /**
   * In a transaction line item, the name of the unit of measure selected from within the item’s available units. If the company file is enabled only for single unit of measure per item, this must be the base unit!
   */
  unit_of_measure?: string;
}

export interface SalesReceiptLineGroupMod {
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
   * One line of the sales receipt. Compare with SalesReceiptLineGroup, which represents a previously defined group of lines in the sales receipt.
   */
  sales_receipt_line_mod?: SalesReceiptLineMod[];
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id: string;
  /**
   * In a transaction line item, the name of the unit of measure selected from within the item’s available units. If the company file is enabled only for single unit of measure per item, this must be the base unit!
   */
  unit_of_measure?: string;
}

export interface SalesReceiptLineMod {
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
   * The lot number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  lot_number?: string;
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
   * When you modify a transaction line to change the unit of measure used in that line, you use this aggregate to specify the UOM set within which you are choosing an available unit of measure. The “override” here refers to the unit within the set, not the UOM Set itself, which you can’t change or override–the UOM set that can be set or changed only in the item itself via an Item Mod request.
   */
  override_uom_set_ref?: CurrencyRef;
  /**
   * Price levels let you apply custom pricing rules for selected customers. Once assigned, QuickBooks uses those prices automatically on supported sales forms unless explicitly overridden.
   *
   * Choose at most one of: `rate`, or `rate_percent`, or `price_level_ref`.
   */
  price_level_ref?: CurrencyRef;
  /**
   * On transaction lines, QuickBooks can derive one value from the other two among Quantity, Rate, and Amount. If you supply Quantity and Amount, QuickBooks calculates Rate. If you supply Quantity and Rate, QuickBooks calculates Amount.
   */
  quantity?: number;
  /**
   * If you specify both Rate and Amount in a request, the Rate you provide will be ignored, and you will receive a warning. If you specify both Quantity and Amount in an Add request, QuickBooks will use them to calculate Rate. (Rate, Amount, and Quantity can’t be cleared.)
   *
   * Choose at most one of: `rate`, or `rate_percent`, or `price_level_ref`.
   */
  rate?: number;
  /**
   * Indicates the price of something as a percent.
   *
   * Choose at most one of: `rate`, or `rate_percent`, or `price_level_ref`.
   */
  rate_percent?: number;
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
  /**
   * Indicates the date on which the QuickBooks user performs the service for the customer.
   *
   * Format: date.
   */
  service_date?: string;
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
