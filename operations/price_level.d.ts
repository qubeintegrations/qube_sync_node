// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyFilter, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks price level operations: `qube.priceLevel.<action>(connectionId, params, { webhookUrl })`. */
export declare class PriceLevel {
  constructor(client: Client);
  /**
   * Create price level: `POST /connections/{connection_id}/price-levels`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `currency_ref`, `include_ret_element`, `is_active`, `name` (required), `price_level_fixed_percentage`, `price_level_per_item`, `request_id`.
   *
   * Give exactly one of: `price_level_fixed_percentage`, or (`currency_ref`, `price_level_per_item`).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/price-levels/create-price-level
   */
  create(connectionId: string, params: PriceLevelCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List price levels: `GET /connections/{connection_id}/price-levels`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `currency_filter`, `from_modified_date`, `full_name`, `include_ret_element`, `item_ref`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/price-levels/list-price-levels
   */
  query(connectionId: string, params: PriceLevelQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update price level: `PUT /connections/{connection_id}/price-levels`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `currency_ref`, `edit_sequence` (required), `include_ret_element`, `is_active`, `list_id` (required), `name`, `price_level_fixed_percentage`, `price_level_per_item`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/price-levels/update-price-level
   */
  update(connectionId: string, params: PriceLevelUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `price_level.create`: Create price level.
 *
 * Give exactly one of: `price_level_fixed_percentage`, or (`currency_ref`, `price_level_per_item`).
 */
export interface PriceLevelCreateParams {
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
  include_ret_element?: Array<"CurrencyRef" | "EditSequence" | "ExternalGUID" | "IsActive" | "ListID" | "Name" | "OwnerID" | "PriceLevelFixedPercentage" | "PriceLevelPerItemRet" | "PriceLevelType" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name: string;
  /**
   * When you create a price level, you must specify whether it is a fixed percentage or a per item price level. Once you create the price level, you can’t change this. QuickBooks Pro and greater versions support fixed percentages, but only QuickBooks Premier and Enterprise support the per item price level. Where is this discount applied if Price Levels are enabled in QuickBooks preferences?
   */
  price_level_fixed_percentage?: number;
  price_level_per_item?: PriceLevelPerItem[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `price_level.query`: List price levels.
 */
export interface PriceLevelQueryParams {
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `currency_filter`, `from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * Filters by the specified currency.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `currency_filter`, `from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  currency_filter?: CurrencyFilter;
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `currency_filter`, `from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `currency_filter`, `from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"CurrencyRef" | "EditSequence" | "IsActive" | "ListID" | "Name" | "PriceLevelFixedPercentage" | "PriceLevelPerItemRet" | "PriceLevelType" | "TimeCreated" | "TimeModified">;
  /**
   * `item_ref` may accept all item types or a restricted subset, depending on the request. Examples: PurchaseOrder and Bill do not allow discount or sales-tax items; VehicleMileageAdd requires a service or other-charge item; BillingRateAdd requires a service item. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `currency_filter`, `from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  item_ref?: CurrencyRef;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `currency_filter`, `from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * QuickBooks doesn't page this query: at most this many records come back, in one answer, with no sign of whether more matched. Leave it out for every match, in one answer; one over 4 MB as the Web Connector sends it, about 3 MB of qbXML isn't kept (`error_type` `response_too_large`), so narrow a large one with its filters.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `currency_filter`, `from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `currency_filter`, `from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `currency_filter`, `from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_range_filter?: NameRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters results to objects modified on or before this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to end-of-day (23:59:59).
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `currency_filter`, `from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `price_level.update`: Update price level.
 */
export interface PriceLevelUpdateParams {
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   *
   * Choose at most one of: `price_level_fixed_percentage`, or the set (`currency_ref`, `price_level_per_item`). Members of a set combine with each other, not with the other choices.
   */
  currency_ref?: CurrencyRef;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  include_ret_element?: Array<"CurrencyRef" | "EditSequence" | "ExternalGUID" | "IsActive" | "ListID" | "Name" | "OwnerID" | "PriceLevelFixedPercentage" | "PriceLevelPerItemRet" | "PriceLevelType" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name?: string;
  /**
   * When you create a price level, you must specify whether it is a fixed percentage or a per item price level. Once you create the price level, you can’t change this. QuickBooks Pro and greater versions support fixed percentages, but only QuickBooks Premier and Enterprise support the per item price level. Where is this discount applied if Price Levels are enabled in QuickBooks preferences?
   *
   * Choose at most one of: `price_level_fixed_percentage`, or the set (`currency_ref`, `price_level_per_item`). Members of a set combine with each other, not with the other choices.
   */
  price_level_fixed_percentage?: number;
  /**
   * Choose at most one of: `price_level_fixed_percentage`, or the set (`currency_ref`, `price_level_per_item`). Members of a set combine with each other, not with the other choices.
   */
  price_level_per_item?: PriceLevelPerItem[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

export interface PriceLevelPerItem {
  /**
   * If you don’t want to apply a custom price (for price levels) or custom rate (for billing rates), you can apply an adjusted price discount using the pair of fields `adjust_percentage` and `adjust_relative_to` (AdjustBillingRateRelativeTo for billing rates).
   *
   * Choose exactly one of: the set (`custom_price`, `custom_price_percent`), or the set (`adjust_percentage`, `adjust_relative_to`). Members of a set combine with each other, not with the other choices.
   */
  adjust_percentage?: number;
  /**
   * When you create a price level, you have the option to create it with a flat custom price (flat amount or percentage) or you could use PriceLevelAdjustment to apply a price discount based on either the current custom price, the standard price of the item, or the cost of the item.
   *
   * Choose exactly one of: the set (`custom_price`, `custom_price_percent`), or the set (`adjust_percentage`, `adjust_relative_to`). Members of a set combine with each other, not with the other choices.
   */
  adjust_relative_to?: "Cost" | "CurrentCustomPrice" | "StandardPrice";
  /**
   * When you create a price level, you have the option to create it with a custom price that is either a fixed amount (`custom_price`) or a fixed discount percentage (`custom_price_percent`). Alternatively, instead of a flat custom price or discount, you could apply a price discount based on either the current custom price, the standard price of the item, or the cost of the item.
   *
   * Choose exactly one of: the set (`custom_price`, `custom_price_percent`), or the set (`adjust_percentage`, `adjust_relative_to`). Members of a set combine with each other, not with the other choices.
   */
  custom_price?: number;
  /**
   * When you create a price level, you have the option to create it with a custom price that is either a fixed amount (`custom_price`) or a fixed discount percentage (`custom_price_percent`).
   *
   * Choose exactly one of: the set (`custom_price`, `custom_price_percent`), or the set (`adjust_percentage`, `adjust_relative_to`). Members of a set combine with each other, not with the other choices.
   */
  custom_price_percent?: number;
  /**
   * `item_ref` may accept all item types or a restricted subset, depending on the request. Examples: PurchaseOrder and Bill do not allow discount or sales-tax items; VehicleMileageAdd requires a service or other-charge item; BillingRateAdd requires a service item. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  item_ref: CurrencyRef;
}
