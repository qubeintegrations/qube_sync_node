// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef } from "./types";

/** QuickBooks txn display operations: `qube.txnDisplay.<action>(connectionId, params, { webhookUrl })`. */
export declare class TxnDisplay {
  constructor(client: Client);
  /**
   * Create txn display: `POST /connections/{connection_id}/txn-displays`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `entity_ref`, `request_id`, `txn_display_add_type` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/txn-displays/create-txn-display
   */
  create(connectionId: string, params: TxnDisplayCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update txn display: `PUT /connections/{connection_id}/txn-displays`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `request_id`, `txn_display_mod_type` (required), `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/txn-displays/update-txn-display
   */
  update(connectionId: string, params: TxnDisplayUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `txn_display.create`: Create txn display.
 */
export interface TxnDisplayCreateParams {
  /**
   * A QuickBooks “entity” is a customer, vendor, employee, or person on the QuickBooks “other names” list. Special cases to note: In a BillToPayQuery message, `entity_ref` refers to the vendor name. In JournalCreditLine and JournalDebitLine messages for A/R accounts, `entity_ref` must refer to a customer, or else the transaction won’t be recorded.
   */
  entity_ref?: CurrencyRef;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Specifies the type of QuickBooks transaction for which to open an edit form in the QuickBooks UI. Notice that some transaction types don’t support the entity reference that “prefills” the form because it would make no sense to do this for certain forms.
   */
  txn_display_add_type: "Bill" | "BillPayment" | "BuildAssembly" | "Charge" | "Check" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Deposit" | "Estimate" | "InventoryAdjustment" | "Invoice" | "ItemReceipt" | "JournalEntry" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "VendorCredit";
}

/**
 * The params of `txn_display.update`: Update txn display.
 */
export interface TxnDisplayUpdateParams {
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The type of QuickBooks transaction to open for modification in the QuickBooks UI. (`txn_id` specifies the particular transaction.)
   */
  txn_display_mod_type: "Bill" | "BillPaymentCheck" | "BillPaymentCreditCard" | "BuildAssembly" | "Charge" | "Check" | "CreditCardCharge" | "CreditCardCredit" | "CreditMemo" | "Deposit" | "Estimate" | "InventoryAdjustment" | "Invoice" | "ItemReceipt" | "JournalEntry" | "PurchaseOrder" | "ReceivePayment" | "SalesOrder" | "SalesReceipt" | "SalesTaxPaymentCheck" | "VendorCredit";
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
}
