// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, Address, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks other name operations: `qube.otherName.<action>(connectionId, params, { webhookUrl })`. */
export declare class OtherName {
  constructor(client: Client);
  /**
   * Create other name: `POST /connections/{connection_id}/other-names`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_number`, `alt_contact`, `alt_phone`, `company_name`, `contact`, `email`, `external_guid`, `fax`, `first_name`, `include_ret_element`, `is_active`, `last_name`, `middle_name`, `name` (required), `notes`, `other_name_address`, `phone`, `request_id`, `salutation`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/other-names/create-other-name
   */
  create(connectionId: string, params: OtherNameCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List other names: `GET /connections/{connection_id}/other-names`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `owner_id`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/other-names/list-other-names
   */
  query(connectionId: string, params: OtherNameQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update other name: `PUT /connections/{connection_id}/other-names`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_number`, `alt_contact`, `alt_phone`, `company_name`, `contact`, `edit_sequence` (required), `email`, `fax`, `first_name`, `include_ret_element`, `is_active`, `last_name`, `list_id` (required), `middle_name`, `name`, `notes`, `other_name_address`, `phone`, `request_id`, `salutation`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/other-names/update-other-name
   */
  update(connectionId: string, params: OtherNameUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `other_name.create`: Create other name.
 */
export interface OtherNameCreateParams {
  /**
   * Account numbers appear in the QuickBooks chart of accounts, Account fields, and reports and graphs. If the IsUsingAccountNumber preference is false (that is, if the QuickBooks user has the account numbers Preference turned off), you can still set account numbers through the SDK, but the numbers won’t be visible in the user interface.
   */
  account_number?: string;
  /**
   * The name of an alternate contact person for a vendor, customer, or “other name” entry.
   */
  alt_contact?: string;
  /**
   * A telephone number given as an alternative to Phone.
   */
  alt_phone?: string;
  /**
   * The name of the QuickBooks user’s business, as specified in QuickBooks. `company_name` and Address are used on invoices, checks, and other forms. (LegalCompanyName and LegalAddress, on the other hand, are used on a company’s tax forms and pay stubs.)
   */
  company_name?: string;
  /**
   * The name of a contact person for a customer or vendor.
   */
  contact?: string;
  /**
   * E-mail address.
   */
  email?: string;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  /**
   * Fax number.
   */
  fax?: string;
  /**
   * The first name of a customer, vendor, employee, or person on the “other names” list.
   */
  first_name?: string;
  include_ret_element?: Array<"AccountNumber" | "AltContact" | "AltPhone" | "CompanyName" | "Contact" | "DataExtRet" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "FirstName" | "IsActive" | "LastName" | "ListID" | "MiddleName" | "Name" | "Notes" | "OtherNameAddress" | "OtherNameAddressBlock" | "OwnerID" | "Phone" | "Salutation" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * The last name of a customer, vendor, employee, or person on the “other names” list.
   */
  last_name?: string;
  /**
   * The middle name of a customer, vendor, employee, or person on the “other names” list.
   */
  middle_name?: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because FullName remains distinct.
   */
  name: string;
  /**
   * Additional information.
   */
  notes?: string;
  /**
   * If an address request fails, some combination of address fields might be too long.
   */
  other_name_address?: Address;
  /**
   * The telephone number.
   */
  phone?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
}

/**
 * The params of `other_name.query`: List other names.
 */
export interface OtherNameQueryParams {
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
  include_ret_element?: Array<"AccountNumber" | "AltContact" | "AltPhone" | "CompanyName" | "Contact" | "DataExtRet" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "FirstName" | "IsActive" | "LastName" | "ListID" | "MiddleName" | "Name" | "Notes" | "OtherNameAddress" | "OtherNameAddressBlock" | "Phone" | "Salutation" | "TimeCreated" | "TimeModified">;
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
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `other_name.update`: Update other name.
 */
export interface OtherNameUpdateParams {
  /**
   * Account numbers appear in the QuickBooks chart of accounts, Account fields, and reports and graphs. If the IsUsingAccountNumber preference is false (that is, if the QuickBooks user has the account numbers Preference turned off), you can still set account numbers through the SDK, but the numbers won’t be visible in the user interface.
   */
  account_number?: string;
  /**
   * The name of an alternate contact person for a vendor, customer, or “other name” entry.
   */
  alt_contact?: string;
  /**
   * A telephone number given as an alternative to Phone.
   */
  alt_phone?: string;
  /**
   * The name of the QuickBooks user’s business, as specified in QuickBooks. `company_name` and Address are used on invoices, checks, and other forms. (LegalCompanyName and LegalAddress, on the other hand, are used on a company’s tax forms and pay stubs.)
   */
  company_name?: string;
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
  /**
   * The first name of a customer, vendor, employee, or person on the “other names” list.
   */
  first_name?: string;
  include_ret_element?: Array<"AccountNumber" | "AltContact" | "AltPhone" | "CompanyName" | "Contact" | "DataExtRet" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "FirstName" | "IsActive" | "LastName" | "ListID" | "MiddleName" | "Name" | "Notes" | "OtherNameAddress" | "OtherNameAddressBlock" | "OwnerID" | "Phone" | "Salutation" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * The last name of a customer, vendor, employee, or person on the “other names” list.
   */
  last_name?: string;
  /**
   * `list_id` and FullName both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both FullName and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores FullName.
   */
  list_id: string;
  /**
   * The middle name of a customer, vendor, employee, or person on the “other names” list.
   */
  middle_name?: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because FullName remains distinct.
   */
  name?: string;
  /**
   * Additional information.
   */
  notes?: string;
  /**
   * If an address request fails, some combination of address fields might be too long.
   */
  other_name_address?: Address;
  /**
   * The telephone number.
   */
  phone?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
}
