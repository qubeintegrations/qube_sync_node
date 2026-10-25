// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AdditionalContactRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks lead operations: `qube.lead.<action>(connectionId, params, { webhookUrl })`. */
export declare class Lead {
  constructor(client: Client);
  /**
   * Create lead: `POST /connections/{connection_id}/leads`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `additional_contact_ref`, `company_name`, `full_name` (required), `include_ret_element`, `lead_contacts`, `locations`, `main_phone`, `request_id`, `status`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/leads/create-lead
   */
  create(connectionId: string, params: LeadCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List leads: `GET /connections/{connection_id}/leads`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `from_modified_date`, `include_ret_element`, `iterator`, `list_id`, `max_returned`, `meta_data`, `name`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/leads/list-leads
   */
  query(connectionId: string, params: LeadQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update lead: `PUT /connections/{connection_id}/leads`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `additional_contact_ref`, `company_name`, `edit_sequence` (required), `full_name` (required), `include_ret_element`, `lead_contacts_mod`, `list_id` (required), `locations_mod`, `main_phone`, `request_id`, `status`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/leads/update-lead
   */
  update(connectionId: string, params: LeadUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `lead.create`: Create lead.
 */
export interface LeadCreateParams {
  additional_contact_ref?: AdditionalContactRef[];
  /**
   * The name of the QuickBooks user’s business, as specified in QuickBooks. `company_name` and Address are used on invoices, checks, and other forms. (LegalCompanyName and LegalAddress, on the other hand, are used on a company’s tax forms and pay stubs.)
   */
  company_name?: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   */
  full_name: string;
  include_ret_element?: Array<"AdditionalContactRef" | "CompanyName" | "EditSequence" | "ExternalGUID" | "FullName" | "LeadContactsRet" | "ListID" | "LocationsRet" | "MainPhone" | "OwnerID" | "Status" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  lead_contacts?: LeadContacts[];
  locations?: Locations[];
  /**
   * The main phone number.
   */
  main_phone?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The status of the lead.
   */
  status?: "Cold" | "Hot" | "Warm";
}

/**
 * The params of `lead.query`: List leads.
 */
export interface LeadQueryParams {
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `name`, or the set (`from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  include_ret_element?: Array<"AdditionalContactRef" | "CompanyName" | "EditSequence" | "FullName" | "LeadContactsRet" | "ListID" | "LocationsRet" | "MainPhone" | "Status" | "TimeCreated" | "TimeModified">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `list_id` or `name` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `name`, or the set (`from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `list_id`, or `name`, or the set (`from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * The string to match.
   *
   * Choose at most one of: `list_id`, or `name`, or the set (`from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name?: string[];
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `name`, or the set (`from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `name`, or the set (`from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_range_filter?: NameRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters results to objects modified on or before this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to end-of-day (23:59:59).
   *
   * Choose at most one of: `list_id`, or `name`, or the set (`from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `lead.update`: Update lead.
 */
export interface LeadUpdateParams {
  additional_contact_ref?: AdditionalContactRef[];
  /**
   * The name of the QuickBooks user’s business, as specified in QuickBooks. `company_name` and Address are used on invoices, checks, and other forms. (LegalCompanyName and LegalAddress, on the other hand, are used on a company’s tax forms and pay stubs.)
   */
  company_name?: string;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   */
  full_name: string;
  include_ret_element?: Array<"AdditionalContactRef" | "CompanyName" | "EditSequence" | "ExternalGUID" | "FullName" | "LeadContactsRet" | "ListID" | "LocationsRet" | "MainPhone" | "OwnerID" | "Status" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber">;
  lead_contacts_mod?: LeadContactsMod[];
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   */
  list_id: string;
  locations_mod?: LocationsMod[];
  /**
   * The main phone number.
   */
  main_phone?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The status of the lead.
   */
  status?: "Cold" | "Hot" | "Warm";
}

export interface LeadAddress {
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
}

export interface LeadContacts {
  additional_contact_ref?: AdditionalContactRef[];
  /**
   * The first name of a customer, vendor, employee, or person on the “other names” list.
   */
  first_name: string;
  /**
   * Flag for if this is a primary contact on a lead.
   */
  is_primary_contact?: boolean;
  /**
   * The job title of a customer, vendor, employee, or person on the “other names” list.
   */
  job_title?: string;
  /**
   * The last name of a customer, vendor, employee, or person on the “other names” list.
   */
  last_name?: string;
  /**
   * The middle name of a customer, vendor, employee, or person on the “other names” list.
   */
  middle_name?: string;
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
}

export interface LeadContactsMod {
  additional_contact_ref?: AdditionalContactRef[];
  /**
   * The first name of a customer, vendor, employee, or person on the “other names” list.
   */
  first_name: string;
  /**
   * Flag for if this is a primary contact on a lead.
   */
  is_primary_contact?: boolean;
  /**
   * The job title of a customer, vendor, employee, or person on the “other names” list.
   */
  job_title?: string;
  /**
   * The last name of a customer, vendor, employee, or person on the “other names” list.
   */
  last_name?: string;
  /**
   * `lead_contact_id` is a way to identify a lead contact object. When a lead contact object is added to QuickBooks through the SDK or through the QuickBooks user interface, the server assigns it a `lead_contact_id`.
   */
  lead_contact_id?: number;
  /**
   * The middle name of a customer, vendor, employee, or person on the “other names” list.
   */
  middle_name?: string;
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
}

export interface Locations {
  /**
   * Address for the lead.
   */
  lead_address?: LeadAddress;
  /**
   * Where the asset is located or has been placed into service.
   */
  location: string;
}

export interface LocationsMod {
  /**
   * Address for the lead.
   */
  lead_address?: LeadAddress;
  /**
   * Where the asset is located or has been placed into service.
   */
  location: string;
  /**
   * `location_id` is a way to identify a location object. When a location object is added to QuickBooks through the SDK or through the QuickBooks user interface, the server assigns it a `location_id`.
   */
  location_id: number;
}
