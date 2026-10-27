// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks unit of measure set operations: `qube.unitOfMeasureSet.<action>(connectionId, params, { webhookUrl })`. */
export declare class UnitOfMeasureSet {
  constructor(client: Client);
  /**
   * Create unit of measure set: `POST /connections/{connection_id}/unit-of-measure-sets`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `base_unit` (required), `default_unit`, `include_ret_element`, `is_active`, `name` (required), `related_unit`, `request_id`, `unit_of_measure_type` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/unit-of-measure-sets/create-unit-of-measure-set
   */
  create(connectionId: string, params: UnitOfMeasureSetCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List unit of measure sets: `GET /connections/{connection_id}/unit-of-measure-sets`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/unit-of-measure-sets/list-unit-of-measure-sets
   */
  query(connectionId: string, params: UnitOfMeasureSetQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `unit_of_measure_set.create`: Create unit of measure set.
 */
export interface UnitOfMeasureSetCreateParams {
  /**
   * The unit of measure in a unit of measure set by which quantities of an item are tracked, priced, etc. If the company file is enabled for single unit of measure per item, the base unit is the only unit that is available for transaction line items.
   */
  base_unit: BaseUnit;
  default_unit?: DefaultUnit[];
  include_ret_element?: Array<"BaseUnit" | "DefaultUnit" | "EditSequence" | "ExternalGUID" | "IsActive" | "ListID" | "Name" | "OwnerID" | "RelatedUnit" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "UnitOfMeasureType">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because FullName remains distinct.
   */
  name: string;
  related_unit?: RelatedUnit[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The type of the unit of measure. This can be one of the values you see in the QuickBooks UI when you create a new UOM set, such as Count, or it can be your own value, which in the UI you can specify by selecting “Other” then defining it.
   */
  unit_of_measure_type: "Area" | "Count" | "Length" | "Other" | "Time" | "Volume" | "Weight";
}

/**
 * The params of `unit_of_measure_set.query`: List unit of measure sets.
 */
export interface UnitOfMeasureSetQueryParams {
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
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"BaseUnit" | "DefaultUnit" | "EditSequence" | "IsActive" | "ListID" | "Name" | "RelatedUnit" | "TimeCreated" | "TimeModified" | "UnitOfMeasureType">;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
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

export interface BaseUnit {
  /**
   * The is the short “identifier” for a unit of measure that shows up in transaction line items in the U/M field in the QuickBooks UI.
   */
  abbreviation: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because FullName remains distinct.
   */
  name: string;
}

export interface DefaultUnit {
  /**
   * In a related unit within a unit of measure set, the name you want the unit to have. This name is displayed in the QuickBooks as an available unit for the item, if the company is enabled for multiple units of measure per item.
   */
  unit: string;
  /**
   * In a default unit of measure, this specifies whether the default is to be used for purchase line items, sales line items, or shipping lines.
   */
  unit_used_for: "Purchase" | "Sales" | "Shipping";
}

export interface RelatedUnit {
  /**
   * The is the short “identifier” for a unit of measure that shows up in transaction line items in the U/M field in the QuickBooks UI.
   */
  abbreviation: string;
  /**
   * Within a unit of measure set, in any of the related units in that set, this indicates how many base units are in the related unit. That is, if the base unit is “box”, and the related unit is “case” with a conversion ratio of 10, that means there are 10 boxes in a case.
   */
  conversion_ratio: number;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because FullName remains distinct.
   */
  name: string;
}
