// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks inventory site operations: `qube.inventorySite.<action>(connectionId, params, { webhookUrl })`. */
export declare class InventorySite {
  constructor(client: Client);
  /**
   * Create inventory site: `POST /connections/{connection_id}/inventory-sites`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `contact`, `email`, `fax`, `include_ret_element`, `is_active`, `name` (required), `parent_site_ref`, `phone`, `request_id`, `site_address`, `site_desc`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/inventory-sites/create-inventory-site
   */
  create(connectionId: string, params: InventorySiteCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List inventory sites: `GET /connections/{connection_id}/inventory-sites`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/inventory-sites/list-inventory-sites
   */
  query(connectionId: string, params: InventorySiteQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update inventory site: `PUT /connections/{connection_id}/inventory-sites`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `contact`, `edit_sequence` (required), `email`, `fax`, `include_ret_element`, `is_active`, `list_id` (required), `name`, `parent_site_ref`, `phone`, `request_id`, `site_address`, `site_desc`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/inventory-sites/update-inventory-site
   */
  update(connectionId: string, params: InventorySiteUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `inventory_site.create`: Create inventory site.
 */
export interface InventorySiteCreateParams {
  /**
   * The name of a contact person for a customer or vendor.
   */
  contact?: string;
  /**
   * E-mail address.
   */
  email?: string;
  /**
   * Fax number.
   */
  fax?: string;
  include_ret_element?: Array<"Contact" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "IsActive" | "IsDefaultSite" | "ListID" | "Name" | "OwnerID" | "ParentSiteRef" | "Phone" | "SiteAddress" | "SiteAddressBlock" | "SiteDesc" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name: string;
  /**
   * A reference to the list object that is one level above this one. For example, an inventory item with the `full_name` of GermanCars:Mercedes-Benz:CL500I99AA might have a parent object with the `full_name` of GermanCars:Mercedes-Benz. In a request, if a ParentRef aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  parent_site_ref?: CurrencyRef;
  /**
   * The telephone number.
   */
  phone?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in ShipAddressBlock or BillAddressBlock.
   */
  site_address?: SiteAddress;
  /**
   * Description of the site.
   */
  site_desc?: string;
}

/**
 * The params of `inventory_site.query`: List inventory sites.
 */
export interface InventorySiteQueryParams {
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"Contact" | "EditSequence" | "Email" | "Fax" | "IsActive" | "IsDefaultSite" | "ListID" | "Name" | "ParentSiteRef" | "Phone" | "SiteAddress" | "SiteAddressBlock" | "SiteDesc" | "TimeCreated" | "TimeModified">;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_range_filter?: NameRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters results to objects modified on or before this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to end-of-day (23:59:59).
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `inventory_site.update`: Update inventory site.
 */
export interface InventorySiteUpdateParams {
  /**
   * The name of a contact person for a customer or vendor.
   */
  contact?: string;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * E-mail address.
   */
  email?: string;
  /**
   * Fax number.
   */
  fax?: string;
  include_ret_element?: Array<"Contact" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "IsActive" | "IsDefaultSite" | "ListID" | "Name" | "OwnerID" | "ParentSiteRef" | "Phone" | "SiteAddress" | "SiteAddressBlock" | "SiteDesc" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   */
  list_id: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name?: string;
  /**
   * A reference to the list object that is one level above this one. For example, an inventory item with the `full_name` of GermanCars:Mercedes-Benz:CL500I99AA might have a parent object with the `full_name` of GermanCars:Mercedes-Benz. In a request, if a ParentRef aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  parent_site_ref?: CurrencyRef;
  /**
   * The telephone number.
   */
  phone?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in ShipAddressBlock or BillAddressBlock.
   */
  site_address?: SiteAddress;
  /**
   * Description of the site.
   */
  site_desc?: string;
}

export interface SiteAddress {
  /**
   * The first line of an address.
   */
  addr1?: string;
  /**
   * The second line of an address (if a second line is needed).
   */
  addr2?: string;
  /**
   * The third line of an address (if a third line is needed).
   */
  addr3?: string;
  /**
   * The fourth line of an address (if a fourth line is needed).
   */
  addr4?: string;
  /**
   * The fifth line of an address (if a fifth line is needed).
   */
  addr5?: string;
  /**
   * The city name in an address.
   */
  city?: string;
  /**
   * The country name in an address, or, in returned Host information (HostRet or HostInfo), the country for which this edition of QuickBooks was designed. (Possible values are US, CA, UK, and AU.)
   */
  country?: string;
  /**
   * The postal code in an address.
   */
  postal_code?: string;
  /**
   * The state name in an address.
   */
  state?: string;
}
