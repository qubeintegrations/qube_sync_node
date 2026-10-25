// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks billing rate operations: `qube.billingRate.<action>(connectionId, params, { webhookUrl })`. */
export declare class BillingRate {
  constructor(client: Client);
  /**
   * Create billing rate: `POST /connections/{connection_id}/billing-rates`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `billing_rate_per_item`, `fixed_billing_rate`, `include_ret_element`, `name` (required), `request_id`.
   *
   * Give exactly one of: `fixed_billing_rate`, or `billing_rate_per_item`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/billing-rates/create-billing-rate
   */
  create(connectionId: string, params: BillingRateCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List billing rates: `GET /connections/{connection_id}/billing-rates`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `from_modified_date`, `full_name`, `include_ret_element`, `item_ref`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/billing-rates/list-billing-rates
   */
  query(connectionId: string, params: BillingRateQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `billing_rate.create`: Create billing rate.
 *
 * Give exactly one of: `fixed_billing_rate`, or `billing_rate_per_item`.
 */
export interface BillingRateCreateParams {
  billing_rate_per_item?: BillingRatePerItem[];
  /**
   * You use `fixed_billing_rate` if you want the rate to override all service items rates. Consequently, there is no need to specify any service items (and in fact you can’t specify them) if you use this element.
   */
  fixed_billing_rate?: number;
  include_ret_element?: Array<"BillingRatePerItemRet" | "BillingRateType" | "EditSequence" | "ExternalGUID" | "FixedBillingRate" | "ListID" | "Name" | "OwnerID" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `billing_rate.query`: List billing rates.
 */
export interface BillingRateQueryParams {
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"BillingRatePerItemRet" | "BillingRateType" | "EditSequence" | "FixedBillingRate" | "ListID" | "Name" | "TimeCreated" | "TimeModified">;
  /**
   * `item_ref` may accept all item types or a restricted subset, depending on the request. Examples: PurchaseOrder and Bill do not allow discount or sales-tax items; VehicleMileageAdd requires a service or other-charge item; BillingRateAdd requires a service item. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  item_ref?: CurrencyRef;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * QuickBooks doesn't page this query: at most this many records come back, in one answer, with no sign of whether more matched. Leave it out for every match, in one answer; one over 4 MB as the Web Connector sends it, about 3 MB of qbXML isn't kept (`error_type` `response_too_large`), so narrow a large one with its filters.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `list_id`, or `full_name`, or the set (`from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_range_filter?: NameRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters results to objects modified on or before this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to end-of-day (23:59:59).
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`from_modified_date`, `item_ref`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

export interface BillingRatePerItem {
  /**
   * Specifies the service item rate that `adjust_percentage` is applied to. Normally, this is set to StandardRate.
   *
   * Choose exactly one of: the set (`custom_rate`, `custom_rate_percent`), or the set (`adjust_billing_rate_relative_to`, `adjust_percentage`). Members of a set combine with each other, not with the other choices.
   */
  adjust_billing_rate_relative_to?: "CurrentCustomRate" | "StandardRate";
  /**
   * If you don’t want to apply a custom price (for price levels) or custom rate (for billing rates), you can apply an adjusted price discount using the pair of fields `adjust_percentage` and AdjustRelativeTo (`adjust_billing_rate_relative_to` for billing rates).
   *
   * Choose exactly one of: the set (`custom_rate`, `custom_rate_percent`), or the set (`adjust_billing_rate_relative_to`, `adjust_percentage`). Members of a set combine with each other, not with the other choices.
   */
  adjust_percentage?: number;
  /**
   * The value specified here overrides the rate of the service item referenced in this aggregate (in the `item_ref`) with the rate you specify here. If instead you wanted a rate that is a percentage higher or lower than the service item rate, you wouldn’t use `custom_rate`, but you would use `adjust_percentage` and `adjust_billing_rate_relative_to`.
   *
   * Choose exactly one of: the set (`custom_rate`, `custom_rate_percent`), or the set (`adjust_billing_rate_relative_to`, `adjust_percentage`). Members of a set combine with each other, not with the other choices.
   */
  custom_rate?: number;
  /**
   * Using this field with BillingRateAdd will work only if the service item itself is set to a percentage, not to an amount. If you attempt to set the Billing Rate to a percentage for a service item that has an amount for the Rate, you will get an error. The kind of rate you have on the service item determines the kind of billing rate you may have on that item.
   *
   * Choose exactly one of: the set (`custom_rate`, `custom_rate_percent`), or the set (`adjust_billing_rate_relative_to`, `adjust_percentage`). Members of a set combine with each other, not with the other choices.
   */
  custom_rate_percent?: number;
  /**
   * `item_ref` may accept all item types or a restricted subset, depending on the request. Examples: PurchaseOrder and Bill do not allow discount or sales-tax items; VehicleMileageAdd requires a service or other-charge item; BillingRateAdd requires a service item. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  item_ref: CurrencyRef;
}
