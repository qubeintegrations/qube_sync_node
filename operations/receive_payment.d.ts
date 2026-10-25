// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, CreditCardTxnInfo, CurrencyFilter, CurrencyRef, ModifiedDateRangeFilter, RefNumberFilter, RefNumberRangeFilter, TxnDateRangeFilter, TxnLineDetail } from "./types";

/** QuickBooks receive payment operations: `qube.receivePayment.<action>(connectionId, params, { webhookUrl })`. */
export declare class ReceivePayment {
  constructor(client: Client);
  /**
   * Record payment: `POST /connections/{connection_id}/payments`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `applied_to_txn_add`, `ar_account_ref`, `credit_card_txn_info`, `customer_ref` (required), `def_macro`, `deposit_to_account_ref`, `exchange_rate`, `external_guid`, `include_ret_element`, `is_auto_apply`, `memo`, `payment_method_ref`, `ref_number`, `request_id`, `total_amount`, `txn_date`.
   *
   * Give exactly one of: `is_auto_apply`, or `applied_to_txn_add`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payments/record-payment
   */
  create(connectionId: string, params: ReceivePaymentCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List receive payments: `GET /connections/{connection_id}/receive-payments`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `currency_filter`, `entity_filter`, `include_line_items`, `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/receive-payments/list-receive-payments
   */
  query(connectionId: string, params: ReceivePaymentQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update receive payment: `PUT /connections/{connection_id}/receive-payments`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `applied_to_txn_mod`, `ar_account_ref`, `credit_card_txn_info_mod`, `customer_ref`, `deposit_to_account_ref`, `edit_sequence` (required), `exchange_rate`, `include_ret_element`, `memo`, `payment_method_ref`, `ref_number`, `request_id`, `total_amount`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/receive-payments/update-receive-payment
   */
  update(connectionId: string, params: ReceivePaymentUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `receive_payment.create`: Record payment.
 *
 * Give exactly one of: `is_auto_apply`, or `applied_to_txn_add`.
 */
export interface ReceivePaymentCreateParams {
  applied_to_txn_add?: AppliedToTxnAddReceivePayment[];
  /**
   * `ar_account_ref` points to an Accounts Receivable account. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  ar_account_ref?: CurrencyRef;
  /**
   * Contains data from the credit card transaction used in the payment. This data originates from a previous qbmsXML credit card transaction. The data following the element `credit_card_txn_input_info`” data is the data from the original qbmsXML request. The “`credit_card_txn_result_info`” is the data from the original qbmsXML response.
   */
  credit_card_txn_info?: CreditCardTxnInfo;
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * Refers to the account where these funds will be (or have been) deposited. In a ReceivePaymentAdd request, the default is Undeposited Funds if this isn’t included in the request. In a request, if a `deposit_to_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  deposit_to_account_ref?: CurrencyRef;
  /**
   * `exchange_rate` is the rate from this currency to the company’s home currency at AsOfDate. You can supply a rate when adding transactions, but QuickBooks does not provide rates through the SDK. If your home currency is USD and internet access is available, rates can be downloaded in the QuickBooks UI via Lists > Currency > Activities > Download Latest Exchange Rates.
   */
  exchange_rate?: number;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"ARAccountRef" | "AppliedToTxnRet" | "CreditCardTxnInfo" | "CurrencyRef" | "CustomerRef" | "DataExtRet" | "DepositToAccountRef" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "ListID" | "Memo" | "OwnerID" | "PaymentMethodRef" | "RefNumber" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber" | "UnusedCredits" | "UnusedPayment">;
  /**
   * If `is_auto_apply` is true, QuickBooks applies `total_amount` to any outstanding transaction that exactly matches `total_amount`. If no exact match is found, the payment is applied to the customer job’s outstanding transactions, beginning with the oldest one. If `is_auto_apply` is false, QuickBooks receives the payment but doesn’t apply it to any outstanding transaction.
   */
  is_auto_apply?: boolean;
  /**
   * The beginning of this memo will appear in reports that show details of this receive payment.
   */
  memo?: string;
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
   * Total amount of money received. For ReceivePaymentAdd, the sum of the `payment_amount` amounts (in the `applied_to_txn_add` aggregates that are included) can’t be greater than the `total_amount`, or you will receive an error.
   */
  total_amount?: number;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
}

/**
 * The params of `receive_payment.query`: List receive payments.
 */
export interface ReceivePaymentQueryParams {
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
  include_ret_element?: Array<"ARAccountRef" | "AppliedToTxnRet" | "CreditCardTxnInfo" | "CurrencyRef" | "CustomerRef" | "DataExtRet" | "DepositToAccountRef" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "Memo" | "PaymentMethodRef" | "RefNumber" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber" | "UnusedCredits" | "UnusedPayment">;
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
 * The params of `receive_payment.update`: Update receive payment.
 */
export interface ReceivePaymentUpdateParams {
  applied_to_txn_mod?: AppliedToTxnModReceivePayment[];
  /**
   * `ar_account_ref` points to an Accounts Receivable account. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  ar_account_ref?: CurrencyRef;
  /**
   * Contains data from the credit card transaction used in the payment. This data originates from a previous qbmsXML credit card transaction. The data following the element `credit_card_txn_input_info`” data is the data from the original qbmsXML request. The “`credit_card_txn_result_info`” is the data from the original qbmsXML response.
   */
  credit_card_txn_info_mod?: CreditCardTxnInfoMod;
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref?: CurrencyRef;
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
  include_ret_element?: Array<"ARAccountRef" | "AppliedToTxnRet" | "CreditCardTxnInfo" | "CurrencyRef" | "CustomerRef" | "DataExtRet" | "DepositToAccountRef" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "ListID" | "Memo" | "OwnerID" | "PaymentMethodRef" | "RefNumber" | "TimeCreated" | "TimeModified" | "TotalAmount" | "TotalAmountInHomeCurrency" | "TxnDate" | "TxnID" | "TxnNumber" | "UnusedCredits" | "UnusedPayment">;
  /**
   * The beginning of this memo will appear in reports that show details of this receive payment.
   */
  memo?: string;
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
   * Total amount of money received. For ReceivePaymentAdd, the sum of the `payment_amount` amounts (in the AppliedToTxnAdd aggregates that are included) can’t be greater than the `total_amount`, or you will receive an error.
   */
  total_amount?: number;
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

export interface AppliedToTxnAddReceivePayment {
  /**
   * Refers to the account where this discount is tracked. In a request, if a `discount_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  discount_account_ref?: CurrencyRef;
  /**
   * Reduces the receivable amount.
   */
  discount_amount?: number;
  /**
   * Class reference used in the Discount object.
   */
  discount_class_ref?: CurrencyRef;
  /**
   * Represents the amount assigned to a particular receivable. The sum of all `payment_amount` elements in any given receive payment transaction must not be greater than `total_amount`.
   */
  payment_amount?: number;
  set_credit?: SetCreditReceivePayment[];
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
  txn_line_detail?: TxnLineDetail[];
}

export interface AppliedToTxnModReceivePayment {
  /**
   * Refers to the account where this discount is tracked. In a request, if a `discount_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  discount_account_ref?: CurrencyRef;
  /**
   * Reduces the receivable amount.
   */
  discount_amount?: number;
  /**
   * Class reference used in the Discount object.
   */
  discount_class_ref?: CurrencyRef;
  /**
   * Represents the amount assigned to a particular receivable. The sum of all `payment_amount` elements in any given receive payment transaction must not be greater than `total_amount`.
   */
  payment_amount?: number;
  set_credit?: SetCreditReceivePayment[];
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
}

export interface CreditCardTxnInfoMod {
  /**
   * This contains data originally supplied in the QBMS transaction request. This information block shouldn’t be used in CreditMemo requests for QuickBooks 2007 and new versions. Instead, use the ARRefundCreditCard request.
   */
  credit_card_txn_input_info_mod?: CreditCardTxnInputInfoMod;
  /**
   * This contains data returned in the QBMS transaction response. This information block shouldn’t be used in CreditMemo requests for QuickBooks 2007 and new versions. Instead, use the ARRefundCreditCard request.
   */
  credit_card_txn_result_info_mod?: CreditCardTxnResultInfoMod;
}

export interface CreditCardTxnInputInfoMod {
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
  credit_card_number?: string;
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
  expiration_month?: number;
  /**
   * The year when the credit card expires.
   */
  expiration_year?: number;
  /**
   * The name on the customer’s credit card.
   */
  name_on_card?: string;
  /**
   * Indicates whether this transaction came from a card swipe (tmCardPresent) or not (tmCardNotPresent).
   */
  transaction_mode?: "CardNotPresent" | "CardPresent";
}

export interface CreditCardTxnResultInfoMod {
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
  credit_card_trans_id?: string;
  /**
   * This is the QBMS account number of the merchant who is running the transaction using the customer’s credit card. It is returned from the transaction request and should be stored for subsequent transactions, such as using it in the QB SDK SalesReceiptAdd, ReceivePaymentAdd, ARRefundCreditCard requests to save the transaction data in QuickBooks.
   */
  merchant_account_number?: string;
  /**
   * Internal code needed for the QuickBooks reconciliation feature, if integrating with QuickBooks. This value is returned in the QBMS response to a QBMS transaction request, and must be subsequently supplied by your application in the QB SDK ReceivePaymentAdd or SalesReceiptAdd request.
   */
  payment_grouping_code?: number;
  /**
   * Indicates payment processing status as known by QuickBooks/QBMS integration state. `psCompleted` indicates confirmed success; `psUnknown` indicates status could not be definitively confirmed.
   */
  payment_status?: "Completed" | "Unknown";
  /**
   * This value is returned by QBMS from the transaction request, and is used internally by the QuickBooks/QBMS Recon (reconcile) feature. You should save this value without modification and include it in the QB SDK SalesReceiptAdd or ReceivePaymentAdd requests if you want to save the transaction data in QuickBooks.
   */
  recon_batch_id?: string;
  /**
   * This contains the status code returned in the original QBMS transaction response.
   */
  result_code?: number;
  /**
   * This contains the status message returned in the original QBMS transaction response.
   */
  result_message?: string;
  /**
   * This value is used to support the credit card transaction Reconcile feature within QuickBooks.
   */
  txn_authorization_stamp?: number;
  /**
   * Timestamp indicating the time in which the card processor authorized the transaction.
   *
   * Format: date-time.
   */
  txn_authorization_time?: string;
}

export interface SetCreditReceivePayment {
  /**
   * Amount of a credit that is applied to a customer’s invoice, or amount of a payment that is applied to a particular bill or vendor credit.
   */
  applied_amount: number;
  /**
   * The ID of the credit memo that you are applying to this invoice or bill.
   */
  credit_txn_id: string;
  /**
   * Option to override credit.
   */
  override?: boolean;
  txn_line_id?: string;
}
