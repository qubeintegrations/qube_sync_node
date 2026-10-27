// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, BarCodeItemDiscount, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks item discount operations: `qube.itemDiscount.<action>(connectionId, params, { webhookUrl })`. */
export declare class ItemDiscount {
  constructor(client: Client);
  /**
   * Create item discount: `POST /connections/{connection_id}/item-discounts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_ref`, `bar_code`, `class_ref`, `discount_rate`, `discount_rate_percent`, `external_guid`, `include_ret_element`, `is_active`, `item_desc`, `name` (required), `parent_ref`, `request_id`, `sales_tax_code_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-discounts/create-item-discount
   */
  create(connectionId: string, params: ItemDiscountCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List item discounts: `GET /connections/{connection_id}/item-discounts`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `class_filter`, `from_modified_date`, `full_name`, `include_ret_element`, `iterator`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `owner_id`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-discounts/list-item-discounts
   */
  query(connectionId: string, params: ItemDiscountQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update item discount: `PUT /connections/{connection_id}/item-discounts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_ref`, `apply_account_ref_to_existing_txns`, `bar_code`, `class_ref`, `discount_rate`, `discount_rate_percent`, `edit_sequence` (required), `include_ret_element`, `is_active`, `item_desc`, `list_id` (required), `name`, `parent_ref`, `request_id`, `sales_tax_code_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-discounts/update-item-discount
   */
  update(connectionId: string, params: ItemDiscountUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `item_discount.create`: Create item discount.
 */
export interface ItemDiscountCreateParams {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref?: CurrencyRef;
  /**
   * Barcode reference information.
   */
  bar_code?: BarCodeItemDiscount;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * The discount rate when it is given as a monetary amount. `discount_rate` will be subtracted from a total or subtotal.
   *
   * Choose at most one of: `discount_rate`, or `discount_rate_percent`.
   */
  discount_rate?: number;
  /**
   * The discount rate when it is given as a percent. `discount_rate_percent` will be subtracted from a total or subtotal.
   *
   * Choose at most one of: `discount_rate`, or `discount_rate_percent`.
   */
  discount_rate_percent?: number;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"AccountRef" | "BarCodeValue" | "ClassRef" | "DataExtRet" | "DiscountRate" | "DiscountRatePercent" | "EditSequence" | "ExternalGUID" | "FullName" | "IsActive" | "ItemDesc" | "ListID" | "Name" | "OwnerID" | "ParentRef" | "SalesTaxCodeRef" | "Sublevel" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * The description that will appear on a sales form when the item is used.
   */
  item_desc?: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name: string;
  /**
   * A reference to the list object that is one level above this one. For example, an inventory item with the `full_name` of GermanCars:Mercedes-Benz:CL500I99AA might have a parent object with the `full_name` of GermanCars:Mercedes-Benz. In a request, if a `parent_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  parent_ref?: CurrencyRef;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
}

/**
 * The params of `item_discount.query`: List item discounts.
 */
export interface ItemDiscountQueryParams {
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
  include_ret_element?: Array<"AccountRef" | "BarCodeValue" | "ClassRef" | "DataExtRet" | "DiscountRate" | "DiscountRatePercent" | "EditSequence" | "ExternalGUID" | "FullName" | "IsActive" | "ItemDesc" | "ListID" | "Name" | "ParentRef" | "SalesTaxCodeRef" | "Sublevel" | "TimeCreated" | "TimeModified">;
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
 * The params of `item_discount.update`: Update item discount.
 */
export interface ItemDiscountUpdateParams {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref?: CurrencyRef;
  /**
   * Used to support changing the `account_ref` in the Mod request. When you do this, the QuickBooks UI normally displays a prompt asking whether the change should apply to existing transactions or not. Specifying False basically dismisses this with a “No” answer; specifying True dismisses it with a “Yes” answer and then changes the existing transactions that use the item with that `account_ref`.
   */
  apply_account_ref_to_existing_txns?: boolean;
  /**
   * Barcode reference information.
   */
  bar_code?: BarCodeItemDiscount;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * The discount rate when it is given as a monetary amount. `discount_rate` will be subtracted from a total or subtotal.
   *
   * Choose at most one of: `discount_rate`, or `discount_rate_percent`.
   */
  discount_rate?: number;
  /**
   * The discount rate when it is given as a percent. `discount_rate_percent` will be subtracted from a total or subtotal.
   *
   * Choose at most one of: `discount_rate`, or `discount_rate_percent`.
   */
  discount_rate_percent?: number;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  include_ret_element?: Array<"AccountRef" | "BarCodeValue" | "ClassRef" | "DataExtRet" | "DiscountRate" | "DiscountRatePercent" | "EditSequence" | "ExternalGUID" | "FullName" | "IsActive" | "ItemDesc" | "ListID" | "Name" | "OwnerID" | "ParentRef" | "SalesTaxCodeRef" | "Sublevel" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * The description that will appear on a sales form when the item is used.
   */
  item_desc?: string;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name?: string;
  /**
   * A reference to the list object that is one level above this one. For example, an inventory item with the `full_name` of GermanCars:Mercedes-Benz:CL500I99AA might have a parent object with the `full_name` of GermanCars:Mercedes-Benz. In a request, if a `parent_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  parent_ref?: CurrencyRef;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
}
