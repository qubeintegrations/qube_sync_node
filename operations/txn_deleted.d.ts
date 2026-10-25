// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, DeletedDateRangeFilter } from "./types";

/** QuickBooks txn deleted operations: `qube.txnDeleted.<action>(connectionId, params, { webhookUrl })`. */
export declare class TxnDeleted {
  constructor(client: Client);
  /**
   * List txn deleteds: `GET /connections/{connection_id}/txn-deleteds`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `deleted_date_range_filter`, `include_ret_element`, `meta_data`, `request_id`, `txn_del_type` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/txn-deleteds/list-txn-deleteds
   */
  query(connectionId: string, params: TxnDeletedQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `txn_deleted.query`: List txn deleteds.
 */
export interface TxnDeletedQueryParams {
  /**
   * Filters according to delete dates (within the last 90 days).
   */
  deleted_date_range_filter?: DeletedDateRangeFilter;
  include_ret_element?: Array<"RefNumber" | "TimeCreated" | "TimeDeleted" | "TxnDelType" | "TxnID">;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The type of transaction to be deleted.
   */
  txn_del_type: Array<"ARRefundCreditCard" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Deposit" | "Estimate" | "InventoryAdjustment" | "Invoice" | "ItemReceipt" | "JournalEntry" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "TimeTracking" | "TransferInventory" | "VehicleMileage" | "VendorCredit">;
}
