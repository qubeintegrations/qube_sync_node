// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, CurrencyRef, ModifiedDateRangeFilter, RefNumberFilter, RefNumberRangeFilter, TxnDateRangeFilter } from "./types";

/** QuickBooks build assembly operations: `qube.buildAssembly.<action>(connectionId, params, { webhookUrl })`. */
export declare class BuildAssembly {
  constructor(client: Client);
  /**
   * Create build assembly: `POST /connections/{connection_id}/build-assemblies`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `def_macro`, `external_guid`, `include_ret_element`, `inventory_site_location_ref`, `inventory_site_ref`, `item_inventory_assembly_ref` (required), `lot_number`, `mark_pending_if_required`, `memo`, `quantity_to_build` (required), `ref_number`, `request_id`, `serial_number`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/build-assemblies/create-build-assembly
   */
  create(connectionId: string, params: BuildAssemblyCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List build assemblies: `GET /connections/{connection_id}/build-assemblies`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `include_component_line_items`, `include_ret_element`, `item_filter`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `pending_status`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/build-assemblies/list-build-assemblies
   */
  query(connectionId: string, params: BuildAssemblyQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update build assembly: `PUT /connections/{connection_id}/build-assemblies`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `edit_sequence` (required), `include_ret_element`, `inventory_site_location_ref`, `inventory_site_ref`, `lot_number`, `mark_pending_if_required`, `memo`, `quantity_to_build`, `ref_number`, `remove_pending`, `request_id`, `serial_number`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/build-assemblies/update-build-assembly
   */
  update(connectionId: string, params: BuildAssemblyUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `build_assembly.create`: Create build assembly.
 */
export interface BuildAssemblyCreateParams {
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or TxnLineID so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"ComponentItemLineRet" | "DataExtRet" | "EditSequence" | "ExpirationDateForSerialLotNumber" | "ExternalGUID" | "InventorySiteLocationRef" | "InventorySiteRef" | "IsPending" | "ItemInventoryAssemblyRef" | "ListID" | "LotNumber" | "Memo" | "OwnerID" | "QuantityCanBuild" | "QuantityOnHand" | "QuantityOnSalesOrder" | "QuantityToBuild" | "RefNumber" | "SerialNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Location within the Inventory Site
   */
  inventory_site_location_ref?: CurrencyRef;
  /**
   * Site where inventory is located.
   */
  inventory_site_ref?: CurrencyRef;
  /**
   * An inventory assembly item is one that is assembled or manufactured from inventory items. The items and/or assemblies that make up the assembly are called components. For Premier, an assembly can have a maximum of 100 components. For Enterprise, the maximum is 500 components.
   */
  item_inventory_assembly_ref: CurrencyRef;
  /**
   * The lot number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  lot_number?: string;
  /**
   * Allows the build assembly to be marked pending if there are insufficient quantities to complete the build assembly.
   */
  mark_pending_if_required?: boolean;
  /**
   * Additional information.
   */
  memo?: string;
  /**
   * Specifies the number of assemblies to be built. The transaction will fail if the number specified here exceeds the number of on-hand components.
   */
  quantity_to_build: number;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The serial number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  serial_number?: string;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
}

/**
 * The params of `build_assembly.query`: List build assemblies.
 */
export interface BuildAssemblyQueryParams {
  /**
   * Specify “true” if component line items for each returned transaction are to be included in the returned data. Specify “false” if the line items aren’t be returned.
   */
  include_component_line_items?: boolean;
  include_ret_element?: Array<"ComponentItemLineRet" | "DataExtRet" | "EditSequence" | "ExpirationDateForSerialLotNumber" | "ExternalGUID" | "InventorySiteLocationRef" | "InventorySiteRef" | "IsPending" | "ItemInventoryAssemblyRef" | "LotNumber" | "Memo" | "QuantityCanBuild" | "QuantityOnHand" | "QuantityOnSalesOrder" | "QuantityToBuild" | "RefNumber" | "SerialNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Filters according to the item name or ID. You can use an ItemQuery request to get information about all the items that are set up in the QuickBooks file. “Items” are line items used for fast entry on sales and purchase forms. They include services and goods that a business buys and sells, as well as special items that perform calculations–for example, subtotal, discount, and sales-tax items.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`item_filter`, `max_returned`, `modified_date_range_filter`, `pending_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  item_filter?: AccountFilter;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `ref_number`, `ref_number_case_sensitive` or `txn_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`item_filter`, `max_returned`, `modified_date_range_filter`, `pending_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Filters according to the dates when transactions were last modified. The `modified_date_range_filter` aggregate isn’t required to contain any elements, but if it is empty, we recommend that you leave it out altogether.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`item_filter`, `max_returned`, `modified_date_range_filter`, `pending_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  modified_date_range_filter?: ModifiedDateRangeFilter;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id?: string[];
  /**
   * Specifies whether the transaction is pending (posted) or not.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`item_filter`, `max_returned`, `modified_date_range_filter`, `pending_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  pending_status?: "All" | "NotPendingOnly" | "PendingOnly";
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`item_filter`, `max_returned`, `modified_date_range_filter`, `pending_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number?: string[];
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`item_filter`, `max_returned`, `modified_date_range_filter`, `pending_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_case_sensitive?: string[];
  /**
   * Filters by `ref_number` range. Numeric-only bounds are compared numerically; otherwise comparison is lexicographic.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`item_filter`, `max_returned`, `modified_date_range_filter`, `pending_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_filter?: RefNumberFilter;
  /**
   * Filters by `ref_number` range. Numeric-only bounds are compared numerically; otherwise comparison is lexicographic.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`item_filter`, `max_returned`, `modified_date_range_filter`, `pending_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_range_filter?: RefNumberRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters according to the original transaction dates.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`item_filter`, `max_returned`, `modified_date_range_filter`, `pending_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_date_range_filter?: TxnDateRangeFilter;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`item_filter`, `max_returned`, `modified_date_range_filter`, `pending_status`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_id?: string[];
}

/**
 * The params of `build_assembly.update`: Update build assembly.
 */
export interface BuildAssemblyUpdateParams {
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  include_ret_element?: Array<"ComponentItemLineRet" | "DataExtRet" | "EditSequence" | "ExpirationDateForSerialLotNumber" | "ExternalGUID" | "InventorySiteLocationRef" | "InventorySiteRef" | "IsPending" | "ItemInventoryAssemblyRef" | "ListID" | "LotNumber" | "Memo" | "OwnerID" | "QuantityCanBuild" | "QuantityOnHand" | "QuantityOnSalesOrder" | "QuantityToBuild" | "RefNumber" | "SerialNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Location within the Inventory Site
   */
  inventory_site_location_ref?: CurrencyRef;
  /**
   * Site where inventory is located.
   */
  inventory_site_ref?: CurrencyRef;
  /**
   * The lot number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  lot_number?: string;
  /**
   * Allows the build assembly to be marked pending if there are insufficient quantities to complete the build assembly.
   */
  mark_pending_if_required?: boolean;
  /**
   * Additional information.
   */
  memo?: string;
  /**
   * Specifies the number of assemblies to be built. The transaction will fail if the number specified here exceeds the number of on-hand components.
   */
  quantity_to_build?: number;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Changes the transaction’s pending status from Pending to non pending. In BuildAssembly transactions, this effectively does the build transaction. Hence, removing the Pending status will fail if there aren’t enough components on hand for the build.
   */
  remove_pending?: boolean;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The serial number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  serial_number?: string;
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
