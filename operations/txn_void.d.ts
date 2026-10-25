// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks txn void operations: `qube.txnVoid.<action>(connectionId, params, { webhookUrl })`. */
export declare class TxnVoid {
  constructor(client: Client);
  /**
   * Execute txn void: `POST /connections/{connection_id}/txn-void`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `request_id`, `txn_id` (required), `txn_void_type` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/txn-void/execute-txn-void
   */
  execute(connectionId: string, params: TxnVoidExecuteParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `txn_void.execute`: Execute txn void.
 */
export interface TxnVoidExecuteParams {
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
  /**
   * The type of transaction being voided.
   */
  txn_void_type: "ARRefundCreditCard" | "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "Charge" | "Check" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Deposit" | "InventoryAdjustment" | "Invoice" | "ItemReceipt" | "JournalEntry" | "SalesReceipt" | "VendorCredit";
}
