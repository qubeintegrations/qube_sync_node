// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks currency operations: `qube.currency.<action>(connectionId, params, { webhookUrl })`. */
export declare class Currency {
  constructor(client: Client);
  /**
   * Create currency: `POST /connections/{connection_id}/currencies`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `currency_code` (required), `currency_format`, `include_ret_element`, `is_active`, `name` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/currencies/create-currency
   */
  create(connectionId: string, params: CurrencyCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List currencies: `GET /connections/{connection_id}/currencies`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/currencies/list-currencies
   */
  query(connectionId: string, params: CurrencyQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update currency: `PUT /connections/{connection_id}/currencies`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `currency_code`, `currency_format`, `edit_sequence` (required), `include_ret_element`, `is_active`, `list_id` (required), `name`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/currencies/update-currency
   */
  update(connectionId: string, params: CurrencyUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `currency.create`: Create currency.
 */
export interface CurrencyCreateParams {
  /**
   * For built-in currencies, the currency code and name is the generally accepted code and name. These are based on the standard ISO 4217 code/name for a country’s currency. In most cases, the currency code is composed of the country’s two-character Internet country code plus an extra character representing the currency unit.
   */
  currency_code: string;
  /**
   * The aggregate controlling the appearance of the currency with regard to comma and decimal.
   */
  currency_format?: CurrencyFormat;
  include_ret_element?: Array<"AsOfDate" | "CurrencyCode" | "CurrencyFormat" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "IsActive" | "IsUserDefinedCurrency" | "ListID" | "Name" | "OwnerID" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
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
 * The params of `currency.query`: List currencies.
 */
export interface CurrencyQueryParams {
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
  include_ret_element?: Array<"AsOfDate" | "CurrencyCode" | "CurrencyFormat" | "EditSequence" | "ExchangeRate" | "IsActive" | "IsUserDefinedCurrency" | "ListID" | "Name" | "TimeCreated" | "TimeModified">;
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

/**
 * The params of `currency.update`: Update currency.
 */
export interface CurrencyUpdateParams {
  /**
   * For built-in currencies, the currency code and name is the generally accepted code and name. These are based on the standard ISO 4217 code/name for a country’s currency. In most cases, the currency code is composed of the country’s two-character Internet country code plus an extra character representing the currency unit.
   */
  currency_code?: string;
  /**
   * The aggregate controlling the appearance of the currency with regard to comma and decimal.
   */
  currency_format?: CurrencyFormat;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  include_ret_element?: Array<"AsOfDate" | "CurrencyCode" | "CurrencyFormat" | "EditSequence" | "ExchangeRate" | "ExternalGUID" | "IsActive" | "IsUserDefinedCurrency" | "ListID" | "Name" | "OwnerID" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * `list_id` and FullName both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because FullName remains distinct.
   */
  name?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

export interface CurrencyFormat {
  /**
   * This enumerated value controls the display of the decimal value, for example, 1.00. The default is 2 which means 2 decimals are displayed to the right of the decimal point, but you can specify 0 (zero) if you don’t want’ decimals to be displayed.
   */
  decimal_places?: "0" | "2";
  /**
   * This enumerated value controls the display of the decimal point, for example, 1.00 or 1,00. The default is Period but you could alternatively specify a value of Comma.
   */
  decimal_separator?: "Comma" | "Period";
  /**
   * This enumerated value controls how the thousandth’s place is separated from the next thousand, for example, 1,000,000. The default is Comma, as shown, but you can replace this with one of these values: Period, Space, Apostrophe .
   */
  thousand_separator?: "Apostrophe" | "Comma" | "Period" | "Space";
  /**
   * This enumerated value controls how the display of the currency value is grouped, for example, 10,000,000. The default is XX_XXX_XXX but you could replace this with X_XX_XX_XXX
   */
  thousand_separator_grouping?: "XX_XXX_XXX" | "X_XX_XX_XXX";
}
