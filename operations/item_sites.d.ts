// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, CurrencyFilter } from "./types";

/** QuickBooks item sites operations: `qube.itemSites.<action>(connectionId, params, { webhookUrl })`. */
export declare class ItemSites {
  constructor(client: Client);
  /**
   * List item sites: `GET /connections/{connection_id}/item-sites`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `include_ret_element`, `item_site_filter`, `item_type_filter`, `iterator`, `list_id`, `max_returned`, `meta_data`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-sites/list-item-sites
   */
  query(connectionId: string, params: ItemSitesQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `item_sites.query`: List item sites.
 */
export interface ItemSitesQueryParams {
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  include_ret_element?: Array<"AssemblyBuildPoint" | "EditSequence" | "InventorySiteLocationRef" | "InventorySiteRef" | "ItemInventoryAssemblyRef" | "ItemInventoryRef" | "ListID" | "QuantityOnHand" | "QuantityOnPendingTransfers" | "QuantityOnPurchaseOrders" | "QuantityOnSalesOrders" | "QuantityRequiredByPendingBuildTxns" | "QuantityToBeBuiltByPendingBuildTxns" | "ReorderLevel" | "TimeCreated" | "TimeModified">;
  /**
   * Allows you to report on Item Sites.
   *
   * Choose at most one of: `list_id`, or the set (`item_site_filter`, `item_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  item_site_filter?: ItemSiteFilter;
  /**
   * Allows you to report on a specific item type.
   *
   * Choose at most one of: `list_id`, or the set (`item_site_filter`, `item_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  item_type_filter?: "AllExceptFixedAsset" | "Assembly" | "Discount" | "FixedAsset" | "Inventory" | "InventoryAndAssembly" | "NonInventory" | "OtherCharge" | "Payment" | "Sales" | "SalesTax" | "Service";
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer).
   */
  iterator?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or the set (`item_site_filter`, `item_type_filter`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Minimum 1.
   */
  max_returned?: number;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

export interface ItemSiteFilter {
  /**
   * Filters according to the item name or ID. You can use an ItemQuery request to get information about all the items that are set up in the QuickBooks file. “Items” are line items used for fast entry on sales and purchase forms. They include services and goods that a business buys and sells, as well as special items that perform calculations–for example, subtotal, discount, and sales-tax items.
   */
  item_filter?: AccountFilter;
  /**
   * Allows you to report on Sites.
   */
  site_filter?: CurrencyFilter;
}
