// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks workers comp code operations: `qube.workersCompCode.<action>(connectionId, params, { webhookUrl })`. */
export declare class WorkersCompCode {
  constructor(client: Client);
  /**
   * Create workers comp code: `POST /connections/{connection_id}/workers-comp-codes`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `desc`, `include_ret_element`, `is_active`, `name` (required), `rate_entry` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/workers-comp-codes/create-workers-comp-code
   */
  create(connectionId: string, params: WorkersCompCodeCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List workers comp codes: `GET /connections/{connection_id}/workers-comp-codes`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_effective_date`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_effective_date`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/workers-comp-codes/list-workers-comp-codes
   */
  query(connectionId: string, params: WorkersCompCodeQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update workers comp code: `PUT /connections/{connection_id}/workers-comp-codes`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `desc`, `edit_sequence` (required), `include_ret_element`, `is_active`, `list_id` (required), `name`, `rate_entry`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/workers-comp-codes/update-workers-comp-code
   */
  update(connectionId: string, params: WorkersCompCodeUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `workers_comp_code.create`: Create workers comp code.
 */
export interface WorkersCompCodeCreateParams {
  /**
   * A descriptive text field.
   */
  desc?: string;
  include_ret_element?: Array<"CurrentEffectiveDate" | "CurrentRate" | "Desc" | "EditSequence" | "ExternalGUID" | "IsActive" | "ListID" | "Name" | "NextEffectiveDate" | "NextRate" | "OwnerID" | "RateHistory" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because FullName remains distinct.
   */
  name: string;
  rate_entry: RateEntry[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `workers_comp_code.query`: List workers comp codes.
 */
export interface WorkersCompCodeQueryParams {
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_effective_date`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_effective_date`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * The beginning of the range of effective dates to be searched.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_effective_date`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_effective_date`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date.
   */
  from_effective_date?: string;
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_effective_date`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_effective_date`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_effective_date`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_effective_date`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"CurrentEffectiveDate" | "CurrentRate" | "Desc" | "EditSequence" | "IsActive" | "ListID" | "Name" | "NextEffectiveDate" | "NextRate" | "RateHistory" | "TimeCreated" | "TimeModified">;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_effective_date`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_effective_date`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * QuickBooks doesn't page this query: at most this many records come back, in one answer, with no sign of whether more matched. Leave it out for every match, in one answer; one over 4 MB as the Web Connector sends it, about 3 MB of qbXML isn't kept (`error_type` `response_too_large`), so narrow a large one with its filters.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_effective_date`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_effective_date`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_effective_date`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_effective_date`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_effective_date`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_effective_date`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_range_filter?: NameRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The end of the range of effective dates to be searched.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_effective_date`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_effective_date`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date.
   */
  to_effective_date?: string;
  /**
   * Filters results to objects modified on or before this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to end-of-day (23:59:59).
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_effective_date`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_effective_date`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `workers_comp_code.update`: Update workers comp code.
 */
export interface WorkersCompCodeUpdateParams {
  /**
   * A descriptive text field.
   */
  desc?: string;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  include_ret_element?: Array<"CurrentEffectiveDate" | "CurrentRate" | "Desc" | "EditSequence" | "ExternalGUID" | "IsActive" | "ListID" | "Name" | "NextEffectiveDate" | "NextRate" | "OwnerID" | "RateHistory" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * `list_id` and FullName both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both FullName and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores FullName.
   */
  list_id: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because FullName remains distinct.
   */
  name?: string;
  rate_entry?: RateEntry[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

export interface RateEntry {
  /**
   * Specifies the date at which the workers’ comp code and it’s related premium goes into effect.
   *
   * Format: date.
   */
  effective_date: string;
  /**
   * Indicates the price of something.
   */
  rate: number;
}
