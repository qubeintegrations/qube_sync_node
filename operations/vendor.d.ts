// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AccountFilter, AdditionalContactRef, Contacts, ContactsMod, CurrencyFilter, CurrencyRef, NameFilter, NameRangeFilter, ShipAddress } from "./types";

/** QuickBooks vendor operations: `qube.vendor.<action>(connectionId, params, { webhookUrl })`. */
export declare class Vendor {
  constructor(client: Client);
  /**
   * Create vendor: `POST /connections/{connection_id}/vendors`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_number`, `additional_contact_ref`, `additional_notes`, `alt_contact`, `alt_phone`, `billing_rate_ref`, `cc`, `class_ref`, `company_name`, `contact`, `contacts`, `credit_limit`, `currency_ref`, `email`, `external_guid`, `fax`, `first_name`, `include_ret_element`, `is_active`, `is_sales_tax_agency`, `is_tax_on_tax`, `is_tax_tracked_on_purchases`, `is_tax_tracked_on_sales`, `is_vendor_eligible_for1099`, `job_title`, `last_name`, `middle_name`, `mobile`, `name` (required), `name_on_check`, `notes`, `open_balance`, `open_balance_date`, `pager`, `phone`, `prefill_account_ref`, `reporting_period`, `request_id`, `sales_tax_code_ref`, `sales_tax_country`, `sales_tax_return_ref`, `salutation`, `ship_address`, `suffix`, `tax_on_purchases_account_ref`, `tax_on_sales_account_ref`, `tax_registration_number`, `terms_ref`, `vendor_address`, `vendor_tax_ident`, `vendor_type_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/vendors/create-vendor
   */
  create(connectionId: string, params: VendorCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List vendors: `GET /connections/{connection_id}/vendors`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `full_name`, `include_ret_element`, `iterator`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `owner_id`, `request_id`, `to_modified_date`, `total_balance_filter`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/vendors/list-vendors
   */
  query(connectionId: string, params: VendorQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update vendor: `PUT /connections/{connection_id}/vendors`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_number`, `additional_contact_ref`, `additional_notes_mod`, `alt_contact`, `alt_phone`, `billing_rate_ref`, `cc`, `class_ref`, `company_name`, `contact`, `contacts_mod`, `credit_limit`, `currency_ref`, `edit_sequence` (required), `email`, `fax`, `first_name`, `include_ret_element`, `is_active`, `is_sales_tax_agency`, `is_tax_on_tax`, `is_tax_tracked_on_purchases`, `is_tax_tracked_on_sales`, `is_vendor_eligible_for1099`, `job_title`, `last_name`, `list_id` (required), `middle_name`, `mobile`, `name`, `name_on_check`, `notes`, `pager`, `phone`, `prefill_account_ref`, `reporting_period`, `request_id`, `sales_tax_code_ref`, `sales_tax_country`, `sales_tax_return_ref`, `salutation`, `ship_address`, `suffix`, `tax_on_purchases_account_ref`, `tax_on_sales_account_ref`, `tax_registration_number`, `terms_ref`, `vendor_address`, `vendor_tax_ident`, `vendor_type_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/vendors/update-vendor
   */
  update(connectionId: string, params: VendorUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `vendor.create`: Create vendor.
 */
export interface VendorCreateParams {
  /**
   * Account numbers appear in the QuickBooks chart of accounts, Account fields, and reports and graphs. If the IsUsingAccountNumber preference is false (that is, if the QuickBooks user has the account numbers Preference turned off), you can still set account numbers through the SDK, but the numbers won’t be visible in the user interface.
   */
  account_number?: string;
  additional_contact_ref?: AdditionalContactRef[];
  additional_notes?: AdditionalNotesVendor[];
  /**
   * The name of an alternate contact person for a vendor, customer, or “other name” entry.
   */
  alt_contact?: string;
  /**
   * A telephone number given as an alternative to Phone.
   */
  alt_phone?: string;
  /**
   * Billing rates are used to override the service item rate in a time transaction (TimeTrackingAdd) based on the employee or vendor performing the work. Billing rates are assigned to an employee or a vendor to specify overrides to service items.
   */
  billing_rate_ref?: CurrencyRef;
  /**
   * Email address that would be carbon copied or CC.
   */
  cc?: string;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * The name of the QuickBooks user’s business, as specified in QuickBooks. `company_name` and Address are used on invoices, checks, and other forms. (LegalCompanyName and LegalAddress, on the other hand, are used on a company’s tax forms and pay stubs.)
   */
  company_name?: string;
  /**
   * The name of a contact person for a customer or vendor.
   */
  contact?: string;
  contacts?: Contacts[];
  /**
   * Set and returned as a positive number that indicates a customer’s or vendor’s credit limit. If no value has been defined, there is no credit limit.
   */
  credit_limit?: number;
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
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
  include_ret_element?: Array<"AccountNumber" | "AdditionalContactRef" | "AdditionalNotesRet" | "AltContact" | "AltPhone" | "Balance" | "BillingRateRef" | "Cc" | "ClassRef" | "CompanyName" | "Contact" | "ContactsRet" | "CreditLimit" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "FirstName" | "IsActive" | "IsSalesTaxAgency" | "IsTaxAgency" | "IsTaxOnTax" | "IsTaxTrackedOnPurchases" | "IsTaxTrackedOnSales" | "IsVendorEligibleFor1099" | "JobTitle" | "LastName" | "ListID" | "MiddleName" | "Mobile" | "Name" | "NameOnCheck" | "Notes" | "OwnerID" | "Pager" | "Phone" | "PrefillAccountRef" | "ReportingPeriod" | "SalesTaxCodeRef" | "SalesTaxCountry" | "SalesTaxReturnRef" | "Salutation" | "ShipAddress" | "Suffix" | "TaxOnPurchasesAccountRef" | "TaxOnSalesAccountRef" | "TaxRegistrationNumber" | "TermsRef" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "VendorAddress" | "VendorAddressBlock" | "VendorTaxIdent" | "VendorTypeRef">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Indicates whether the entity is a sales tax agency.
   */
  is_sales_tax_agency?: boolean;
  /**
   * For vendor in CA or UK, is there tax charged on top of tax.
   */
  is_tax_on_tax?: boolean;
  /**
   * This flag is used for CA or UK and whether tax is tracked on purchases.
   */
  is_tax_tracked_on_purchases?: boolean;
  /**
   * This flag is used for CA or UK and whether tax is tracked on sales.
   */
  is_tax_tracked_on_sales?: boolean;
  /**
   * If `is_vendor_eligible_for1099` is set to true, `vendor_tax_ident` and `vendor_address` are required in a vendor add request message. Otherwise, `vendor_tax_ident` and `vendor_address` are optional.
   */
  is_vendor_eligible_for1099?: boolean;
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
  mobile?: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name: string;
  /**
   * The vendor’s name as it will appear on checks sent to the vendor. (Corresponds in the QuickBooks user interface to the “Print on Check as” field of the Edit Vendor and New Vendor windows.)
   */
  name_on_check?: string;
  /**
   * Additional information about this vendor.
   */
  notes?: string;
  /**
   * The opening balance of this vendor’s account. A positive number indicates money owed to this vendor.
   */
  open_balance?: number;
  /**
   * The date of the opening balance for this vendor.
   *
   * Format: date.
   */
  open_balance_date?: string;
  pager?: string;
  /**
   * The telephone number.
   */
  phone?: string;
  prefill_account_ref?: CurrencyRef[];
  /**
   * Vendor reporting period for CA or UK. This can be monthly or quarterly.
   */
  reporting_period?: "Monthly" | "Quarterly";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * The country that sales tax is collected for.
   */
  sales_tax_country?: "Australia" | "Canada" | "UK" | "US";
  /**
   * Sales tax return information.
   */
  sales_tax_return_ref?: CurrencyRef;
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in ShipAddressBlock or BillAddressBlock.
   */
  ship_address?: ShipAddress;
  suffix?: string;
  /**
   * Account used for taxes on purchases in CA or UK.
   */
  tax_on_purchases_account_ref?: CurrencyRef;
  /**
   * Account used for taxes on sales in CA or UK.
   */
  tax_on_sales_account_ref?: CurrencyRef;
  /**
   * The tax registration number used in CA and UK.
   */
  tax_registration_number?: string;
  /**
   * Refers to the payment terms associated with this entity. (This will be an item on the DateDrivenTerms or StandardTerms list.) If a `terms_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  terms_ref?: CurrencyRef;
  /**
   * If an address request fails, some combination of address fields might be too long.
   */
  vendor_address?: ShipAddress;
  /**
   * A character string that identifies a vendor.
   */
  vendor_tax_ident?: string;
  /**
   * Vendor types allow business owners to categorize vendors in ways that are meaningful for their businesses. For example, a vendor type might indicate which industry a vendor represents, or which part of the country a vendor is in. A `vendor_type_ref` aggregate refers to one of the types on the VendorType list.
   */
  vendor_type_ref?: CurrencyRef;
}

/**
 * The params of `vendor.query`: List vendors.
 */
export interface VendorQueryParams {
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * Filter according to class.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
   */
  class_filter?: AccountFilter;
  /**
   * Filters by the specified currency.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
   */
  currency_filter?: CurrencyFilter;
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"AccountNumber" | "AdditionalContactRef" | "AdditionalNotesRet" | "AltContact" | "AltPhone" | "Balance" | "BillingRateRef" | "Cc" | "ClassRef" | "CompanyName" | "Contact" | "ContactsRet" | "CreditLimit" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "FirstName" | "IsActive" | "IsSalesTaxAgency" | "IsTaxAgency" | "IsTaxOnTax" | "IsTaxTrackedOnPurchases" | "IsTaxTrackedOnSales" | "IsVendorEligibleFor1099" | "JobTitle" | "LastName" | "ListID" | "MiddleName" | "Mobile" | "Name" | "NameOnCheck" | "Notes" | "Pager" | "Phone" | "PrefillAccountRef" | "ReportingPeriod" | "SalesTaxCodeRef" | "SalesTaxCountry" | "SalesTaxReturnRef" | "Salutation" | "ShipAddress" | "Suffix" | "TaxOnPurchasesAccountRef" | "TaxOnSalesAccountRef" | "TaxRegistrationNumber" | "TermsRef" | "TimeCreated" | "TimeModified" | "VendorAddress" | "VendorAddressBlock" | "VendorTaxIdent" | "VendorTypeRef">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `full_name` or `list_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
  /**
   * Filters according to total balance. Total balance includes the balance for all subaccounts; for example, a customer’s TotalBalance would include all the jobs for that customer.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `class_filter`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`, `total_balance_filter`). Members of a set combine with each other, not with the other choices.
   */
  total_balance_filter?: TotalBalanceFilter;
}

/**
 * The params of `vendor.update`: Update vendor.
 */
export interface VendorUpdateParams {
  /**
   * Account numbers appear in the QuickBooks chart of accounts, Account fields, and reports and graphs. If the IsUsingAccountNumber preference is false (that is, if the QuickBooks user has the account numbers Preference turned off), you can still set account numbers through the SDK, but the numbers won’t be visible in the user interface.
   */
  account_number?: string;
  additional_contact_ref?: AdditionalContactRef[];
  additional_notes_mod?: AdditionalNotesModVendor[];
  /**
   * The name of an alternate contact person for a vendor, customer, or “other name” entry.
   */
  alt_contact?: string;
  /**
   * A telephone number given as an alternative to Phone.
   */
  alt_phone?: string;
  /**
   * Billing rates are used to override the service item rate in a time transaction (TimeTrackingAdd) based on the employee or vendor performing the work. Billing rates are assigned to an employee or a vendor to specify overrides to service items.
   */
  billing_rate_ref?: CurrencyRef;
  /**
   * Email address that would be carbon copied or CC.
   */
  cc?: string;
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * The name of the QuickBooks user’s business, as specified in QuickBooks. `company_name` and Address are used on invoices, checks, and other forms. (LegalCompanyName and LegalAddress, on the other hand, are used on a company’s tax forms and pay stubs.)
   */
  company_name?: string;
  /**
   * The name of a contact person for a customer or vendor.
   */
  contact?: string;
  contacts_mod?: ContactsMod[];
  /**
   * Set and returned as a positive number that indicates a customer’s or vendor’s credit limit. If no value has been defined, there is no credit limit.
   */
  credit_limit?: number;
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
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
  include_ret_element?: Array<"AccountNumber" | "AdditionalContactRef" | "AdditionalNotesRet" | "AltContact" | "AltPhone" | "Balance" | "BillingRateRef" | "Cc" | "ClassRef" | "CompanyName" | "Contact" | "ContactsRet" | "CreditLimit" | "CurrencyRef" | "DataExtRet" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "FirstName" | "IsActive" | "IsSalesTaxAgency" | "IsTaxAgency" | "IsTaxOnTax" | "IsTaxTrackedOnPurchases" | "IsTaxTrackedOnSales" | "IsVendorEligibleFor1099" | "JobTitle" | "LastName" | "ListID" | "MiddleName" | "Mobile" | "Name" | "NameOnCheck" | "Notes" | "OwnerID" | "Pager" | "Phone" | "PrefillAccountRef" | "ReportingPeriod" | "SalesTaxCodeRef" | "SalesTaxCountry" | "SalesTaxReturnRef" | "Salutation" | "ShipAddress" | "Suffix" | "TaxOnPurchasesAccountRef" | "TaxOnSalesAccountRef" | "TaxRegistrationNumber" | "TermsRef" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "VendorAddress" | "VendorAddressBlock" | "VendorTaxIdent" | "VendorTypeRef">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Indicates whether the entity is a sales tax agency.
   */
  is_sales_tax_agency?: boolean;
  /**
   * For vendor in CA or UK, is there tax charged on top of tax.
   */
  is_tax_on_tax?: boolean;
  /**
   * This flag is used for CA or UK and whether tax is tracked on purchases.
   */
  is_tax_tracked_on_purchases?: boolean;
  /**
   * This flag is used for CA or UK and whether tax is tracked on sales.
   */
  is_tax_tracked_on_sales?: boolean;
  /**
   * If `is_vendor_eligible_for1099` is set to true, `vendor_tax_ident` and `vendor_address` are required in a vendor add request message. Otherwise, `vendor_tax_ident` and `vendor_address` are optional.
   */
  is_vendor_eligible_for1099?: boolean;
  /**
   * The job title of a customer, vendor, employee, or person on the “other names” list.
   */
  job_title?: string;
  /**
   * The last name of a customer, vendor, employee, or person on the “other names” list.
   */
  last_name?: string;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   */
  list_id: string;
  /**
   * The middle name of a customer, vendor, employee, or person on the “other names” list.
   */
  middle_name?: string;
  mobile?: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name?: string;
  /**
   * The vendor’s name as it will appear on checks sent to the vendor. (Corresponds in the QuickBooks user interface to the “Print on Check as” field of the Edit Vendor and New Vendor windows.)
   */
  name_on_check?: string;
  /**
   * Additional information about this vendor.
   */
  notes?: string;
  pager?: string;
  /**
   * The telephone number.
   */
  phone?: string;
  prefill_account_ref?: CurrencyRef[];
  /**
   * Vendor reporting period for CA or UK. This can be monthly or quarterly.
   */
  reporting_period?: "Monthly" | "Quarterly";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * The country that sales tax is collected for.
   */
  sales_tax_country?: "Australia" | "Canada" | "UK" | "US";
  /**
   * Sales tax return information.
   */
  sales_tax_return_ref?: CurrencyRef;
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in ShipAddressBlock or BillAddressBlock.
   */
  ship_address?: ShipAddress;
  suffix?: string;
  /**
   * Account used for taxes on purchases in CA or UK.
   */
  tax_on_purchases_account_ref?: CurrencyRef;
  /**
   * Account used for taxes on sales in CA or UK.
   */
  tax_on_sales_account_ref?: CurrencyRef;
  /**
   * The tax registration number used in CA and UK.
   */
  tax_registration_number?: string;
  /**
   * Refers to the payment terms associated with this entity. (This will be an item on the DateDrivenTerms or StandardTerms list.) If a `terms_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  terms_ref?: CurrencyRef;
  /**
   * If an address request fails, some combination of address fields might be too long.
   */
  vendor_address?: ShipAddress;
  /**
   * A character string that identifies a vendor.
   */
  vendor_tax_ident?: string;
  /**
   * Vendor types allow business owners to categorize vendors in ways that are meaningful for their businesses. For example, a vendor type might indicate which industry a vendor represents, or which part of the country a vendor is in. A `vendor_type_ref` aggregate refers to one of the types on the VendorType list.
   */
  vendor_type_ref?: CurrencyRef;
}

export interface AdditionalNotesModVendor {
  /**
   * In a BillAddress or `ship_address` aggregate, the Note field value is written at the bottom of the address in the form in which it appears, such as the invoice form.
   */
  note: string;
  /**
   * The ID of the note.
   */
  note_id: number;
}

export interface AdditionalNotesVendor {
  /**
   * In a BillAddress or `ship_address` aggregate, the Note field value is written at the bottom of the address in the form in which it appears, such as the invoice form.
   */
  note: string;
}

export interface TotalBalanceFilter {
  /**
   * The monetary amount to which Operator refers.
   */
  amount: number;
  /**
   * Indicates whether to filter for amounts that are less than, equal to or less than, exactly equal to, greater than, or equal to or greater than the given Amount.
   */
  operator: "Equal" | "GreaterThan" | "GreaterThanEqual" | "LessThan" | "LessThanEqual";
}
