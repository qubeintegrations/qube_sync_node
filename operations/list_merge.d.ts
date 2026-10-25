// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks list merge operations: `qube.listMerge.<action>(connectionId, params, { webhookUrl })`. */
export declare class ListMerge {
  constructor(client: Client);
  /**
   * Execute list merge: `POST /connections/{connection_id}/list-merge`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `list_merge_type` (required), `merge_from` (required), `merge_to` (required), `request_id`, `same_ship_addr_ok`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/list-merge/execute-list-merge
   */
  execute(connectionId: string, params: ListMergeExecuteParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `list_merge.execute`: Execute list merge.
 */
export interface ListMergeExecuteParams {
  /**
   * The type of the objects to be merged. Both of the objects must be the same type, for example both must be customers, because you can’t merge a vendor with a customer.
   */
  list_merge_type: "Account" | "Class" | "Customer" | "ItemDiscount" | "ItemGroup" | "ItemInventory" | "ItemNonInventory" | "ItemOtherCharge" | "ItemPayment" | "ItemSalesTax" | "ItemSalesTaxGroup" | "ItemService" | "ItemSubtotal" | "Vendor";
  /**
   * The object to be merged into another object.
   */
  merge_from: MergeFrom;
  /**
   * The object into which you are merging another object.
   */
  merge_to: MergeFrom;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * A new tag (SameshipAddressOk) is added to ListMerge request. If true is supplied in this tag then the merge will go through even if elements have same default shipto address.
   */
  same_ship_addr_ok?: boolean;
}

export interface MergeFrom {
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   */
  list_id: string;
}
