// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef } from "./types";

/** QuickBooks data ext operations: `qube.dataExt.<action>(connectionId, params, { webhookUrl })`. */
export declare class DataExt {
  constructor(client: Client);
  /**
   * Create data ext: `POST /connections/{connection_id}/data-exts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `data_ext_name` (required), `data_ext_value` (required), `list_data_ext_type`, `list_obj_ref`, `other_data_ext_type`, `owner_id` (required), `request_id`, `txn_data_ext_type`, `txn_id`, `txn_line_id`.
   *
   * Give exactly one of: (`list_data_ext_type`, `list_obj_ref`), or (`txn_data_ext_type`, `txn_id`, `txn_line_id`), or `other_data_ext_type`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/data-exts/create-data-ext
   */
  create(connectionId: string, params: DataExtCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Delete data ext: `DELETE /connections/{connection_id}/data-exts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `data_ext_del` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/data-exts/delete-data-ext
   */
  delete(connectionId: string, params: DataExtDeleteParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update data ext: `PUT /connections/{connection_id}/data-exts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `data_ext_name` (required), `data_ext_value` (required), `list_data_ext_type`, `list_obj_ref`, `other_data_ext_type`, `owner_id` (required), `request_id`, `txn_data_ext_type`, `txn_id`, `txn_line_id`.
   *
   * Give exactly one of: (`list_data_ext_type`, `list_obj_ref`), or (`txn_data_ext_type`, `txn_id`, `txn_line_id`), or `other_data_ext_type`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/data-exts/update-data-ext
   */
  update(connectionId: string, params: DataExtUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `data_ext.create`: Create data ext.
 *
 * Give exactly one of: (`list_data_ext_type`, `list_obj_ref`), or (`txn_data_ext_type`, `txn_id`, `txn_line_id`), or `other_data_ext_type`.
 */
export interface DataExtCreateParams {
  /**
   * The name of the data extension. If this is a custom field, `data_ext_name` will be visible as a label in the QuickBooks user interface. Also because `owner_id` and `data_ext_name` together make the data extension unique, and because custom fields all have the same `owner_id` of zero, the `data_ext_name` must be a unique value among existing custom fields.
   */
  data_ext_name: string;
  /**
   * The data in this field. The maximum length of `data_ext_value` will depend on the `data_ext_type` of this data extension. For example, if `data_ext_type` is STR255TYPE, the maximum length of `data_ext_value` is 255 characters. If `data_ext_type` is STR1024TYPE, the maximum size of `data_ext_value` is 1KB.
   */
  data_ext_value: string;
  /**
   * The type of list object (e.g. Customer) that this data extension is attached to.
   */
  list_data_ext_type?: "Account" | "Customer" | "Employee" | "Item" | "OtherName" | "Vendor";
  /**
   * Refers to a list object. In a DataExtAdd request, the list object ref must be the same type as the type specified in `list_data_ext_type`. If a `list_obj_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  list_obj_ref?: CurrencyRef;
  /**
   * Not supported.
   */
  other_data_ext_type?: "Company";
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The type of transaction that the data extension belongs to.
   */
  txn_data_ext_type?: "ARRefundCreditCard" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Deposit" | "Estimate" | "InventoryAdjustment" | "Invoice" | "ItemReceipt" | "JournalEntry" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "VendorCredit";
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id?: string;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id?: string;
}

/**
 * The params of `data_ext.delete`: Delete data ext.
 */
export interface DataExtDeleteParams {
  /**
   * DataExt The DataExtAdd request writes data to the specified data extension for the specified object. Before you can use a DataExtAdd message to populate a data-extension field with data, the field must be defined, either through the SDK via a DataExtDefAdd request or via the QuickBooks UI by the interactive user.
   */
  data_ext_del: DataExtDel;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `data_ext.update`: Update data ext.
 *
 * Give exactly one of: (`list_data_ext_type`, `list_obj_ref`), or (`txn_data_ext_type`, `txn_id`, `txn_line_id`), or `other_data_ext_type`.
 */
export interface DataExtUpdateParams {
  /**
   * The name of the data extension. If this is a custom field, `data_ext_name` will be visible as a label in the QuickBooks user interface. Also because `owner_id` and `data_ext_name` together make the data extension unique, and because custom fields all have the same `owner_id` of zero, the `data_ext_name` must be a unique value among existing custom fields.
   */
  data_ext_name: string;
  /**
   * The data in this field. The maximum length of `data_ext_value` will depend on the `data_ext_type` of this data extension. For example, if `data_ext_type` is STR255TYPE, the maximum length of `data_ext_value` is 255 characters. If `data_ext_type` is STR1024TYPE, the maximum size of `data_ext_value` is 1KB.
   */
  data_ext_value: string;
  /**
   * The type of list object (e.g. Customer) that this data extension is attached to.
   */
  list_data_ext_type?: "Account" | "Customer" | "Employee" | "Item" | "OtherName" | "Vendor";
  /**
   * Refers to a list object. In a DataExtAdd request, the list object ref must be the same type as the type specified in `list_data_ext_type`. If a `list_obj_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  list_obj_ref?: CurrencyRef;
  /**
   * Not supported.
   */
  other_data_ext_type?: "Company";
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The type of transaction that the data extension belongs to.
   */
  txn_data_ext_type?: "ARRefundCreditCard" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Deposit" | "Estimate" | "InventoryAdjustment" | "Invoice" | "ItemReceipt" | "JournalEntry" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "VendorCredit";
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id?: string;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id?: string;
}

/**
 * Give exactly one of: (`list_data_ext_type`, `list_obj_ref`), or (`txn_data_ext_type`, `txn_id`, `txn_line_id`), or `other_data_ext_type`.
 */
export interface DataExtDel {
  /**
   * The name of the data extension. If this is a custom field, `data_ext_name` will be visible as a label in the QuickBooks user interface. Also because `owner_id` and `data_ext_name` together make the data extension unique, and because custom fields all have the same `owner_id` of zero, the `data_ext_name` must be a unique value among existing custom fields.
   */
  data_ext_name: string;
  /**
   * The type of list object (e.g. Customer) that this data extension is attached to.
   */
  list_data_ext_type?: "Account" | "Customer" | "Employee" | "Item" | "OtherName" | "Vendor";
  /**
   * Refers to a list object. In a DataExtAdd request, the list object ref must be the same type as the type specified in `list_data_ext_type`. If a `list_obj_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  list_obj_ref?: CurrencyRef;
  /**
   * Not supported.
   */
  other_data_ext_type?: "Company";
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id: string;
  /**
   * The type of transaction that the data extension belongs to.
   */
  txn_data_ext_type?: "ARRefundCreditCard" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Deposit" | "Estimate" | "InventoryAdjustment" | "Invoice" | "ItemReceipt" | "JournalEntry" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "VendorCredit";
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id?: string;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id?: string;
}
