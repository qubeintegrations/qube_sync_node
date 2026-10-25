// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks txn operations: `qube.txn.<action>(connectionId, params, { webhookUrl })`. */
export declare class Txn {
  constructor(client: Client);
  /**
   * Delete txn: `DELETE /connections/{connection_id}/txns`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `request_id`, `txn_del_type` (required), `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/txns/delete-txn
   */
  delete(connectionId: string, params: TxnDeleteParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `txn.delete`: Delete txn.
 */
export interface TxnDeleteParams {
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The type of transaction to be deleted.
   */
  txn_del_type: "ARRefundCreditCard" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Deposit" | "Estimate" | "InventoryAdjustment" | "Invoice" | "ItemReceipt" | "JournalEntry" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "TimeTracking" | "TransferInventory" | "VehicleMileage" | "VendorCredit";
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
}
