// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, BarCodeItemDiscount, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks item fixed asset operations: `qube.itemFixedAsset.<action>(connectionId, params, { webhookUrl })`. */
export declare class ItemFixedAsset {
  constructor(client: Client);
  /**
   * Create item fixed asset: `POST /connections/{connection_id}/item-fixed-assets`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `acquired_as` (required), `asset_account_ref`, `asset_desc`, `asset_number`, `bar_code`, `class_ref`, `cost_basis`, `external_guid`, `fixed_asset_sales_info`, `include_ret_element`, `is_active`, `location`, `name` (required), `notes`, `po_number`, `purchase_cost`, `purchase_date` (required), `purchase_desc` (required), `request_id`, `serial_number`, `vendor_or_payee_name`, `warranty_exp_date`, `year_end_accumulated_depreciation`, `year_end_book_value`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-fixed-assets/create-item-fixed-asset
   */
  create(connectionId: string, params: ItemFixedAssetCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List item fixed assets: `GET /connections/{connection_id}/item-fixed-assets`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `class_filter`, `from_modified_date`, `full_name`, `include_ret_element`, `iterator`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `owner_id`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-fixed-assets/list-item-fixed-assets
   */
  query(connectionId: string, params: ItemFixedAssetQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update item fixed asset: `PUT /connections/{connection_id}/item-fixed-assets`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `acquired_as`, `asset_account_ref`, `asset_desc`, `asset_number`, `bar_code`, `class_ref`, `cost_basis`, `edit_sequence` (required), `fixed_asset_sales_info_mod`, `include_ret_element`, `is_active`, `list_id` (required), `location`, `name`, `notes`, `po_number`, `purchase_cost`, `purchase_date`, `purchase_desc`, `request_id`, `serial_number`, `vendor_or_payee_name`, `warranty_exp_date`, `year_end_accumulated_depreciation`, `year_end_book_value`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-fixed-assets/update-item-fixed-asset
   */
  update(connectionId: string, params: ItemFixedAssetUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `item_fixed_asset.create`: Create item fixed asset.
 */
export interface ItemFixedAssetCreateParams {
  /**
   * Indicates whether this item was new or used when the business acquired it.
   */
  acquired_as: "New" | "Old";
  /**
   * Refers to the account QuickBooks uses to track the current value of the company’s inventory. (The AccountType of this account will be FixedAsset, OtherAsset, or OtherCurrentAsset.) In a request, if an `asset_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  asset_account_ref?: CurrencyRef;
  /**
   * Description of the asset—maker, brand, and so on.
   */
  asset_desc?: string;
  /**
   * The number used by the QuickBooks Fixed Asset Manager to identify this asset.
   */
  asset_number?: string;
  /**
   * Barcode reference information.
   */
  bar_code?: BarCodeItemDiscount;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * The total cost of the fixed asset. This can include the cost of improvements or repairs. This amount is used to figure depreciation.
   */
  cost_basis?: number;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  /**
   * Sales information, if this fixed asset was sold.
   */
  fixed_asset_sales_info?: FixedAssetSalesInfo;
  include_ret_element?: Array<"AcquiredAs" | "AssetAccountRef" | "AssetDesc" | "AssetNumber" | "BarCodeValue" | "ClassRef" | "CostBasis" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "FixedAssetSalesInfo" | "IsActive" | "ListID" | "Location" | "Name" | "Notes" | "OwnerID" | "PONumber" | "PurchaseCost" | "PurchaseDate" | "PurchaseDesc" | "SerialNumber" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "VendorOrPayeeName" | "WarrantyExpDate" | "YearEndAccumulatedDepreciation" | "YearEndBookValue">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Where the asset is located or has been placed into service.
   */
  location?: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name: string;
  /**
   * Additional information.
   */
  notes?: string;
  /**
   * Purchase order number.
   */
  po_number?: string;
  /**
   * Amount that the QuickBooks user expects to pay when ordering or buying this item, or the amount that was actually paid for this item.
   */
  purchase_cost?: number;
  /**
   * The date when this asset was purchased.
   *
   * Format: date.
   */
  purchase_date: string;
  /**
   * Description that appears in the Description column of checks, bills, credit card charges, and item receipts (when an item is reordered). For a fixed asset, a description of the item as it was when it was purchased.
   */
  purchase_desc: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The serial number of the asset.
   */
  serial_number?: string;
  /**
   * The name of the vendor from whom this asset was purchased.
   */
  vendor_or_payee_name?: string;
  /**
   * The date when the warranty for this asset expires.
   *
   * Format: date.
   */
  warranty_exp_date?: string;
  /**
   * The amount the fixed asset has lost in value since it was purchased, as of the end of the year.
   */
  year_end_accumulated_depreciation?: number;
  /**
   * A reasonable estimate of the sales value of the fixed asset, as of the end of the year.
   */
  year_end_book_value?: number;
}

/**
 * The params of `item_fixed_asset.query`: List item fixed assets.
 */
export interface ItemFixedAssetQueryParams {
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
  include_ret_element?: Array<"AcquiredAs" | "AssetAccountRef" | "AssetDesc" | "AssetNumber" | "BarCodeValue" | "ClassRef" | "CostBasis" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "FixedAssetSalesInfo" | "IsActive" | "ListID" | "Location" | "Name" | "Notes" | "PONumber" | "PurchaseCost" | "PurchaseDate" | "PurchaseDesc" | "SerialNumber" | "TimeCreated" | "TimeModified" | "VendorOrPayeeName" | "WarrantyExpDate" | "YearEndAccumulatedDepreciation" | "YearEndBookValue">;
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
 * The params of `item_fixed_asset.update`: Update item fixed asset.
 */
export interface ItemFixedAssetUpdateParams {
  /**
   * Indicates whether this item was new or used when the business acquired it.
   */
  acquired_as?: "New" | "Old";
  /**
   * Refers to the account QuickBooks uses to track the current value of the company’s inventory. (The AccountType of this account will be FixedAsset, OtherAsset, or OtherCurrentAsset.) In a request, if an `asset_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  asset_account_ref?: CurrencyRef;
  /**
   * Description of the asset—maker, brand, and so on.
   */
  asset_desc?: string;
  /**
   * The number used by the QuickBooks Fixed Asset Manager to identify this asset.
   */
  asset_number?: string;
  /**
   * Barcode reference information.
   */
  bar_code?: BarCodeItemDiscount;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * The total cost of the fixed asset. This can include the cost of improvements or repairs. This amount is used to figure depreciation.
   */
  cost_basis?: number;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * Sales information, if this fixed asset was sold.
   */
  fixed_asset_sales_info_mod?: FixedAssetSalesInfoMod;
  include_ret_element?: Array<"AcquiredAs" | "AssetAccountRef" | "AssetDesc" | "AssetNumber" | "BarCodeValue" | "ClassRef" | "CostBasis" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "FixedAssetSalesInfo" | "IsActive" | "ListID" | "Location" | "Name" | "Notes" | "OwnerID" | "PONumber" | "PurchaseCost" | "PurchaseDate" | "PurchaseDesc" | "SerialNumber" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "VendorOrPayeeName" | "WarrantyExpDate" | "YearEndAccumulatedDepreciation" | "YearEndBookValue">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id: string;
  /**
   * Where the asset is located or has been placed into service.
   */
  location?: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name?: string;
  /**
   * Additional information.
   */
  notes?: string;
  /**
   * Purchase order number.
   */
  po_number?: string;
  /**
   * Amount that the QuickBooks user expects to pay when ordering or buying this item, or the amount that was actually paid for this item.
   */
  purchase_cost?: number;
  /**
   * The date when this asset was purchased.
   *
   * Format: date.
   */
  purchase_date?: string;
  /**
   * Description that appears in the Description column of checks, bills, credit card charges, and item receipts (when an item is reordered). For a fixed asset, a description of the item as it was when it was purchased.
   */
  purchase_desc?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The serial number of the asset.
   */
  serial_number?: string;
  /**
   * The name of the vendor from whom this asset was purchased.
   */
  vendor_or_payee_name?: string;
  /**
   * The date when the warranty for this asset expires.
   *
   * Format: date.
   */
  warranty_exp_date?: string;
  /**
   * The amount the fixed asset has lost in value since it was purchased, as of the end of the year.
   */
  year_end_accumulated_depreciation?: number;
  /**
   * A reasonable estimate of the sales value of the fixed asset, as of the end of the year.
   */
  year_end_book_value?: number;
}

export interface FixedAssetSalesInfo {
  /**
   * Date when a fixed asset was sold.
   *
   * Format: date.
   */
  sales_date: string;
  /**
   * Appears in the Description column of a sales form when the QuickBooks user sells this item. For a fixed asset, describes the sale of the asset (for accounting purposes).
   */
  sales_desc: string;
  /**
   * Any expenses that were incurred during the sale of a fixed asset.
   */
  sales_expense?: number;
  /**
   * Price charged for this item.
   */
  sales_price?: number;
}

export interface FixedAssetSalesInfoMod {
  /**
   * Date when a fixed asset was sold.
   *
   * Format: date.
   */
  sales_date?: string;
  /**
   * Appears in the Description column of a sales form when the QuickBooks user sells this item. For a fixed asset, describes the sale of the asset (for accounting purposes).
   */
  sales_desc?: string;
  /**
   * Any expenses that were incurred during the sale of a fixed asset.
   */
  sales_expense?: number;
  /**
   * Price charged for this item.
   */
  sales_price?: number;
}
