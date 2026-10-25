// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, BarCodeItemDiscount, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks item group operations: `qube.itemGroup.<action>(connectionId, params, { webhookUrl })`. */
export declare class ItemGroup {
  constructor(client: Client);
  /**
   * Create item group: `POST /connections/{connection_id}/item-groups`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `bar_code`, `external_guid`, `include_ret_element`, `is_active`, `is_print_items_in_group`, `item_desc`, `item_group_line`, `name` (required), `request_id`, `unit_of_measure_set_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-groups/create-item-group
   */
  create(connectionId: string, params: ItemGroupCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List item groups: `GET /connections/{connection_id}/item-groups`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `iterator`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `owner_id`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-groups/list-item-groups
   */
  query(connectionId: string, params: ItemGroupQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update item group: `PUT /connections/{connection_id}/item-groups`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `bar_code`, `clear_items_in_group`, `edit_sequence` (required), `force_uom_change`, `include_ret_element`, `is_active`, `is_print_items_in_group`, `item_desc`, `item_group_line`, `list_id` (required), `name`, `request_id`, `unit_of_measure_set_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-groups/update-item-group
   */
  update(connectionId: string, params: ItemGroupUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `item_group.create`: Create item group.
 */
export interface ItemGroupCreateParams {
  /**
   * Barcode reference information.
   */
  bar_code?: BarCodeItemDiscount;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"BarCodeValue" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "IsActive" | "IsPrintItemsInGroup" | "ItemDesc" | "ItemGroupLine" | "ListID" | "Name" | "OwnerID" | "SpecialItemType" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "UnitOfMeasureSetRef">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * If true, a list of this group’s individual items their amounts will appear on printed forms.
   */
  is_print_items_in_group?: boolean;
  /**
   * The description that will appear on a sales form when the item is used.
   */
  item_desc?: string;
  item_group_line?: ItemGroupLine[];
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The unit of measure set consists of a base unit and 0-n related units.
   */
  unit_of_measure_set_ref?: CurrencyRef;
}

/**
 * The params of `item_group.query`: List item groups.
 */
export interface ItemGroupQueryParams {
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"BarCodeValue" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "IsActive" | "IsPrintItemsInGroup" | "ItemDesc" | "ItemGroupLine" | "ListID" | "Name" | "SpecialItemType" | "TimeCreated" | "TimeModified" | "UnitOfMeasureSetRef">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `full_name` or `list_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_range_filter?: NameRangeFilter;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id?: string[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters results to objects modified on or before this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to end-of-day (23:59:59).
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `item_group.update`: Update item group.
 */
export interface ItemGroupUpdateParams {
  /**
   * Barcode reference information.
   */
  bar_code?: BarCodeItemDiscount;
  /**
   * Set to true to clear all the items in this group.
   *
   * Choose at most one of: `clear_items_in_group`, or `item_group_line`.
   */
  clear_items_in_group?: boolean;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * By Default `force_uom_change` is false. However, in item Mod requests, you need to set the `force_uom_change` field to True if you are changing the UOM set and the base unit of the new set doesn’t match the base unit of the UOM set currently assigned to the item. This does the same thing as the user accepting the warning prompt in the UI.
   */
  force_uom_change?: boolean;
  include_ret_element?: Array<"BarCodeValue" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "IsActive" | "IsPrintItemsInGroup" | "ItemDesc" | "ItemGroupLine" | "ListID" | "Name" | "OwnerID" | "SpecialItemType" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "UnitOfMeasureSetRef">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * If true, a list of this group’s individual items their amounts will appear on printed forms.
   */
  is_print_items_in_group?: boolean;
  /**
   * The description that will appear on a sales form when the item is used.
   */
  item_desc?: string;
  /**
   * Choose at most one of: `clear_items_in_group`, or `item_group_line`.
   */
  item_group_line?: ItemGroupLine[];
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   */
  list_id: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The unit of measure set consists of a base unit and 0-n related units.
   */
  unit_of_measure_set_ref?: CurrencyRef;
}

export interface ItemGroupLine {
  /**
   * `item_ref` may accept all item types or a restricted subset, depending on the request. Examples: PurchaseOrder and Bill do not allow discount or sales-tax items; VehicleMileageAdd requires a service or other-charge item; BillingRateAdd requires a service item. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  item_ref?: CurrencyRef;
  /**
   * On transaction lines, QuickBooks can derive one value from the other two among Quantity, Rate, and Amount. If you supply Quantity and Amount, QuickBooks calculates Rate. If you supply Quantity and Rate, QuickBooks calculates Amount.
   */
  quantity?: number;
  /**
   * In a transaction line item, the name of the unit of measure selected from within the item’s available units. If the company file is enabled only for single unit of measure per item, this must be the base unit!
   */
  unit_of_measure?: string;
}
