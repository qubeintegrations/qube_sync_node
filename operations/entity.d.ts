// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks entity operations: `qube.entity.<action>(connectionId, params, { webhookUrl })`. */
export declare class Entity {
  constructor(client: Client);
  /**
   * List entities: `GET /connections/{connection_id}/entities`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `iterator`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/entities/list-entities
   */
  query(connectionId: string, params: EntityQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `entity.query`: List entities.
 */
export interface EntityQueryParams {
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
  include_ret_element?: Array<"AccountNumber" | "AdditionalContactRef" | "AdditionalNotesRet" | "AdjustedServiceDate" | "AltContact" | "AltPhone" | "Balance" | "BillAddress" | "BillAddressBlock" | "BillingRateRef" | "BirthDate" | "Cc" | "ClassRef" | "CompanyName" | "Contact" | "ContactsRet" | "CreditCardInfo" | "CreditLimit" | "CurrencyRef" | "CustomerTypeRef" | "DataExtRet" | "DeliveryMethod" | "Department" | "Description" | "DisabilityDesc" | "Disabled" | "EditSequence" | "Email" | "EmergencyContacts" | "EmployeeAddress" | "EmployeePayrollInfo" | "EmployeeType" | "Ethnicity" | "Exempt" | "ExternalGUID" | "Fax" | "FirstName" | "FullName" | "Gender" | "HiredDate" | "IsActive" | "IsSalesTaxAgency" | "IsStatementWithParent" | "IsTaxAgency" | "IsTaxOnTax" | "IsTaxTrackedOnPurchases" | "IsTaxTrackedOnSales" | "IsVendorEligibleFor1099" | "ItemSalesTaxRef" | "JobDesc" | "JobEndDate" | "JobProjectedEndDate" | "JobStartDate" | "JobStatus" | "JobTitle" | "JobTypeRef" | "KeyEmployee" | "LastName" | "ListID" | "MiddleName" | "MilitaryStatus" | "Mobile" | "Name" | "NameOnCheck" | "Notes" | "OnFile" | "OriginalHireDate" | "OtherNameAddress" | "OtherNameAddressBlock" | "Pager" | "PagerPIN" | "ParentRef" | "PartOrFullTime" | "Phone" | "PreferredDeliveryMethod" | "PreferredPaymentMethodRef" | "PrefillAccountRef" | "PriceLevelRef" | "PrintAs" | "ReleasedDate" | "ReportingPeriod" | "ResaleNumber" | "SSN" | "SalesRepRef" | "SalesTaxCodeRef" | "SalesTaxCountry" | "SalesTaxReturnRef" | "Salutation" | "ShipAddress" | "ShipAddressBlock" | "ShipToAddress" | "Sublevel" | "Suffix" | "SupervisorRef" | "TargetBonus" | "TaxOnPurchasesAccountRef" | "TaxOnSalesAccountRef" | "TaxRegistrationNumber" | "TermsRef" | "TimeCreated" | "TimeModified" | "TotalBalance" | "USCitizen" | "USVeteran" | "VendorAddress" | "VendorAddressBlock" | "VendorTaxIdent" | "VendorTypeRef" | "WorkAuthExpireDate">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `full_name` or `list_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
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
