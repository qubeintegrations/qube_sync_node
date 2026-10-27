// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, BarCodeItemDiscount, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks item inventory operations: `qube.itemInventory.<action>(connectionId, params, { webhookUrl })`. */
export declare class ItemInventory {
  constructor(client: Client);
  /**
   * Create item inventory: `POST /connections/{connection_id}/item-inventories`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `asset_account_ref`, `bar_code`, `class_ref`, `cogs_account_ref`, `external_guid`, `include_ret_element`, `income_account_ref`, `inventory_date`, `is_active`, `is_tax_included`, `manufacturer_part_number`, `max`, `name` (required), `parent_ref`, `pref_vendor_ref`, `purchase_cost`, `purchase_desc`, `purchase_tax_code_ref`, `quantity_on_hand`, `reorder_point`, `request_id`, `sales_desc`, `sales_price`, `sales_tax_code_ref`, `total_value`, `unit_of_measure_set_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-inventories/create-item-inventory
   */
  create(connectionId: string, params: ItemInventoryCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List item inventories: `GET /connections/{connection_id}/item-inventories`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `class_filter`, `from_modified_date`, `full_name`, `include_ret_element`, `iterator`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `owner_id`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-inventories/list-item-inventories
   */
  query(connectionId: string, params: ItemInventoryQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update item inventory: `PUT /connections/{connection_id}/item-inventories`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `apply_cogs_account_ref_to_existing_txns`, `apply_income_account_ref_to_existing_txns`, `asset_account_ref`, `bar_code`, `class_ref`, `cogs_account_ref`, `edit_sequence` (required), `force_uom_change`, `include_ret_element`, `income_account_ref`, `is_active`, `is_tax_included`, `list_id` (required), `manufacturer_part_number`, `max`, `name`, `parent_ref`, `pref_vendor_ref`, `purchase_cost`, `purchase_desc`, `purchase_tax_code_ref`, `reorder_point`, `request_id`, `sales_desc`, `sales_price`, `sales_tax_code_ref`, `unit_of_measure_set_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-inventories/update-item-inventory
   */
  update(connectionId: string, params: ItemInventoryUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `item_inventory.create`: Create item inventory.
 */
export interface ItemInventoryCreateParams {
  /**
   * Refers to the account QuickBooks uses to track the current value of the company’s inventory. (The AccountType of this account will be FixedAsset, OtherAsset, or OtherCurrentAsset.) In a request, if an `asset_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  asset_account_ref?: CurrencyRef;
  /**
   * Barcode reference information.
   */
  bar_code?: BarCodeItemDiscount;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * Refers to the account that QuickBooks uses to track the original cost of goods that are eventually sold. (The AccountType of this account will be CostOfGoodsSold.) In a request, if a `cogs_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  cogs_account_ref?: CurrencyRef;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"AssetAccountRef" | "AverageCost" | "BarCodeValue" | "COGSAccountRef" | "ClassRef" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "FullName" | "IncomeAccountRef" | "IsActive" | "IsTaxIncluded" | "ListID" | "ManufacturerPartNumber" | "Max" | "Name" | "OwnerID" | "ParentRef" | "PrefVendorRef" | "PurchaseCost" | "PurchaseDesc" | "PurchaseTaxCodeRef" | "QuantityOnHand" | "QuantityOnOrder" | "QuantityOnSalesOrder" | "ReorderPoint" | "SalesDesc" | "SalesPrice" | "SalesTaxCodeRef" | "Sublevel" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "UnitOfMeasureSetRef">;
  /**
   * Refers to an income account. If an `income_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  income_account_ref?: CurrencyRef;
  /**
   * The date when an item was converted into an inventory item from some other type of item.
   *
   * Format: date.
   */
  inventory_date?: string;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
  /**
   * The part number used by the manufacturer of the item.
   */
  manufacturer_part_number?: string;
  /**
   * Maximum number of items in inventory.
   */
  max?: number;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name: string;
  /**
   * A reference to the list object that is one level above this one. For example, an inventory item with the `full_name` of GermanCars:Mercedes-Benz:CL500I99AA might have a parent object with the `full_name` of GermanCars:Mercedes-Benz. In a request, if a `parent_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  parent_ref?: CurrencyRef;
  /**
   * The preferred vendor for this item. If a `pref_vendor_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  pref_vendor_ref?: CurrencyRef;
  /**
   * Amount that the QuickBooks user expects to pay when ordering or buying this item, or the amount that was actually paid for this item.
   */
  purchase_cost?: number;
  /**
   * Appears in the Description column of checks, bills, credit card charges, and item receipts when this item is reordered.
   */
  purchase_desc?: string;
  /**
   * Account used for taxes on purchases in CA or UK.
   */
  purchase_tax_code_ref?: CurrencyRef;
  /**
   * The number of these items in inventory. `quantity_on_hand` times `average_cost` is `total_value` in an inventory item list. To change the `quantity_on_hand` for an item, you would have to use InventoryAdjustmentAdd not an ItemInventoryMod.
   */
  quantity_on_hand?: number;
  /**
   * Quantity at which QuickBooks will remind the user to reorder this inventory item.
   */
  reorder_point?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Appears in the Description column of a sales form when the QuickBooks user sells this item. For a fixed asset, describes the sale of the asset (for accounting purposes).
   */
  sales_desc?: string;
  /**
   * Price charged for this item.
   */
  sales_price?: number;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * The total value of this inventory. If `total_value` is included, `quantity_on_hand` must also be included and must be greater than zero. If both `quantity_on_hand` and `purchase_cost` are included, then `total_value` will be set to `quantity_on_hand` times `purchase_cost`, regardless of what `total_value` is explicitly set to.
   */
  total_value?: number;
  /**
   * The unit of measure set consists of a base unit and 0-n related units.
   */
  unit_of_measure_set_ref?: CurrencyRef;
}

/**
 * The params of `item_inventory.query`: List item inventories.
 */
export interface ItemInventoryQueryParams {
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * Filters according to the object’s class.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  class_filter?: AccountFilter;
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"AssetAccountRef" | "AverageCost" | "BarCodeValue" | "COGSAccountRef" | "ClassRef" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "FullName" | "IncomeAccountRef" | "IsActive" | "IsTaxIncluded" | "ListID" | "ManufacturerPartNumber" | "Max" | "Name" | "ParentRef" | "PrefVendorRef" | "PurchaseCost" | "PurchaseDesc" | "PurchaseTaxCodeRef" | "QuantityOnHand" | "QuantityOnOrder" | "QuantityOnSalesOrder" | "ReorderPoint" | "SalesDesc" | "SalesPrice" | "SalesTaxCodeRef" | "Sublevel" | "TimeCreated" | "TimeModified" | "UnitOfMeasureSetRef">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `full_name` or `list_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `item_inventory.update`: Update item inventory.
 */
export interface ItemInventoryUpdateParams {
  /**
   * Effectively suppresses the UI prompt that is displayed upon a COGS account change when existing transactions use the account.
   */
  apply_cogs_account_ref_to_existing_txns?: boolean;
  /**
   * Used to support changing the AccountRef in the Mod request. When you do this, the QuickBooks UI normally displays a prompt asking whether the change should apply to existing transactions or not. Specifying False basically dismisses this with a “No” answer; specifying True dismisses it with a “Yes” answer and then changes the existing transactions that use the item with that AccountRef.
   */
  apply_income_account_ref_to_existing_txns?: boolean;
  /**
   * Refers to the account QuickBooks uses to track the current value of the company’s inventory. (The AccountType of this account will be FixedAsset, OtherAsset, or OtherCurrentAsset.) In a request, if an `asset_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  asset_account_ref?: CurrencyRef;
  /**
   * Barcode reference information.
   */
  bar_code?: BarCodeItemDiscount;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * Refers to the account that QuickBooks uses to track the original cost of goods that are eventually sold. (The AccountType of this account will be CostOfGoodsSold.) In a request, if a `cogs_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  cogs_account_ref?: CurrencyRef;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * By Default `force_uom_change` is false. However, in item Mod requests, you need to set the `force_uom_change` field to True if you are changing the UOM set and the base unit of the new set doesn’t match the base unit of the UOM set currently assigned to the item. This does the same thing as the user accepting the warning prompt in the UI.
   */
  force_uom_change?: boolean;
  include_ret_element?: Array<"AssetAccountRef" | "AverageCost" | "BarCodeValue" | "COGSAccountRef" | "ClassRef" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "FullName" | "IncomeAccountRef" | "IsActive" | "IsTaxIncluded" | "ListID" | "ManufacturerPartNumber" | "Max" | "Name" | "OwnerID" | "ParentRef" | "PrefVendorRef" | "PurchaseCost" | "PurchaseDesc" | "PurchaseTaxCodeRef" | "QuantityOnHand" | "QuantityOnOrder" | "QuantityOnSalesOrder" | "ReorderPoint" | "SalesDesc" | "SalesPrice" | "SalesTaxCodeRef" | "Sublevel" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "UnitOfMeasureSetRef">;
  /**
   * Refers to an income account. If an `income_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  income_account_ref?: CurrencyRef;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * For future use with international versions of QuickBooks.
   */
  is_tax_included?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id: string;
  /**
   * The part number used by the manufacturer of the item.
   */
  manufacturer_part_number?: string;
  /**
   * Maximum number of items in inventory.
   */
  max?: number;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name?: string;
  /**
   * A reference to the list object that is one level above this one. For example, an inventory item with the `full_name` of GermanCars:Mercedes-Benz:CL500I99AA might have a parent object with the `full_name` of GermanCars:Mercedes-Benz. In a request, if a `parent_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  parent_ref?: CurrencyRef;
  /**
   * The preferred vendor for this item. If a `pref_vendor_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  pref_vendor_ref?: CurrencyRef;
  /**
   * Amount that the QuickBooks user expects to pay when ordering or buying this item, or the amount that was actually paid for this item.
   */
  purchase_cost?: number;
  /**
   * Appears in the Description column of checks, bills, credit card charges, and item receipts when this item is reordered.
   */
  purchase_desc?: string;
  /**
   * Account used for taxes on purchases in CA or UK.
   */
  purchase_tax_code_ref?: CurrencyRef;
  /**
   * Quantity at which QuickBooks will remind the user to reorder this inventory item.
   */
  reorder_point?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Appears in the Description column of a sales form when the QuickBooks user sells this item. For a fixed asset, describes the sale of the asset (for accounting purposes).
   */
  sales_desc?: string;
  /**
   * Price charged for this item.
   */
  sales_price?: number;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * The unit of measure set consists of a base unit and 0-n related units.
   */
  unit_of_measure_set_ref?: CurrencyRef;
}
