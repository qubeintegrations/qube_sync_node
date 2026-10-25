// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, CurrencyRef, ModifiedDateRangeFilter, RefNumberFilter, RefNumberRangeFilter, TxnDateRangeFilter } from "./types";

/** QuickBooks inventory adjustment operations: `qube.inventoryAdjustment.<action>(connectionId, params, { webhookUrl })`. */
export declare class InventoryAdjustment {
  constructor(client: Client);
  /**
   * Create inventory adjustment: `POST /connections/{connection_id}/inventory-adjustments`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_ref` (required), `class_ref`, `customer_ref`, `def_macro`, `external_guid`, `include_ret_element`, `inventory_adjustment_line_add` (required), `inventory_site_ref`, `memo`, `ref_number`, `request_id`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/inventory-adjustments/create-inventory-adjustment
   */
  create(connectionId: string, params: InventoryAdjustmentCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List inventory adjustments: `GET /connections/{connection_id}/inventory-adjustments`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `account_filter`, `entity_filter`, `include_line_items`, `include_ret_element`, `item_filter`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `owner_id`, `ref_number`, `ref_number_case_sensitive`, `ref_number_filter`, `ref_number_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/inventory-adjustments/list-inventory-adjustments
   */
  query(connectionId: string, params: InventoryAdjustmentQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update inventory adjustment: `PUT /connections/{connection_id}/inventory-adjustments`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_ref`, `class_ref`, `customer_ref`, `edit_sequence` (required), `include_ret_element`, `inventory_adjustment_line_mod`, `inventory_site_ref`, `memo`, `ref_number`, `request_id`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/inventory-adjustments/update-inventory-adjustment
   */
  update(connectionId: string, params: InventoryAdjustmentUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `inventory_adjustment.create`: Create inventory adjustment.
 */
export interface InventoryAdjustmentCreateParams {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref: CurrencyRef;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref?: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or `txn_line_id` so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"AccountRef" | "ClassRef" | "CustomerRef" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "InventoryAdjustmentLineRet" | "InventorySiteRef" | "ListID" | "Memo" | "OwnerID" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  inventory_adjustment_line_add: InventoryAdjustmentLineAdd[];
  /**
   * Site where inventory is located.
   */
  inventory_site_ref?: CurrencyRef;
  /**
   * Additional information.
   */
  memo?: string;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
}

/**
 * The params of `inventory_adjustment.query`: List inventory adjustments.
 */
export interface InventoryAdjustmentQueryParams {
  /**
   * Filters according to the account name or `list_id`. If the “Use account numbers” preference is enabled in the QuickBooks company file, you can specify an account number (instead of an account name) for `full_name` and get the account you’re looking for. But if numbers have been used as account names, confusion could arise.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  account_filter?: AccountFilter;
  /**
   * An entity refers to a person on the QuickBooks Customer list, Vendor list, Employee list, or Other Names list. You can use an EntityQuery request to get information about all the entities that are set up in the QuickBooks file. In an ARRefundCreditCard query, this must be a customer/customer job.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  entity_filter?: AccountFilter;
  /**
   * This filter allows you to omit line items from a query response to get a smaller result. The default value is false, so line items are omitted by default. Set `include_line_items` to true to include line items in the response if you don’t mind getting a larger result.
   */
  include_line_items?: boolean;
  include_ret_element?: Array<"AccountRef" | "ClassRef" | "CustomerRef" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "InventoryAdjustmentLineRet" | "InventorySiteRef" | "Memo" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Filters according to the item name or ID. You can use an ItemQuery request to get information about all the items that are set up in the QuickBooks file. “Items” are line items used for fast entry on sales and purchase forms. They include services and goods that a business buys and sells, as well as special items that perform calculations–for example, subtotal, discount, and sales-tax items.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  item_filter?: AccountFilter;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records (25 with `include_line_items`); send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `ref_number`, `ref_number_case_sensitive` or `txn_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  modified_date_range_filter?: ModifiedDateRangeFilter;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id?: string[];
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number?: string[];
  /**
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_case_sensitive?: string[];
  /**
   * Filters by `ref_number` range. Numeric-only bounds are compared numerically; otherwise comparison is lexicographic.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_filter?: RefNumberFilter;
  /**
   * Filters by `ref_number` range. Numeric-only bounds are compared numerically; otherwise comparison is lexicographic.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  ref_number_range_filter?: RefNumberRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters according to the original transaction dates.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_date_range_filter?: TxnDateRangeFilter;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   *
   * Choose at most one of: `txn_id`, or `ref_number`, or `ref_number_case_sensitive`, or the set (`account_filter`, `entity_filter`, `item_filter`, `max_returned`, `modified_date_range_filter`, `ref_number_filter`, `ref_number_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_id?: string[];
}

/**
 * The params of `inventory_adjustment.update`: Update inventory adjustment.
 */
export interface InventoryAdjustmentUpdateParams {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref?: CurrencyRef;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref?: CurrencyRef;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  include_ret_element?: Array<"AccountRef" | "ClassRef" | "CustomerRef" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "InventoryAdjustmentLineRet" | "InventorySiteRef" | "ListID" | "Memo" | "OwnerID" | "RefNumber" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  inventory_adjustment_line_mod?: InventoryAdjustmentLineMod[];
  /**
   * Site where inventory is located.
   */
  inventory_site_ref?: CurrencyRef;
  /**
   * Additional information.
   */
  memo?: string;
  /**
   * `ref_number` is a user-managed transaction reference (for example, a check number). It can be edited and is not guaranteed to be globally unique. Some transaction types auto-populate `ref_number` when omitted, based on QuickBooks preferences and numbering state.
   */
  ref_number?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
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

export interface InventoryAdjustmentLineAdd {
  /**
   * `item_ref` may accept all item types or a restricted subset, depending on the request. Examples: PurchaseOrder and Bill do not allow discount or sales-tax items; VehicleMileageAdd requires a service or other-charge item; BillingRateAdd requires a service item. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  item_ref: CurrencyRef;
  /**
   * Amount to adjust lot number.
   *
   * Choose exactly one of: `quantity_adjustment`, or `value_adjustment`, or `serial_number_adjustment`, or `lot_number_adjustment`.
   */
  lot_number_adjustment?: LotNumberAdjustment;
  /**
   * Adjusts the inventory quantity either by setting a new quantity or by adjusting the current quantity up or down.
   *
   * Choose exactly one of: `quantity_adjustment`, or `value_adjustment`, or `serial_number_adjustment`, or `lot_number_adjustment`.
   */
  quantity_adjustment?: QuantityAdjustment;
  /**
   * Serial number that will be adjusted in inventory.
   *
   * Choose exactly one of: `quantity_adjustment`, or `value_adjustment`, or `serial_number_adjustment`, or `lot_number_adjustment`.
   */
  serial_number_adjustment?: SerialNumberAdjustment;
  /**
   * Adjusts the total value of these inventory items by setting a new monetary value, and optionally by setting a new quantity.
   *
   * Choose exactly one of: `quantity_adjustment`, or `value_adjustment`, or `serial_number_adjustment`, or `lot_number_adjustment`.
   */
  value_adjustment?: ValueAdjustment;
}

export interface InventoryAdjustmentLineMod {
  /**
   * Amount to adjust count.
   *
   * Choose exactly one of: `serial_number`, or the set (`count_adjustment`, `lot_number`). Members of a set combine with each other, not with the other choices.
   */
  count_adjustment?: number;
  /**
   * Location within the Inventory Site.
   */
  inventory_site_location_ref?: CurrencyRef;
  /**
   * `item_ref` may accept all item types or a restricted subset, depending on the request. Examples: PurchaseOrder and Bill do not allow discount or sales-tax items; VehicleMileageAdd requires a service or other-charge item; BillingRateAdd requires a service item. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  item_ref?: CurrencyRef;
  /**
   * The lot number of the asset.
   *
   * Choose exactly one of: `serial_number`, or the set (`count_adjustment`, `lot_number`). Members of a set combine with each other, not with the other choices.
   */
  lot_number?: string;
  /**
   * Either a positive or negative number that shows the change in quantity for this inventory item.
   */
  quantity_difference?: number;
  /**
   * The serial number of the asset.
   *
   * Choose exactly one of: `serial_number`, or the set (`count_adjustment`, `lot_number`). Members of a set combine with each other, not with the other choices.
   */
  serial_number?: string;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id: string;
  /**
   * Either a positive or negative number that shows a change in the total value of the entire stock of this inventory item.
   */
  value_difference?: number;
}

export interface LotNumberAdjustment {
  /**
   * Amount to adjust count.
   */
  count_adjustment?: number;
  /**
   * Location within the Inventory Site.
   */
  inventory_site_location_ref?: CurrencyRef;
  /**
   * The lot number of the asset.
   */
  lot_number?: string;
}

/**
 * Give exactly one of: `new_quantity`, or `quantity_difference`.
 */
export interface QuantityAdjustment {
  /**
   * Location within the Inventory Site.
   */
  inventory_site_location_ref?: CurrencyRef;
  /**
   * The lot number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  lot_number?: string;
  /**
   * The new quantity for this inventory item.
   */
  new_quantity?: number;
  /**
   * Either a positive or negative number that shows the change in quantity for this inventory item.
   */
  quantity_difference?: number;
  /**
   * The serial number of the asset.
   *
   * Choose at most one of: `serial_number`, or `lot_number`.
   */
  serial_number?: string;
}

/**
 * Give exactly one of: `add_serial_number`, or `remove_serial_number`.
 */
export interface SerialNumberAdjustment {
  /**
   * Serial number that will be added to inventory.
   */
  add_serial_number?: string;
  /**
   * Location within the Inventory Site.
   */
  inventory_site_location_ref?: CurrencyRef;
  /**
   * Serial number that will be removed from inventory.
   */
  remove_serial_number?: string;
}

/**
 * Give exactly one of: `new_quantity`, or `quantity_difference`.
 */
export interface ValueAdjustment {
  /**
   * The new quantity for this inventory item.
   */
  new_quantity?: number;
  /**
   * Either a positive or negative number that shows the change in quantity for this inventory item.
   */
  quantity_difference?: number;
}
