// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AdditionalContactRef, BillAddress, Contacts, ContactsMod, CurrencyRef } from "./types";

/** QuickBooks customer operations: `qube.customer.<action>(connectionId, params, { webhookUrl })`. */
export declare class Customer {
  constructor(client: Client);
  /**
   * Create customer: `POST /connections/{connection_id}/customers`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_number`, `additional_contact_ref`, `additional_notes`, `alt_contact`, `alt_phone`, `bill_address`, `cc`, `class_ref`, `company_name`, `contact`, `contacts`, `credit_card_info`, `credit_limit`, `currency_ref`, `customer_type_ref`, `delivery_method`, `email`, `external_guid`, `fax`, `first_name`, `include_ret_element`, `is_active`, `is_statement_with_parent`, `item_sales_tax_ref`, `job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, `job_status`, `job_title`, `job_type_ref`, `last_name`, `middle_name`, `mobile`, `name` (required), `notes`, `open_balance`, `open_balance_date`, `pager`, `parent_ref`, `phone`, `preferred_delivery_method`, `preferred_payment_method_ref`, `price_level_ref`, `print_as`, `request_id`, `resale_number`, `sales_rep_ref`, `sales_tax_code_ref`, `sales_tax_country`, `salutation`, `ship_address`, `ship_to_address`, `suffix`, `tax_registration_number`, `terms_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/customers/create-customer
   */
  create(connectionId: string, params: CustomerCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List customers: `GET /connections/{connection_id}/customers`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include`, `iterator`, `list_id`, `max_returned`, `name_contains`, `name_ends_with`, `name_range`, `name_starts_with`, `owner_id`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/customers/list-customers
   */
  query(connectionId: string, params: CustomerQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update customer: `PUT /connections/{connection_id}/customers`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_number`, `additional_contact_ref`, `additional_notes_mod`, `alt_contact`, `alt_phone`, `bill_address`, `cc`, `class_ref`, `company_name`, `contact`, `contacts_mod`, `credit_card_info`, `credit_limit`, `currency_ref`, `customer_type_ref`, `delivery_method`, `edit_sequence` (required), `email`, `fax`, `first_name`, `include_ret_element`, `is_active`, `is_statement_with_parent`, `item_sales_tax_ref`, `job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, `job_status`, `job_title`, `job_type_ref`, `last_name`, `list_id` (required), `middle_name`, `mobile`, `name`, `notes`, `pager`, `parent_ref`, `phone`, `preferred_delivery_method`, `preferred_payment_method_ref`, `price_level_ref`, `print_as`, `request_id`, `resale_number`, `sales_rep_ref`, `sales_tax_code_ref`, `sales_tax_country`, `salutation`, `ship_address`, `ship_to_address`, `suffix`, `tax_registration_number`, `terms_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/customers/update-customer
   */
  update(connectionId: string, params: CustomerUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `customer.create`: Create customer.
 */
export interface CustomerCreateParams {
  /**
   * Account numbers appear in the QuickBooks chart of accounts, Account fields, and reports and graphs. If the IsUsingAccountNumber preference is false (that is, if the QuickBooks user has the account numbers Preference turned off), you can still set account numbers through the SDK, but the numbers won’t be visible in the user interface.
   */
  account_number?: string;
  additional_contact_ref?: AdditionalContactRef[];
  additional_notes?: AdditionalNotes[];
  /**
   * The name of an alternate contact person for a vendor, customer, or “other name” entry.
   */
  alt_contact?: string;
  /**
   * A telephone number given as an alternative to Phone.
   */
  alt_phone?: string;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  bill_address?: BillAddress;
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
   * Customer’s credit-card information.
   */
  credit_card_info?: CreditCardInfo;
  /**
   * Set and returned as a positive number that indicates a customer’s or vendor’s credit limit. If no value has been defined, there is no credit limit.
   */
  credit_limit?: number;
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
  /**
   * Customer types allow business owners to categorize customers in ways that are meaningful for their businesses. For example, a customer type might indicate which industry a customer represents, or which part of the country a customer is in. A `customer_type_ref` aggregate refers to one of the types on the CustomerType list.
   */
  customer_type_ref?: CurrencyRef;
  delivery_method?: "Email" | "Fax" | "Print";
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
  include_ret_element?: Array<"AccountNumber" | "AdditionalContactRef" | "AdditionalNotesRet" | "AltContact" | "AltPhone" | "Balance" | "BillAddress" | "BillAddressBlock" | "Cc" | "ClassRef" | "CompanyName" | "Contact" | "ContactsRet" | "CreditCardInfo" | "CreditLimit" | "CurrencyRef" | "CustomerTypeRef" | "DataExtRet" | "DeliveryMethod" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "FirstName" | "FullName" | "IsActive" | "IsStatementWithParent" | "ItemSalesTaxRef" | "JobDesc" | "JobEndDate" | "JobProjectedEndDate" | "JobStartDate" | "JobStatus" | "JobTitle" | "JobTypeRef" | "LastName" | "ListID" | "MiddleName" | "Mobile" | "Name" | "Notes" | "OwnerID" | "Pager" | "ParentRef" | "Phone" | "PreferredDeliveryMethod" | "PreferredPaymentMethodRef" | "PriceLevelRef" | "PrintAs" | "ResaleNumber" | "SalesRepRef" | "SalesTaxCodeRef" | "SalesTaxCountry" | "Salutation" | "ShipAddress" | "ShipAddressBlock" | "ShipToAddress" | "Sublevel" | "Suffix" | "TaxRegistrationNumber" | "TermsRef" | "TimeCreated" | "TimeModified" | "TotalBalance" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  is_statement_with_parent?: boolean;
  /**
   * An ItemSalesTax entry represents one tax rate paid to one tax agency. Use it when a transaction needs a single tax calculation. For multi-rate scenarios, use a sales-tax group instead. If both `full_name` and `list_id` are provided for `item_sales_tax_ref`, `list_id` is used.
   */
  item_sales_tax_ref?: CurrencyRef;
  /**
   * A short job description for a sub-customer; used in reports. The Job- elements (`job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, and `job_status`) correspond to the fields in the Job Info tab of the Edit Job window in QuickBooks.
   */
  job_desc?: string;
  /**
   * The date on which work for a sub-customer was completed; used in reports. The Job- elements (`job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, and `job_status`) correspond to the fields in the Job Info tab of the Edit Job window in QuickBooks.
   *
   * Format: date.
   */
  job_end_date?: string;
  /**
   * The date on which work for a sub-customer is expected to be complete; used in reports. The Job- elements (`job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, and `job_status`) correspond to the fields in the Job Info tab of the Edit Job window in QuickBooks.
   *
   * Format: date.
   */
  job_projected_end_date?: string;
  /**
   * The date on which work for a sub-customer was started; used in reports. The Job- elements (`job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, and `job_status`) correspond to the fields in the Job Info tab of the Edit Job window in QuickBooks.
   *
   * Format: date.
   */
  job_start_date?: string;
  /**
   * `job_status` Status information about a sub-customer; used in reports. The Job- elements (`job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, and `job_status`) correspond to the fields in the Job Info tab of the Edit Job window in QuickBooks.
   */
  job_status?: "Awarded" | "Closed" | "InProgress" | "None" | "NotAwarded" | "Pending";
  /**
   * The job title of a customer, vendor, employee, or person on the “other names” list.
   */
  job_title?: string;
  /**
   * Job type can be used to separate jobs into any categories that are meaningful to the business. A `job_type_ref` aggregate refers to a job type on the JobType list. In a request, if a `job_type_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  job_type_ref?: CurrencyRef;
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
   * Not supported.
   */
  notes?: string;
  /**
   * The opening balance of this customer’s account. A positive number indicates money owed by the customer.
   */
  open_balance?: number;
  /**
   * The date of the opening balance for this customer.
   *
   * Format: date.
   */
  open_balance_date?: string;
  pager?: string;
  /**
   * A reference to the list object that is one level above this one. For example, an inventory item with the `full_name` of GermanCars:Mercedes-Benz:CL500I99AA might have a parent object with the `full_name` of GermanCars:Mercedes-Benz. In a request, if a `parent_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  parent_ref?: CurrencyRef;
  /**
   * The telephone number.
   */
  phone?: string;
  /**
   * Preference for how invoices are delivered.
   */
  preferred_delivery_method?: "Email" | "Fax" | "None";
  /**
   * Refers to a PaymentMethod object. In a request, if a `preferred_payment_method_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  preferred_payment_method_ref?: CurrencyRef;
  /**
   * Price levels let you apply custom pricing rules for selected customers. Once assigned, QuickBooks uses those prices automatically on supported sales forms unless explicitly overridden.
   */
  price_level_ref?: CurrencyRef;
  print_as?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The customer’s resale number, if they have one. This number won’t affect reports or sales tax calculations.
   */
  resale_number?: string;
  /**
   * A sales representative must be on the Employee, Vendor, or Other Names list within QuickBooks. Sales representative’s names and initials appear on the Rep drop-down list on QuickBooks sales forms. A `sales_rep_ref` refers to a person on the SalesRep list. In a request, if a `sales_rep_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  sales_rep_ref?: CurrencyRef;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * Country that sales tax is collected for.
   */
  sales_tax_country?: "Australia" | "Canada" | "UK" | "US";
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  ship_address?: BillAddress;
  ship_to_address?: ShipToAddress[];
  suffix?: string;
  /**
   * Tax registration number used in CA and UK.
   */
  tax_registration_number?: string;
  /**
   * Refers to the payment terms associated with this entity. (This will be an item on the DateDrivenTerms or StandardTerms list.) If a `terms_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  terms_ref?: CurrencyRef;
}

/**
 * The params of `customer.query`: List customers.
 */
export interface CustomerQueryParams {
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_contains`, `name_ends_with`, `name_range`, `name_starts_with`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_contains`, `name_ends_with`, `name_range`, `name_starts_with`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_contains`, `name_ends_with`, `name_range`, `name_starts_with`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include?: Array<"AccountNumber" | "AdditionalContactRef" | "AdditionalNotesRet" | "AltContact" | "AltPhone" | "Balance" | "BillAddress" | "BillAddressBlock" | "Cc" | "ClassRef" | "CompanyName" | "Contact" | "ContactsRet" | "CreditCardInfo" | "CreditLimit" | "CurrencyRef" | "CustomerTypeRef" | "DataExtRet" | "DeliveryMethod" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "FirstName" | "FullName" | "IsActive" | "IsStatementWithParent" | "ItemSalesTaxRef" | "JobDesc" | "JobEndDate" | "JobProjectedEndDate" | "JobStartDate" | "JobStatus" | "JobTitle" | "JobTypeRef" | "LastName" | "ListID" | "MiddleName" | "Mobile" | "Name" | "Notes" | "Pager" | "ParentRef" | "Phone" | "PreferredDeliveryMethod" | "PreferredPaymentMethodRef" | "PriceLevelRef" | "PrintAs" | "ResaleNumber" | "SalesRepRef" | "SalesTaxCodeRef" | "SalesTaxCountry" | "Salutation" | "ShipAddress" | "ShipAddressBlock" | "ShipToAddress" | "Sublevel" | "Suffix" | "TaxRegistrationNumber" | "TermsRef" | "TimeCreated" | "TimeModified" | "TotalBalance">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `full_name` or `list_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_contains`, `name_ends_with`, `name_range`, `name_starts_with`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the metaData query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_contains`, `name_ends_with`, `name_range`, `name_starts_with`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: the set (`name_contains`, `name_ends_with`, `name_starts_with`), or `name_range`. Members of a set combine with each other, not with the other choices.
   */
  name_contains?: string;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: the set (`name_contains`, `name_ends_with`, `name_starts_with`), or `name_range`. Members of a set combine with each other, not with the other choices.
   */
  name_ends_with?: string;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: the set (`name_contains`, `name_ends_with`, `name_starts_with`), or `name_range`. Members of a set combine with each other, not with the other choices.
   */
  name_range?: NameRange;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: the set (`name_contains`, `name_ends_with`, `name_starts_with`), or `name_range`. Members of a set combine with each other, not with the other choices.
   */
  name_starts_with?: string;
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
   * Choose at most one of: `list_id`, or `full_name`, or the set (`active_status`, `from_modified_date`, `max_returned`, `name_contains`, `name_ends_with`, `name_range`, `name_starts_with`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `customer.update`: Update customer.
 */
export interface CustomerUpdateParams {
  /**
   * Account numbers appear in the QuickBooks chart of accounts, Account fields, and reports and graphs. If the IsUsingAccountNumber preference is false (that is, if the QuickBooks user has the account numbers Preference turned off), you can still set account numbers through the SDK, but the numbers won’t be visible in the user interface.
   */
  account_number?: string;
  additional_contact_ref?: AdditionalContactRef[];
  additional_notes_mod?: AdditionalNotesMod[];
  /**
   * The name of an alternate contact person for a vendor, customer, or “other name” entry.
   */
  alt_contact?: string;
  /**
   * A telephone number given as an alternative to Phone.
   */
  alt_phone?: string;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  bill_address?: BillAddress;
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
   * Customer’s credit-card information.
   */
  credit_card_info?: CreditCardInfo;
  /**
   * Set and returned as a positive number that indicates a customer’s or vendor’s credit limit. If no value has been defined, there is no credit limit.
   */
  credit_limit?: number;
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
  /**
   * Customer types allow business owners to categorize customers in ways that are meaningful for their businesses. For example, a customer type might indicate which industry a customer represents, or which part of the country a customer is in. A `customer_type_ref` aggregate refers to one of the types on the CustomerType list.
   */
  customer_type_ref?: CurrencyRef;
  delivery_method?: "Email" | "Fax" | "Print";
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
  include_ret_element?: Array<"AccountNumber" | "AdditionalContactRef" | "AdditionalNotesRet" | "AltContact" | "AltPhone" | "Balance" | "BillAddress" | "BillAddressBlock" | "Cc" | "ClassRef" | "CompanyName" | "Contact" | "ContactsRet" | "CreditCardInfo" | "CreditLimit" | "CurrencyRef" | "CustomerTypeRef" | "DataExtRet" | "DeliveryMethod" | "EditSequence" | "Email" | "ExternalGUID" | "Fax" | "FirstName" | "FullName" | "IsActive" | "IsStatementWithParent" | "ItemSalesTaxRef" | "JobDesc" | "JobEndDate" | "JobProjectedEndDate" | "JobStartDate" | "JobStatus" | "JobTitle" | "JobTypeRef" | "LastName" | "ListID" | "MiddleName" | "Mobile" | "Name" | "Notes" | "OwnerID" | "Pager" | "ParentRef" | "Phone" | "PreferredDeliveryMethod" | "PreferredPaymentMethodRef" | "PriceLevelRef" | "PrintAs" | "ResaleNumber" | "SalesRepRef" | "SalesTaxCodeRef" | "SalesTaxCountry" | "Salutation" | "ShipAddress" | "ShipAddressBlock" | "ShipToAddress" | "Sublevel" | "Suffix" | "TaxRegistrationNumber" | "TermsRef" | "TimeCreated" | "TimeModified" | "TotalBalance" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  is_statement_with_parent?: boolean;
  /**
   * An ItemSalesTax entry represents one tax rate paid to one tax agency. Use it when a transaction needs a single tax calculation. For multi-rate scenarios, use a sales-tax group instead. If both `full_name` and `list_id` are provided for `item_sales_tax_ref`, `list_id` is used.
   */
  item_sales_tax_ref?: CurrencyRef;
  /**
   * A short job description for a sub-customer; used in reports. The Job- elements (`job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, and `job_status`) correspond to the fields in the Job Info tab of the Edit Job window in QuickBooks.
   */
  job_desc?: string;
  /**
   * The date on which work for a sub-customer was completed; used in reports. The Job- elements (`job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, and `job_status`) correspond to the fields in the Job Info tab of the Edit Job window in QuickBooks.
   *
   * Format: date.
   */
  job_end_date?: string;
  /**
   * The date on which work for a sub-customer is expected to be complete; used in reports. The Job- elements (`job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, and `job_status`) correspond to the fields in the Job Info tab of the Edit Job window in QuickBooks.
   *
   * Format: date.
   */
  job_projected_end_date?: string;
  /**
   * The date on which work for a sub-customer was started; used in reports. The Job- elements (`job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, and `job_status`) correspond to the fields in the Job Info tab of the Edit Job window in QuickBooks.
   *
   * Format: date.
   */
  job_start_date?: string;
  /**
   * `job_status` Status information about a sub-customer; used in reports. The Job- elements (`job_desc`, `job_end_date`, `job_projected_end_date`, `job_start_date`, and `job_status`) correspond to the fields in the Job Info tab of the Edit Job window in QuickBooks.
   */
  job_status?: "Awarded" | "Closed" | "InProgress" | "None" | "NotAwarded" | "Pending";
  /**
   * The job title of a customer, vendor, employee, or person on the “other names” list.
   */
  job_title?: string;
  /**
   * Job type can be used to separate jobs into any categories that are meaningful to the business. A `job_type_ref` aggregate refers to a job type on the JobType list. In a request, if a `job_type_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  job_type_ref?: CurrencyRef;
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
   * Not supported.
   */
  notes?: string;
  pager?: string;
  /**
   * A reference to the list object that is one level above this one. For example, an inventory item with the `full_name` of GermanCars:Mercedes-Benz:CL500I99AA might have a parent object with the `full_name` of GermanCars:Mercedes-Benz. In a request, if a `parent_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  parent_ref?: CurrencyRef;
  /**
   * The telephone number.
   */
  phone?: string;
  /**
   * Preference for how invoices are delivered.
   */
  preferred_delivery_method?: "Email" | "Fax" | "None";
  /**
   * Refers to a PaymentMethod object. In a request, if a `preferred_payment_method_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  preferred_payment_method_ref?: CurrencyRef;
  /**
   * Price levels let you apply custom pricing rules for selected customers. Once assigned, QuickBooks uses those prices automatically on supported sales forms unless explicitly overridden.
   */
  price_level_ref?: CurrencyRef;
  print_as?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The customer’s resale number, if they have one. This number won’t affect reports or sales tax calculations.
   */
  resale_number?: string;
  /**
   * A sales representative must be on the Employee, Vendor, or Other Names list within QuickBooks. Sales representative’s names and initials appear on the Rep drop-down list on QuickBooks sales forms. A `sales_rep_ref` refers to a person on the SalesRep list. In a request, if a `sales_rep_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  sales_rep_ref?: CurrencyRef;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * The country that sales tax is collected for.
   */
  sales_tax_country?: "Australia" | "Canada" | "UK" | "US";
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
  /**
   * This aggregate supports at most five address lines. You can provide a structured address (Addr1-Addr3 plus City/State/`postal_code`/etc.) or use block mode (Addr1-Addr5 only). Do not mix block mode with other address fields. In block mode, each Addr line prints as its own line and is returned in `ship_address_block` or `bill_address_block`.
   */
  ship_address?: BillAddress;
  ship_to_address?: ShipToAddress[];
  suffix?: string;
  /**
   * The tax registration number used in CA and UK.
   */
  tax_registration_number?: string;
  /**
   * Refers to the payment terms associated with this entity. (This will be an item on the DateDrivenTerms or StandardTerms list.) If a `terms_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  terms_ref?: CurrencyRef;
}

export interface AdditionalNotes {
  /**
   * In a `bill_address` or `ship_address` aggregate, the Note field value is written at the bottom of the address in the form in which it appears, such as the invoice form.
   */
  note: string;
}

export interface AdditionalNotesMod {
  /**
   * In a `bill_address` or `ship_address` aggregate, the Note field value is written at the bottom of the address in the form in which it appears, such as the invoice form.
   */
  note: string;
  /**
   * The ID of the note.
   */
  note_id: number;
}

export interface CreditCardInfo {
  /**
   * The address associated with this credit card.
   */
  credit_card_address?: string;
  /**
   * Credit-card number for this customer or this payment. Beginning with qbXML spec 6.0 and QuickBooks 2007, you must mask the credit card number with lower case “x” and no dashes. For example, xxxxxxxxxxxx1234.
   */
  credit_card_number?: string;
  /**
   * The postal code associated with the address for this credit card.
   */
  credit_card_postal_code?: string;
  /**
   * The month when the credit card expires.
   *
   * Minimum 1. Maximum 12.
   */
  expiration_month?: number;
  /**
   * The year when the credit card expires.
   */
  expiration_year?: number;
  /**
   * The name on the customer’s credit card.
   */
  name_on_card?: string;
}

export interface NameRange {
  from?: string;
  to?: string;
}

export interface ShipToAddress {
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
   * Flag that address is the default ship to address.
   */
  default_ship_to?: boolean;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name: string;
  /**
   * In a `bill_address` or `ship_address` aggregate, the Note field value is written at the bottom of the address in the form in which it appears, such as the invoice form.
   */
  note?: string;
  /**
   * The postal code in an address.
   */
  postal_code?: string;
  /**
   * The state name in an address.
   */
  state?: string;
}
