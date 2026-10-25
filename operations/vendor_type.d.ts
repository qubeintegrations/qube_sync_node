// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks vendor type operations: `qube.vendorType.<action>(connectionId, params, { webhookUrl })`. */
export declare class VendorType {
  constructor(client: Client);
  /**
   * Create vendor type: `POST /connections/{connection_id}/vendor-types`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `include_ret_element`, `is_active`, `name` (required), `parent_ref`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/vendor-types/create-vendor-type
   */
  create(connectionId: string, params: VendorTypeCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List vendor types: `GET /connections/{connection_id}/vendor-types`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/vendor-types/list-vendor-types
   */
  query(connectionId: string, params: VendorTypeQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `vendor_type.create`: Create vendor type.
 */
export interface VendorTypeCreateParams {
  include_ret_element?: Array<"EditSequence" | "ExternalGUID" | "FullName" | "IsActive" | "ListID" | "Name" | "OwnerID" | "ParentRef" | "Sublevel" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
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
}

/**
 * The params of `vendor_type.query`: List vendor types.
 */
export interface VendorTypeQueryParams {
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
  include_ret_element?: Array<"EditSequence" | "FullName" | "IsActive" | "ListID" | "Name" | "ParentRef" | "Sublevel" | "TimeCreated" | "TimeModified">;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * QuickBooks doesn't page this query: at most this many records come back, in one answer, with no sign of whether more matched. Leave it out for every match, in one answer; one over 4 MB as the Web Connector sends it, about 3 MB of qbXML isn't kept (`error_type` `response_too_large`), so narrow a large one with its filters.
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
