// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks sales tax code operations: `qube.salesTaxCode.<action>(connectionId, params, { webhookUrl })`. */
export declare class SalesTaxCode {
  constructor(client: Client);
  /**
   * Create sales tax code: `POST /connections/{connection_id}/sales-tax-codes`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `desc`, `include_ret_element`, `is_active`, `is_taxable` (required), `item_purchase_tax_ref`, `item_sales_tax_ref`, `name` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-codes/create-sales-tax-code
   */
  create(connectionId: string, params: SalesTaxCodeCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List sales tax codes: `GET /connections/{connection_id}/sales-tax-codes`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-codes/list-sales-tax-codes
   */
  query(connectionId: string, params: SalesTaxCodeQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update sales tax code: `PUT /connections/{connection_id}/sales-tax-codes`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `desc`, `edit_sequence` (required), `include_ret_element`, `is_active`, `is_taxable`, `item_purchase_tax_ref`, `item_sales_tax_ref`, `list_id` (required), `name`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-codes/update-sales-tax-code
   */
  update(connectionId: string, params: SalesTaxCodeUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `sales_tax_code.create`: Create sales tax code.
 */
export interface SalesTaxCodeCreateParams {
  /**
   * Desc gives a longer explanation of Name.
   */
  desc?: string;
  include_ret_element?: Array<"Desc" | "EditSequence" | "ExternalGUID" | "IsActive" | "IsTaxable" | "ItemPurchaseTaxRef" | "ItemSalesTaxRef" | "ListID" | "Name" | "OwnerID" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Indicates whether this sales-tax code is tracking taxable sales. For any particular sales-tax code, `is_taxable` can’t be modified once the sales-tax code has been used in a transaction. If the “Do You Charge Sales Tax?” preference is set to Yes within QuickBooks, the default value of `is_taxable` is true.
   */
  is_taxable: boolean;
  /**
   * For future use with international versions of QuickBooks.
   */
  item_purchase_tax_ref?: CurrencyRef;
  /**
   * An ItemSalesTax entry represents one tax rate paid to one tax agency. Use it when a transaction needs a single tax calculation. For multi-rate scenarios, use a sales-tax group instead. If both `full_name` and `list_id` are provided for `item_sales_tax_ref`, `list_id` is used.
   */
  item_sales_tax_ref?: CurrencyRef;
  /**
   * Short name that will appear on sales forms to identify the tax status of an item. The Desc element gives a longer explanation of Name. Name must be unique, and it isn’t case-sensitive.
   */
  name: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `sales_tax_code.query`: List sales tax codes.
 */
export interface SalesTaxCodeQueryParams {
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
  include_ret_element?: Array<"Desc" | "EditSequence" | "IsActive" | "IsTaxable" | "ItemPurchaseTaxRef" | "ItemSalesTaxRef" | "ListID" | "Name" | "TimeCreated" | "TimeModified">;
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
 * The params of `sales_tax_code.update`: Update sales tax code.
 */
export interface SalesTaxCodeUpdateParams {
  /**
   * Desc gives a longer explanation of Name.
   */
  desc?: string;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  include_ret_element?: Array<"Desc" | "EditSequence" | "ExternalGUID" | "IsActive" | "IsTaxable" | "ItemPurchaseTaxRef" | "ItemSalesTaxRef" | "ListID" | "Name" | "OwnerID" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Indicates whether this sales-tax code is tracking taxable sales. For any particular sales-tax code, `is_taxable` can’t be modified once the sales-tax code has been used in a transaction. If the “Do You Charge Sales Tax?” preference is set to Yes within QuickBooks, the default value of `is_taxable` is true.
   */
  is_taxable?: boolean;
  /**
   * For future use with international versions of QuickBooks.
   */
  item_purchase_tax_ref?: CurrencyRef;
  /**
   * An ItemSalesTax entry represents one tax rate paid to one tax agency. Use it when a transaction needs a single tax calculation. For multi-rate scenarios, use a sales-tax group instead. If both `full_name` and `list_id` are provided for `item_sales_tax_ref`, `list_id` is used.
   */
  item_sales_tax_ref?: CurrencyRef;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id: string;
  /**
   * Short name that will appear on sales forms to identify the tax status of an item. The Desc element gives a longer explanation of Name. Name must be unique, and it isn’t case-sensitive.
   */
  name?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
