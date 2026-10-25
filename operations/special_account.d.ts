// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef } from "./types";

/** QuickBooks special account operations: `qube.specialAccount.<action>(connectionId, params, { webhookUrl })`. */
export declare class SpecialAccount {
  constructor(client: Client);
  /**
   * Create special account: `POST /connections/{connection_id}/special-accounts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `currency_ref`, `include_ret_element`, `request_id`, `special_account_type` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/special-accounts/create-special-account
   */
  create(connectionId: string, params: SpecialAccountCreateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `special_account.create`: Create special account.
 */
export interface SpecialAccountCreateParams {
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
  include_ret_element?: Array<"AccountNumber" | "AccountType" | "Balance" | "BankNumber" | "CashFlowClassification" | "CurrencyRef" | "DataExtRet" | "Desc" | "DetailAccountType" | "EditSequence" | "ExternalGUID" | "FullName" | "IsActive" | "IsTaxAccount" | "LastCheckNumber" | "ListID" | "Name" | "OwnerID" | "ParentRef" | "SalesTaxCodeRef" | "SpecialAccountType" | "Sublevel" | "TaxLineInfoRet" | "TimeCreated" | "TimeModified" | "TotalBalance" | "TxnID" | "TxnNumber">;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * If `special_account_type` returns a value, then QuickBooks automatically created this account when it was needed. Some special accounts can’t be overridden, because QuickBooks uses them exclusively for special purposes.
   */
  special_account_type: "AccountsPayable" | "AccountsReceivable" | "CondenseItemAdjustmentExpenses" | "CostOfGoodsSold" | "DirectDepositLiabilities" | "Estimates" | "ExchangeGainLoss" | "InventoryAssets" | "ItemReceiptAccount" | "OpeningBalanceEquity" | "PayrollExpenses" | "PayrollLiabilities" | "PettyCash" | "PurchaseOrders" | "ReconciliationDifferences" | "RetainedEarnings" | "SalesOrders" | "SalesTaxPayable" | "UncategorizedExpenses" | "UncategorizedIncome" | "UndepositedFunds";
}
