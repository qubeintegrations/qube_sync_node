// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks date driven terms operations: `qube.dateDrivenTerms.<action>(connectionId, params, { webhookUrl })`. */
export declare class DateDrivenTerms {
  constructor(client: Client);
  /**
   * Create date driven terms: `POST /connections/{connection_id}/date-driven-terms`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `day_of_month_due` (required), `discount_day_of_month`, `discount_pct`, `due_next_month_days`, `include_ret_element`, `is_active`, `name` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/date-driven-terms/create-date-driven-terms
   */
  create(connectionId: string, params: DateDrivenTermsCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List date driven terms: `GET /connections/{connection_id}/date-driven-terms`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/date-driven-terms/list-date-driven-terms
   */
  query(connectionId: string, params: DateDrivenTermsQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `date_driven_terms.create`: Create date driven terms.
 */
export interface DateDrivenTermsCreateParams {
  /**
   * The day of the month when full payment is due with no discount.
   *
   * Minimum 1. Maximum 31.
   */
  day_of_month_due: number;
  /**
   * If the payment is made by this day of the month, then `discount_pct` applies.
   *
   * Minimum 1. Maximum 31.
   */
  discount_day_of_month?: number;
  /**
   * If payment is received by `discount_day_of_month`, then this discount will apply to the payment. `discount_pct` must be between 0 and 100.
   */
  discount_pct?: number;
  /**
   * Handles cases when an invoice or bill is issued close to its due date. If the invoice or bill is issued within this many days of the due date, payment isn’t due until the following month. For example, with a `day_of_month_due` of 15 and a `due_next_month_days` of 2, an invoice issued on May 13th wouldn’t be due until June 15th.
   */
  due_next_month_days?: number;
  include_ret_element?: Array<"DayOfMonthDue" | "DiscountDayOfMonth" | "DiscountPct" | "DueNextMonthDays" | "EditSequence" | "ExternalGUID" | "IsActive" | "ListID" | "Name" | "OwnerID" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because FullName remains distinct.
   */
  name: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `date_driven_terms.query`: List date driven terms.
 */
export interface DateDrivenTermsQueryParams {
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
  include_ret_element?: Array<"DayOfMonthDue" | "DiscountDayOfMonth" | "DiscountPct" | "DueNextMonthDays" | "EditSequence" | "IsActive" | "ListID" | "Name" | "TimeCreated" | "TimeModified">;
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
