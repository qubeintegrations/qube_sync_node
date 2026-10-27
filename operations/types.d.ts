// Generated from operations.json by scripts/generate-operations.js: don't edit.

/** A queued request, as the API answers it (snake_case keys). */
export type QueuedRequest = { [key: string]: any };

/** The options every operation method takes. */
export interface OperationOptions {
  /** Where QuBe Sync POSTs the answered request. Required. */
  webhookUrl: string;
  /** Default: a fresh UUID per call, reused on that call's retries. */
  idempotencyKey?: string;
}

/**
 * Give exactly one of: `list_id`, or `full_name`, or `list_id_with_children`, or `full_name_with_children`.
 */
export interface AccountFilter {
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
 * Give exactly one of: `list_id`, or `full_name`, or `list_id_with_children`, or `full_name_with_children`.
 */
export interface AccountFilterPaycheck {
  full_name?: string[];
  full_name_with_children?: string;
  list_id?: string[];
  list_id_with_children?: string;
}

export interface AdditionalContactRef {
  /**
   * The name of the contact.
   */
  contact_name: string;
  /**
   * The value of the contact field.
   */
  contact_value: string;
}

export interface Address {
  /**
   * The first line of an address.
   */
  addr1?: string;
  /**
   * The second line of an address (if a second line is needed).
   */
  addr2?: string;
  /**
   * The third line of an address (if a third line is needed).
   */
  addr3?: string;
  /**
   * The fourth line of an address (if a fourth line is needed).
   */
  addr4?: string;
  /**
   * The fifth line of an address (if a fifth line is needed).
   */
  addr5?: string;
  /**
   * The city name in an address.
   */
  city?: string;
  /**
   * The country name in an address, or, in returned Host information (HostRet or HostInfo), the country for which this edition of QuickBooks was designed. (Possible values are US, CA, UK, and AU.)
   */
  country?: string;
  /**
   * In a BillAddress or ShipAddress aggregate, the Note field value is written at the bottom of the address in the form in which it appears, such as the invoice form.
   */
  note?: string;
  /**
   * The postal code in an address.
   */
  postal_code?: string;
  /**
   * The state name in an address.
   */
  state?: string;
}

export interface AppliedToTxnAdd {
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
  txn_line_detail?: TxnLineDetail[];
}

export interface BarCodeItemDiscount {
  /**
   * Allows for barcode to be overridden for an item.
   */
  allow_override?: boolean;
  /**
   * Allow barcode to be assigned to item, even if already in use.
   */
  assign_even_if_used?: boolean;
  /**
   * Value of the barcode in the item.
   */
  bar_code_value?: string;
}

export interface BillAddress {
  /**
   * The first line of an address.
   */
  addr1?: string;
  /**
   * The second line of an address (if a second line is needed).
   */
  addr2?: string;
  /**
   * The third line of an address (if a third line is needed).
   */
  addr3?: string;
  /**
   * The fourth line of an address (if a fourth line is needed).
   */
  addr4?: string;
  /**
   * The fifth line of an address (if a fifth line is needed).
   */
  addr5?: string;
  /**
   * The city name in an address.
   */
  city?: string;
  /**
   * The country name in an address, or, in returned Host information (HostRet or HostInfo), the country for which this edition of QuickBooks was designed. (Possible values are US, CA, UK, and AU.)
   */
  country?: string;
  /**
   * In a `bill_address` or `ship_address` aggregate, the Note field value is written at the bottom of the address in the form in which it appears, such as the invoice form.
   */
  note?: string;
  /**
   * The postal code in an address.
   */
  postal_code?: string;
  /**
   * The state name in an address.
   */
  state?: string;
}

export interface ClassRef {
  full_name?: string;
  list_id?: string;
}

export interface Contacts {
  additional_contact_ref?: AdditionalContactRef[];
  /**
   * The first name of a customer, vendor, employee, or person on the “other names” list.
   */
  first_name: string;
  /**
   * The job title of a customer, vendor, employee, or person on the “other names” list.
   */
  job_title?: string;
  /**
   * The last name of a customer, vendor, employee, or person on the “other names” list.
   */
  last_name?: string;
  /**
   * The middle name of a customer, vendor, employee, or person on the “other names” list.
   */
  middle_name?: string;
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
}

export interface ContactsMod {
  additional_contact_ref?: AdditionalContactRef[];
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence?: string;
  /**
   * The first name of a customer, vendor, employee, or person on the “other names” list.
   */
  first_name: string;
  /**
   * The job title of a customer, vendor, employee, or person on the “other names” list.
   */
  job_title?: string;
  /**
   * The last name of a customer, vendor, employee, or person on the “other names” list.
   */
  last_name?: string;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id?: string;
  /**
   * The middle name of a customer, vendor, employee, or person on the “other names” list.
   */
  middle_name?: string;
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
}

export interface CreditCardTxnInfo {
  /**
   * This contains data originally supplied in the QBMS transaction request. This information block shouldn’t be used in CreditMemo requests for QuickBooks 2007 and new versions. Instead, use the ARRefundCreditCard request.
   */
  credit_card_txn_input_info: CreditCardTxnInputInfo;
  /**
   * This contains data returned in the QBMS transaction response. This information block shouldn’t be used in CreditMemo requests for QuickBooks 2007 and new versions. Instead, use the ARRefundCreditCard request.
   */
  credit_card_txn_result_info: CreditCardTxnResultInfo;
}

export interface CreditCardTxnInputInfo {
  /**
   * This optional field is used only for Visa and Master Card commercial cards. There are three types of these cards: purchase, corporate, and business. Normally, special lower transaction fee rates apply when these cards are used and this field is filled out. If this field is left blank, then the usual (and higher) discount rate applies.
   */
  commercial_card_code?: string;
  /**
   * The address associated with this credit card.
   */
  credit_card_address?: string;
  /**
   * Credit-card number for this customer or this payment. Beginning with qbXML spec 6.0 and QuickBooks 2007, you must mask the credit card number with lower case “x” and no dashes. For example, xxxxxxxxxxxx1234.
   */
  credit_card_number: string;
  /**
   * The postal code associated with the address for this credit card.
   */
  credit_card_postal_code?: string;
  /**
   * Indicates the QBMS transaction from which the current transaction data originated, for example, Charge, Authorization, Capture, Refund, VoiceAuthorization, or Void.
   */
  credit_card_txn_type?: "Authorization" | "Capture" | "Charge" | "Refund" | "VoiceAuthorization";
  /**
   * The month when the credit card expires.
   *
   * Minimum 1. Maximum 12.
   */
  expiration_month: number;
  /**
   * The year when the credit card expires.
   */
  expiration_year: number;
  /**
   * The name on the customer’s credit card.
   */
  name_on_card: string;
  /**
   * Indicates whether this transaction came from a card swipe (tmCardPresent) or not (tmCardNotPresent).
   */
  transaction_mode?: "CardNotPresent" | "CardPresent";
}

export interface CreditCardTxnResultInfo {
  /**
   * The authorization code is returned from the credit card processor to indicate that the charge will be paid by the card issuer. In a voice authorization request (CustomerCreditCardVoiceAuthRq), the authorization code is supplied by the card issuer over the telephone.
   */
  authorization_code?: string;
  /**
   * This field contains the value avssPass if the street address supplied in the transaction request matches the customer’s address on file at the card issuer. It contains the value avssFail if there isn’t a match, or avssNotAvailable if the card issuer doesn’t support AVS. Note: This field was required in qbXML 4.1, but is optional in qbXML 5.0 and later.
   */
  avs_street?: "Fail" | "NotAvailable" | "Pass";
  /**
   * This field contains the value avszPass if the customer postal ZIP code supplied in the transaction request matches the customer’s postal code recognized at the card issuer. It contains the value avszFail if there isn’t a match, or avszNotAvailable if the card issuer doesn’t support AVS. Note: This field was required in qbXML 4.1, but is optional in qbXML 5.0 and later.
   */
  avs_zip?: "Fail" | "NotAvailable" | "Pass";
  /**
   * This field contains the value Pass if the card security code supplied in the transaction request matches the card security code recognized for that credit card number at the card issuer. It contains the value Fail if there isn’t a match.
   */
  card_security_code_match?: "Fail" | "NotAvailable" | "Pass";
  /**
   * This value is returned from QBMS transactions for future use by the QuickBooks Reconciliation feature.
   */
  client_trans_id?: string;
  /**
   * This transaction ID is returned from the credit card processor. You should save this value for any possible QBMS SDK transaction requests that need it, for example, CustomerCreditCardTxnVoidRq, or CustomerCreditCardCaptureRq.
   */
  credit_card_trans_id: string;
  /**
   * This is the QBMS account number of the merchant who is running the transaction using the customer’s credit card. It is returned from the transaction request and should be stored for subsequent transactions, such as using it in the QB SDK SalesReceiptAdd, ReceivePaymentAdd, ARRefundCreditCard requests to save the transaction data in QuickBooks.
   */
  merchant_account_number: string;
  /**
   * Internal code needed for the QuickBooks reconciliation feature, if integrating with QuickBooks. This value is returned in the QBMS response to a QBMS transaction request, and must be subsequently supplied by your application in the QB SDK ReceivePaymentAdd or SalesReceiptAdd request.
   */
  payment_grouping_code?: number;
  /**
   * Indicates payment processing status as known by QuickBooks/QBMS integration state. `psCompleted` indicates confirmed success; `psUnknown` indicates status could not be definitively confirmed.
   */
  payment_status: "Completed" | "Unknown";
  /**
   * This value is returned by QBMS from the transaction request, and is used internally by the QuickBooks/QBMS Recon (reconcile) feature. You should save this value without modification and include it in the QB SDK SalesReceiptAdd or ReceivePaymentAdd requests if you want to save the transaction data in QuickBooks.
   */
  recon_batch_id?: string;
  /**
   * This contains the status code returned in the original QBMS transaction response.
   */
  result_code: number;
  /**
   * This contains the status message returned in the original QBMS transaction response.
   */
  result_message: string;
  /**
   * This value is used to support the credit card transaction Reconcile feature within QuickBooks.
   */
  txn_authorization_stamp?: number;
  /**
   * Timestamp indicating the time in which the card processor authorized the transaction.
   *
   * Format: date-time.
   */
  txn_authorization_time: string;
}

export interface CreditMemoLineGroupAdd {
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
   * ItemGroup objects represent items that are grouped together for fast entry, and an `item_group_ref` aggregate refers to one of these item groups. In a request, if an `item_group_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored. You can use an ItemGroupQuery request to get information about all the item groups that are set up in the QuickBooks file.
   */
  item_group_ref: CurrencyRef;
  /**
   * On transaction lines, QuickBooks can derive one value from the other two among Quantity, Rate, and Amount. If you supply Quantity and Amount, QuickBooks calculates Rate. If you supply Quantity and Rate, QuickBooks calculates Amount.
   */
  quantity?: number;
  /**
   * Indicates the date on which the QuickBooks user performs the service for the customer.
   *
   * Format: date.
   */
  service_date?: string;
  /**
   * In a transaction line item, the name of the unit of measure selected from within the item’s available units. If the company file is enabled only for single unit of measure per item, this must be the base unit!
   */
  unit_of_measure?: string;
}

/**
 * Give exactly one of: `list_id`, or `full_name`.
 */
export interface CurrencyFilter {
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   */
  full_name?: string[];
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id?: string[];
}

export interface CurrencyRef {
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   */
  full_name?: string;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id?: string;
}

export interface DataExtBill {
  /**
   * The name of the data extension. If this is a custom field, `data_ext_name` will be visible as a label in the QuickBooks user interface. Also because `owner_id` and `data_ext_name` together make the data extension unique, and because custom fields all have the same `owner_id` of zero, the `data_ext_name` must be a unique value among existing custom fields.
   */
  data_ext_name: string;
  /**
   * The data in this field. The maximum length of `data_ext_value` will depend on the `data_ext_type` of this data extension. For example, if `data_ext_type` is STR255TYPE, the maximum length of `data_ext_value` is 255 characters. If `data_ext_type` is STR1024TYPE, the maximum size of `data_ext_value` is 1KB.
   */
  data_ext_value: string;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id: string;
}

export interface DeletedDateRangeFilter {
  /**
   * Selects objects deleted on or after this date. Both `from_deleted_date` and `to_deleted_date` must be between 1970-01-01 and 2038-01-19T03:14:07 (2038-01-18T19:14:07-08:00 PST). (But note that ListDeletedQuery requests will only return records deleted within the last 90 days, even if the specified `from_deleted_date` is earlier.)
   *
   * Format: date-time.
   */
  from_deleted_date?: string;
  /**
   * Selects objects deleted on or before this date. Both `to_deleted_date` and `from_deleted_date` must be between 1970-01-01 and 2038-01-19T03:14:07 (2038-01-18T19:14:07-08:00 PST). If `to_deleted_date` includes a date but not a time (for example, if you set it to 2002-02-14), the time is assumed to be the end of the day (2003-02-14T23:59:59).
   *
   * Format: date-time.
   */
  to_deleted_date?: string;
}

export interface DiscountLineAdd {
  account_ref?: CurrencyRef;
  /**
   * A monetary amount.
   *
   * Choose at most one of: `amount`, or `rate_percent`.
   */
  amount?: number;
  is_taxable?: boolean;
  /**
   * Indicates the price of something as a percent.
   *
   * Choose at most one of: `amount`, or `rate_percent`.
   */
  rate_percent?: number;
}

export interface ExpenseLineAdd {
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
   * Additional information.
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

export interface ExpenseLineMod {
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
   * Additional information.
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

export interface ItemGroupLineAdd {
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

export interface ItemGroupLineMod {
  /**
   * ItemGroup objects represent items that are grouped together for fast entry, and an `item_group_ref` aggregate refers to one of these item groups. In a request, if an `item_group_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored. You can use an ItemGroupQuery request to get information about all the item groups that are set up in the QuickBooks file.
   */
  item_group_ref?: CurrencyRef;
  /**
   * An ItemLine is used to track any portion of a transaction that represents the purchase of an “item.” If ItemLineAdd doesn’t specify an Amount, Cost, or Quantity, then QuickBooks will calculate Amount based on a Quantity of 1 and the suggested Cost.
   */
  item_line_mod?: ItemLineMod[];
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

export interface ItemLineAdd {
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

export interface ItemLineMod {
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

export interface LiabilityPaymentSchedule {
  /**
   * Format: date.
   */
  payment_due_date?: string;
  payment_due_num_days_after?: number;
  payment_schedule_type: "Empty" | "FederalMonthly" | "FederalNextDay" | "FederalQuarterly" | "FederalSemiweekly" | "Monthly" | "Quarterly" | "Semiweekly" | "Weekly" | "Yearly";
}

export interface LinkToTxn {
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id: string;
}

export interface ModifiedDateRangeFilter {
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

export interface ModifiedDateRangeFilterPaycheck {
  /**
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * Format: date-time.
   */
  to_modified_date?: string;
}

export interface NameFilter {
  /**
   * The criterion to match.
   */
  match_criterion: "Contains" | "EndsWith" | "StartsWith";
  /**
   * The string to match.
   */
  name: string;
}

export interface NameRangeFilter {
  /**
   * The first name or item in the search range. If `from_name` is omitted, the range will begin with first name on the list.
   */
  from_name?: string;
  /**
   * The final name or item in the search range. If `to_name` is omitted, the range will end with last name on the list.
   */
  to_name?: string;
}

/**
 * Give exactly one of: (`from_payroll_date`, `to_payroll_date`), or `date_macro`.
 */
export interface PayrollDateRangeFilter {
  date_macro?: "All" | "LastCalendarQuarter" | "LastCalendarQuarterToDate" | "LastCalendarYear" | "LastCalendarYearToDate" | "LastFiscalQuarter" | "LastFiscalQuarterToDate" | "LastFiscalYear" | "LastFiscalYearToDate" | "LastMonth" | "LastMonthToDate" | "LastWeek" | "LastWeekToDate" | "NextCalendarQuarter" | "NextCalendarYear" | "NextFiscalQuarter" | "NextFiscalYear" | "NextFourWeeks" | "NextMonth" | "NextWeek" | "ThisCalendarQuarter" | "ThisCalendarQuarterToDate" | "ThisCalendarYear" | "ThisCalendarYearToDate" | "ThisFiscalQuarter" | "ThisFiscalQuarterToDate" | "ThisFiscalYear" | "ThisFiscalYearToDate" | "ThisMonth" | "ThisMonthToDate" | "ThisWeek" | "ThisWeekToDate" | "Today" | "Yesterday";
  /**
   * Format: date.
   */
  from_payroll_date?: string;
  /**
   * Format: date.
   */
  to_payroll_date?: string;
}

export interface RefNumberFilter {
  /**
   * The criterion to match.
   */
  match_criterion: "Contains" | "EndsWith" | "StartsWith";
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number: string;
}

export interface RefNumberFilterPaycheck {
  match_criterion: "Contains" | "EndsWith" | "StartsWith";
  ref_number: string;
}

export interface RefNumberRangeFilter {
  /**
   * The first `ref_number` in the search range. If `from_ref_number` is omitted, the range will begin with first number on the list.
   */
  from_ref_number?: string;
  /**
   * The final `ref_number` in the search range. If `to_ref_number` is omitted, the range will end with last number on the list.
   */
  to_ref_number?: string;
}

export interface RefNumberRangeFilterPaycheck {
  from_ref_number?: string;
  to_ref_number?: string;
}

/**
 * Give exactly one of: `account_type_filter`, or `list_id`, or `full_name`, or `list_id_with_children`, or `full_name_with_children`.
 */
export interface ReportAccountFilter {
  /**
   * Allows you to report on a specific account type.
   */
  account_type_filter?: "APAndSalesTax" | "APOrCreditCard" | "ARAndAP" | "AccountsPayable" | "AccountsReceivable" | "AllowedFor1099" | "Asset" | "BalanceSheet" | "Bank" | "BankAndARAndAPAndUF" | "BankAndUF" | "CostOfSales" | "CreditCard" | "CurrentAsset" | "CurrentAssetAndExpense" | "CurrentLiability" | "Equity" | "EquityAndIncomeAndExpense" | "ExpenseAndOtherExpense" | "FixedAsset" | "IncomeAndExpense" | "IncomeAndOtherIncome" | "Liability" | "LiabilityAndEquity" | "LongTermLiability" | "NonPosting" | "OrdinaryExpense" | "OrdinaryIncome" | "OrdinaryIncomeAndCOGS" | "OrdinaryIncomeAndExpense" | "OtherAsset" | "OtherCurrentAsset" | "OtherCurrentLiability" | "OtherExpense" | "OtherIncome" | "OtherIncomeOrExpense";
  full_name?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants. For names that don’t have children, `full_name_with_children` is exactly the same as `full_name`.
   */
  full_name_with_children?: string;
  list_id?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants.
   */
  list_id_with_children?: string;
}

/**
 * Give exactly one of: `list_id`, or `full_name`, or `list_id_with_children`, or `full_name_with_children`.
 */
export interface ReportClassFilter {
  full_name?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants. For names that don’t have children, `full_name_with_children` is exactly the same as `full_name`.
   */
  full_name_with_children?: string;
  list_id?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants.
   */
  list_id_with_children?: string;
}

/**
 * Give exactly one of: `entity_type_filter`, or `list_id`, or `full_name`, or `list_id_with_children`, or `full_name_with_children`.
 */
export interface ReportEntityFilter {
  /**
   * Allows you to report on a specific name type.
   */
  entity_type_filter?: "Customer" | "Employee" | "OtherName" | "Vendor";
  full_name?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants. For names that don’t have children, `full_name_with_children` is exactly the same as `full_name`.
   */
  full_name_with_children?: string;
  list_id?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants.
   */
  list_id_with_children?: string;
}

/**
 * Give exactly one of: `item_type_filter`, or `list_id`, or `full_name`, or `list_id_with_children`, or `full_name_with_children`.
 */
export interface ReportItemFilter {
  full_name?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants. For names that don’t have children, `full_name_with_children` is exactly the same as `full_name`.
   */
  full_name_with_children?: string;
  /**
   * Allows you to report on a specific item type.
   */
  item_type_filter?: "AllExceptFixedAsset" | "Assembly" | "Discount" | "FixedAsset" | "Inventory" | "InventoryAndAssembly" | "NonInventory" | "OtherCharge" | "Payment" | "Sales" | "SalesTax" | "Service";
  list_id?: string[];
  /**
   * Allows you to filter for data that relates to the specified object and its descendants.
   */
  list_id_with_children?: string;
}

export interface ReportModifiedDateRangeFilter {
  /**
   * Selects information from this date and later. The range of acceptable dates is 1970-01-01 to 2038-01-19T03:14:07 (2038-01-18T19:14:07-08:00 PST).
   *
   * Format: date.
   */
  from_report_modified_date?: string;
  /**
   * Selects information created on this date or earlier. The range of acceptable dates is 1970-01-01 to 2038-01-19T03:14:07 (2038-01-18T19:14:07-08:00 PST).
   *
   * Format: date.
   */
  to_report_modified_date?: string;
}

export interface ReportPeriod {
  /**
   * Selects information from this date and later. The range of acceptable `from_report_date` and `to_report_date` values depends on how the report dates are determined. If the report dates are based on the dates of transactions, the range is 01/01/1901 to 12/31/9999.
   *
   * Format: date.
   */
  from_report_date?: string;
  /**
   * Selects information created on this date or earlier. The range of acceptable `to_report_date` and `from_report_date` values depends on how the report dates are determined. If the report dates are based on the dates of transactions, the range is 01/01/1901 to 12/31/9999.
   *
   * Format: date.
   */
  to_report_date?: string;
}

export interface ReportTxnTypeFilter {
  txn_type_filter: Array<"ARRefundCreditCard" | "All" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Deposit" | "Estimate" | "InventoryAdjustment" | "Invoice" | "ItemReceipt" | "JournalEntry" | "LiabilityAdjustment" | "Paycheck" | "PayrollLiabilityCheck" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "Transfer" | "VendorCredit" | "YTDAdjustment">;
}

export interface SalesAndPurchase {
  /**
   * Refers to an expense account. If an `expense_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  expense_account_ref?: CurrencyRef;
  /**
   * Refers to an income account. If an `income_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  income_account_ref?: CurrencyRef;
  /**
   * The preferred vendor for this item. If a `pref_vendor_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  pref_vendor_ref?: CurrencyRef;
  /**
   * Amount that the QuickBooks user expects to pay when ordering or buying this item, or the amount that was actually paid for this item.
   */
  purchase_cost?: number;
  /**
   * Description that appears in the Description column of checks, bills, credit card charges, and item receipts (when an item is reordered). For a fixed asset, a description of the item as it was when it was purchased.
   */
  purchase_desc?: string;
  /**
   * Account used for taxes on purchases in CA or UK.
   */
  purchase_tax_code_ref?: CurrencyRef;
  /**
   * Appears in the Description column of a sales form when the QuickBooks user sells this item. For a fixed asset, describes the sale of the asset (for accounting purposes).
   */
  sales_desc?: string;
  /**
   * Price charged for this item.
   */
  sales_price?: number;
}

export interface SalesAndPurchaseMod {
  /**
   * Used to support changing the `account_ref` in the Mod request. When you do this, the QuickBooks UI normally displays a prompt asking whether the change should apply to existing transactions or not. Specifying False basically dismisses this with a “No” answer; specifying True dismisses it with a “Yes” answer and then changes the existing transactions that use the item with that `account_ref`.
   */
  apply_expense_account_ref_to_existing_txns?: boolean;
  /**
   * Used to support changing the `account_ref` in the Mod request. When you do this, the QuickBooks UI normally displays a prompt asking whether the change should apply to existing transactions or not. Specifying False basically dismisses this with a “No” answer; specifying True dismisses it with a “Yes” answer and then changes the existing transactions that use the item with that `account_ref`.
   */
  apply_income_account_ref_to_existing_txns?: boolean;
  /**
   * Refers to an expense account. If an `expense_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  expense_account_ref?: CurrencyRef;
  /**
   * Refers to an income account. If an `income_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  income_account_ref?: CurrencyRef;
  /**
   * The preferred vendor for this item. If a `pref_vendor_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  pref_vendor_ref?: CurrencyRef;
  /**
   * Amount that the QuickBooks user expects to pay when ordering or buying this item, or the amount that was actually paid for this item.
   */
  purchase_cost?: number;
  /**
   * Description that appears in the Description column of checks, bills, credit card charges, and item receipts (when an item is reordered). For a fixed asset, a description of the item as it was when it was purchased.
   */
  purchase_desc?: string;
  /**
   * Account used for taxes on purchases in CA or UK.
   */
  purchase_tax_code_ref?: CurrencyRef;
  /**
   * Appears in the Description column of a sales form when the QuickBooks user sells this item. For a fixed asset, describes the sale of the asset (for accounting purposes).
   */
  sales_desc?: string;
  /**
   * Price charged for this item.
   */
  sales_price?: number;
}

export interface SalesOrPurchase {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref?: CurrencyRef;
  /**
   * A descriptive text field.
   */
  desc?: string;
  /**
   * The purchase price or sales price of this item.
   *
   * Choose at most one of: `price`, or `price_percent`.
   */
  price?: number;
  /**
   * The price expressed as a percent. (For example, an auto shop that calculates the cost of labor as a percentage of the cost of parts might have a service item called “Labor” that uses `price_percent` instead of Price.)
   *
   * Choose at most one of: `price`, or `price_percent`.
   */
  price_percent?: number;
}

export interface SalesOrPurchaseMod {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref?: CurrencyRef;
  /**
   * Used to support changing the `account_ref` in the Mod request. When you do this, the QuickBooks UI normally displays a prompt asking whether the change should apply to existing transactions or not. Specifying False basically dismisses this with a “No” answer; specifying True dismisses it with a “Yes” answer and then changes the existing transactions that use the item with that `account_ref`.
   */
  apply_account_ref_to_existing_txns?: boolean;
  /**
   * A descriptive text field.
   */
  desc?: string;
  /**
   * The purchase price or sales price of this item.
   *
   * Choose at most one of: `price`, or `price_percent`.
   */
  price?: number;
  /**
   * The price expressed as a percent. (For example, an auto shop that calculates the cost of labor as a percentage of the cost of parts might have a service item called “Labor” that uses `price_percent` instead of Price.)
   *
   * Choose at most one of: `price`, or `price_percent`.
   */
  price_percent?: number;
}

export interface SalesTaxLineAdd {
  account_ref?: CurrencyRef;
  /**
   * A monetary amount.
   *
   * Choose at most one of: `amount`, or `rate_percent`.
   */
  amount?: number;
  /**
   * Indicates the price of something as a percent.
   *
   * Choose at most one of: `amount`, or `rate_percent`.
   */
  rate_percent?: number;
}

export interface SetCredit {
  /**
   * Amount of a credit that is applied to a customer’s invoice, or amount of a payment that is applied to a particular bill or vendor credit.
   */
  applied_amount: number;
  /**
   * The ID of the credit memo that you are applying to this invoice or bill.
   */
  credit_txn_id: string;
  /**
   * Option to override credit
   */
  override?: boolean;
  txn_line_id?: string;
}

export interface ShipAddress {
  /**
   * The first line of an address.
   */
  addr1?: string;
  /**
   * The second line of an address (if a second line is needed).
   */
  addr2?: string;
  /**
   * The third line of an address (if a third line is needed).
   */
  addr3?: string;
  /**
   * The fourth line of an address (if a fourth line is needed).
   */
  addr4?: string;
  /**
   * The fifth line of an address (if a fifth line is needed).
   */
  addr5?: string;
  /**
   * The city name in an address.
   */
  city?: string;
  /**
   * The country name in an address, or, in returned Host information (HostRet or HostInfo), the country for which this edition of QuickBooks was designed. (Possible values are US, CA, UK, and AU.)
   */
  country?: string;
  /**
   * In a BillAddress or `ship_address` aggregate, the Note field value is written at the bottom of the address in the form in which it appears, such as the invoice form.
   */
  note?: string;
  /**
   * The postal code in an address.
   */
  postal_code?: string;
  /**
   * The state name in an address.
   */
  state?: string;
}

export interface ShippingLineAdd {
  account_ref?: CurrencyRef;
  /**
   * A monetary amount.
   */
  amount: number;
}

export interface Taxability {
  is_tax_applied: boolean;
  payroll_item_tax_ref: ClassRef;
}

/**
 * Give exactly one of: (`from_txn_date`, `to_txn_date`), or `date_macro`.
 */
export interface TxnDateRangeFilter {
  /**
   * `date_macro` filters by transaction date (not last-modified date). Do not combine `date_macro` with `from_modified_date`/`to_modified_date` in the same query filter set.
   */
  date_macro?: "All" | "LastCalendarQuarter" | "LastCalendarQuarterToDate" | "LastCalendarYear" | "LastCalendarYearToDate" | "LastFiscalQuarter" | "LastFiscalQuarterToDate" | "LastFiscalYear" | "LastFiscalYearToDate" | "LastMonth" | "LastMonthToDate" | "LastWeek" | "LastWeekToDate" | "NextCalendarQuarter" | "NextCalendarYear" | "NextFiscalQuarter" | "NextFiscalYear" | "NextFourWeeks" | "NextMonth" | "NextWeek" | "ThisCalendarQuarter" | "ThisCalendarQuarterToDate" | "ThisCalendarYear" | "ThisCalendarYearToDate" | "ThisFiscalQuarter" | "ThisFiscalQuarterToDate" | "ThisFiscalYear" | "ThisFiscalYearToDate" | "ThisMonth" | "ThisMonthToDate" | "ThisWeek" | "ThisWeekToDate" | "Today" | "Yesterday";
  /**
   * Selects transactions created on or after this date. Both `from_txn_date` and `to_txn_date` must be between 01/01/1901 and 12/31/9999.If you omit `from_txn_date`, it will be set to 1970-01-01 (1969-12-31 PST).
   *
   * Format: date.
   */
  from_txn_date?: string;
  /**
   * Selects transactions created on or before this date. Both `to_txn_date` and `from_txn_date` must be between 01/01/1901 and 12/31/9999. If you omit `to_txn_date`, it will be set to 2038-01-19 (2038-01-18 PST).
   *
   * Format: date.
   */
  to_txn_date?: string;
}

/**
 * Give exactly one of: (`from_txn_date`, `to_txn_date`), or `date_macro`.
 */
export interface TxnDateRangeFilterBill {
  /**
   * `date_macro` filters by transaction date (not last-modified date). Do not combine `date_macro` with `from_modified_date`/`to_modified_date` in the same query filter set.
   */
  date_macro?: "All" | "LastCalendarQuarter" | "LastCalendarQuarterToDate" | "LastCalendarYear" | "LastCalendarYearToDate" | "LastFiscalQuarter" | "LastFiscalQuarterToDate" | "LastFiscalYear" | "LastFiscalYearToDate" | "LastMonth" | "LastMonthToDate" | "LastWeek" | "LastWeekToDate" | "NextCalendarQuarter" | "NextCalendarYear" | "NextFiscalQuarter" | "NextFiscalYear" | "NextFourWeeks" | "NextMonth" | "NextWeek" | "ThisCalendarQuarter" | "ThisCalendarQuarterToDate" | "ThisCalendarYear" | "ThisCalendarYearToDate" | "ThisFiscalQuarter" | "ThisFiscalQuarterToDate" | "ThisFiscalYear" | "ThisFiscalYearToDate" | "ThisMonth" | "ThisMonthToDate" | "ThisWeek" | "ThisWeekToDate" | "Today" | "Yesterday";
  /**
   * Selects transactions created on or after this date. Both `from_txn_date` and `to_txn_date` must be between 01/01/1901 and 12/31/9999. If you omit `from_txn_date`, it will be set to 1970-01-01 (1969-12-31 PST).
   *
   * Format: date.
   */
  from_txn_date?: string;
  /**
   * Selects transactions created on or before this date. Both `to_txn_date` and `from_txn_date` must be between 01/01/1901 and 12/31/9999. If you omit `to_txn_date`, it will be set to 2038-01-19 (2038-01-18 PST).
   *
   * Format: date.
   */
  to_txn_date?: string;
}

/**
 * Give exactly one of: (`from_txn_date`, `to_txn_date`), or `date_macro`.
 */
export interface TxnDateRangeFilterPaycheck {
  date_macro?: "All" | "LastCalendarQuarter" | "LastCalendarQuarterToDate" | "LastCalendarYear" | "LastCalendarYearToDate" | "LastFiscalQuarter" | "LastFiscalQuarterToDate" | "LastFiscalYear" | "LastFiscalYearToDate" | "LastMonth" | "LastMonthToDate" | "LastWeek" | "LastWeekToDate" | "NextCalendarQuarter" | "NextCalendarYear" | "NextFiscalQuarter" | "NextFiscalYear" | "NextFourWeeks" | "NextMonth" | "NextWeek" | "ThisCalendarQuarter" | "ThisCalendarQuarterToDate" | "ThisCalendarYear" | "ThisCalendarYearToDate" | "ThisFiscalQuarter" | "ThisFiscalQuarterToDate" | "ThisFiscalYear" | "ThisFiscalYearToDate" | "ThisMonth" | "ThisMonthToDate" | "ThisWeek" | "ThisWeekToDate" | "Today" | "Yesterday";
  /**
   * Format: date.
   */
  from_txn_date?: string;
  /**
   * Format: date.
   */
  to_txn_date?: string;
}

export interface TxnLineDetail {
  /**
   * A monetary amount.
   */
  amount: number;
  txn_line_id: string;
}
