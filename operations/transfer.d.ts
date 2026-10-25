// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef, ModifiedDateRangeFilter, TxnDateRangeFilter } from "./types";

/** QuickBooks transfer operations: `qube.transfer.<action>(connectionId, params, { webhookUrl })`. */
export declare class Transfer {
  constructor(client: Client);
  /**
   * Create transfer: `POST /connections/{connection_id}/transfers`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `amount`, `class_ref`, `def_macro`, `include_ret_element`, `memo`, `request_id`, `transfer_from_account_ref`, `transfer_to_account_ref`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/transfers/create-transfer
   */
  create(connectionId: string, params: TransferCreateParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List transfers: `GET /connections/{connection_id}/transfers`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/transfers/list-transfers
   */
  query(connectionId: string, params: TransferQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update transfer: `PUT /connections/{connection_id}/transfers`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `amount`, `class_ref`, `edit_sequence` (required), `include_ret_element`, `memo`, `request_id`, `transfer_from_account_ref`, `transfer_to_account_ref`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/transfers/update-transfer
   */
  update(connectionId: string, params: TransferUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `transfer.create`: Create transfer.
 */
export interface TransferCreateParams {
  /**
   * A monetary amount.
   */
  amount?: number;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or TxnLineID so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  include_ret_element?: Array<"Amount" | "ClassRef" | "EditSequence" | "FromAccountBalance" | "Memo" | "TimeCreated" | "TimeModified" | "ToAccountBalance" | "TransferFromAccountRef" | "TransferToAccountRef" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Additional information.
   */
  memo?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Account that money will be transferred from.
   */
  transfer_from_account_ref?: CurrencyRef;
  /**
   * Account that money will be transferred to.
   */
  transfer_to_account_ref?: CurrencyRef;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
}

/**
 * The params of `transfer.query`: List transfers.
 */
export interface TransferQueryParams {
  include_ret_element?: Array<"Amount" | "ClassRef" | "EditSequence" | "FromAccountBalance" | "Memo" | "TimeCreated" | "TimeModified" | "ToAccountBalance" | "TransferFromAccountRef" | "TransferToAccountRef" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `txn_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  modified_date_range_filter?: ModifiedDateRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters according to the original transaction dates.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_date_range_filter?: TxnDateRangeFilter;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_id?: string[];
}

/**
 * The params of `transfer.update`: Update transfer.
 */
export interface TransferUpdateParams {
  /**
   * A monetary amount.
   */
  amount?: number;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  include_ret_element?: Array<"Amount" | "ClassRef" | "EditSequence" | "FromAccountBalance" | "Memo" | "TimeCreated" | "TimeModified" | "ToAccountBalance" | "TransferFromAccountRef" | "TransferToAccountRef" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Additional information.
   */
  memo?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Account that money will be transferred from.
   */
  transfer_from_account_ref?: CurrencyRef;
  /**
   * Account that money will be transferred to.
   */
  transfer_to_account_ref?: CurrencyRef;
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
