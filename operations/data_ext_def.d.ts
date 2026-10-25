// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks data ext def operations: `qube.dataExtDef.<action>(connectionId, params, { webhookUrl })`. */
export declare class DataExtDef {
  constructor(client: Client);
  /**
   * Create data ext def: `POST /connections/{connection_id}/data-ext-defs`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `assign_to_object`, `data_ext_format_string`, `data_ext_list_require`, `data_ext_name` (required), `data_ext_txn_require`, `data_ext_type` (required), `include_ret_element`, `owner_id` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/data-ext-defs/create-data-ext-def
   */
  create(connectionId: string, params: DataExtDefCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Delete data ext def: `DELETE /connections/{connection_id}/data-ext-defs`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `data_ext_name` (required), `owner_id` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/data-ext-defs/delete-data-ext-def
   */
  delete(connectionId: string, params: DataExtDefDeleteParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List data ext defs: `GET /connections/{connection_id}/data-ext-defs`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `assign_to_object`, `include_ret_element`, `meta_data`, `owner_id`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/data-ext-defs/list-data-ext-defs
   */
  query(connectionId: string, params: DataExtDefQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update data ext def: `PUT /connections/{connection_id}/data-ext-defs`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `assign_to_object`, `data_ext_format_string`, `data_ext_list_require`, `data_ext_name` (required), `data_ext_new_name`, `data_ext_txn_require`, `include_ret_element`, `owner_id` (required), `remove_from_object`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/data-ext-defs/update-data-ext-def
   */
  update(connectionId: string, params: DataExtDefUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `data_ext_def.create`: Create data ext def.
 */
export interface DataExtDefCreateParams {
  assign_to_object?: Array<"ARRefundCreditCard" | "Account" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "Company" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Customer" | "Deposit" | "Employee" | "Estimate" | "InventoryAdjustment" | "Invoice" | "Item" | "ItemReceipt" | "JournalEntry" | "OtherName" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "Vendor" | "VendorCredit">;
  /**
   * The string format required for the data extension.
   */
  data_ext_format_string?: string;
  /**
   * If `data_ext_list_require` is true, this data extension field is required to be entered in lists. The default value is false.
   */
  data_ext_list_require?: boolean;
  /**
   * The name of the data extension. If this is a custom field, `data_ext_name` will be visible as a label in the QuickBooks user interface. Also because `owner_id` and `data_ext_name` together make the data extension unique, and because custom fields all have the same `owner_id` of zero, the `data_ext_name` must be a unique value among existing custom fields.
   */
  data_ext_name: string;
  /**
   * If `data_ext_txn_require` is true, this data extension field is required to be entered in transaction. The default value is false.
   */
  data_ext_txn_require?: boolean;
  /**
   * The field’s data type, which corresponds to a qbXML data type. In an IDataExtDefAdd request object, if this is a custom field, `data_ext_type` must be detSTR255TYPE.
   */
  data_ext_type: "AMTTYPE" | "DATETIMETYPE" | "INTTYPE" | "PERCENTTYPE" | "PRICETYPE" | "QUANTYPE" | "STR1024TYPE" | "STR255TYPE";
  include_ret_element?: Array<"AssignToObject" | "DataExtFormatString" | "DataExtID" | "DataExtListRequire" | "DataExtName" | "DataExtTxnRequire" | "DataExtType" | "EditSequence" | "ExternalGUID" | "ListID" | "OwnerID" | "TxnID" | "TxnNumber">;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `data_ext_def.delete`: Delete data ext def.
 */
export interface DataExtDefDeleteParams {
  /**
   * The name of the data extension. If this is a custom field, `data_ext_name` will be visible as a label in the QuickBooks user interface. Also because `owner_id` and `data_ext_name` together make the data extension unique, and because custom fields all have the same `owner_id` of zero, the `data_ext_name` must be a unique value among existing custom fields.
   */
  data_ext_name: string;
  /**
   * `owner_id` identifies the extension owner. `owner_id` 0 means a public custom field visible in the QuickBooks UI. A GUID means a private app extension that is not shown in the UI. `owner_id` matching is case-insensitive. To share private extensions across apps, both apps must use the same `owner_id` and `data_ext_name`.
   */
  owner_id: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `data_ext_def.query`: List data ext defs.
 */
export interface DataExtDefQueryParams {
  /**
   * Choose at most one of: `owner_id`, or `assign_to_object`.
   */
  assign_to_object?: Array<"ARRefundCreditCard" | "Account" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "Company" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Customer" | "Deposit" | "Employee" | "Estimate" | "InventoryAdjustment" | "Invoice" | "Item" | "ItemReceipt" | "JournalEntry" | "OtherName" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "Vendor" | "VendorCredit">;
  include_ret_element?: Array<"AssignToObject" | "DataExtFormatString" | "DataExtID" | "DataExtListRequire" | "DataExtName" | "DataExtTxnRequire" | "DataExtType" | "OwnerID">;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   *
   * Choose at most one of: `owner_id`, or `assign_to_object`.
   */
  owner_id?: string[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `data_ext_def.update`: Update data ext def.
 */
export interface DataExtDefUpdateParams {
  assign_to_object?: Array<"ARRefundCreditCard" | "Account" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "Company" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Customer" | "Deposit" | "Employee" | "Estimate" | "InventoryAdjustment" | "Invoice" | "Item" | "ItemReceipt" | "JournalEntry" | "OtherName" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "Vendor" | "VendorCredit">;
  /**
   * The string format required for the data extension.
   */
  data_ext_format_string?: string;
  /**
   * If `data_ext_list_require` is true, this data extension field is required to be entered in lists. The default value is false.
   */
  data_ext_list_require?: boolean;
  /**
   * The name of the data extension. If this is a custom field, `data_ext_name` will be visible as a label in the QuickBooks user interface. Also because `owner_id` and `data_ext_name` together make the data extension unique, and because custom fields all have the same `owner_id` of zero, the `data_ext_name` must be a unique value among existing custom fields.
   */
  data_ext_name: string;
  /**
   * The new name for this field. Note that in the case of custom fields, `data_ext_new_name` can run into name conflicts, because the name space of custom fields (data extensions with an `owner_id` of 0) is shared by all applications.
   */
  data_ext_new_name?: string;
  /**
   * If `data_ext_txn_require` is true, this data extension field is required to be entered in transaction. The default value is false.
   */
  data_ext_txn_require?: boolean;
  include_ret_element?: Array<"AssignToObject" | "DataExtFormatString" | "DataExtID" | "DataExtListRequire" | "DataExtName" | "DataExtTxnRequire" | "DataExtType" | "EditSequence" | "ExternalGUID" | "ListID" | "OwnerID" | "TxnID" | "TxnNumber">;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id: string;
  remove_from_object?: Array<"ARRefundCreditCard" | "Account" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "Company" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Customer" | "Deposit" | "Employee" | "Estimate" | "InventoryAdjustment" | "Invoice" | "Item" | "ItemReceipt" | "JournalEntry" | "OtherName" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "Vendor" | "VendorCredit">;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
