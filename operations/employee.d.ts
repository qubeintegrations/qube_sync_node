// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, AdditionalContactRef, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks employee operations: `qube.employee.<action>(connectionId, params, { webhookUrl })`. */
export declare class Employee {
  constructor(client: Client);
  /**
   * Create employee: `POST /connections/{connection_id}/employees`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_number`, `additional_contact_ref`, `additional_notes`, `adjusted_service_date`, `alt_phone`, `billing_rate_ref`, `birth_date`, `department`, `description`, `disability_desc`, `disabled`, `email`, `emergency_contacts`, `employee_address`, `employee_payroll_info`, `employee_type`, `ethnicity`, `exempt`, `external_guid`, `fax`, `first_name`, `gender`, `hired_date`, `include_ret_element`, `is_active`, `job_title`, `key_employee`, `last_name`, `middle_name`, `military_status`, `mobile`, `name`, `notes`, `on_file`, `original_hire_date`, `pager`, `pager_pin`, `part_or_full_time`, `phone`, `print_as`, `released_date`, `request_id`, `salutation`, `ssn`, `suffix`, `supervisor_ref`, `target_bonus`, `us_citizen`, `us_veteran`, `work_auth_expire_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/employees/create-employee
   */
  create(connectionId: string, params: EmployeeCreateParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List employees: `GET /connections/{connection_id}/employees`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `owner_id`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/employees/list-employees
   */
  query(connectionId: string, params: EmployeeQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update employee: `PUT /connections/{connection_id}/employees`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_number`, `additional_contact_ref`, `additional_notes_mod`, `adjusted_service_date`, `alt_phone`, `billing_rate_ref`, `birth_date`, `department`, `description`, `disability_desc`, `disabled`, `edit_sequence` (required), `email`, `emergency_contacts`, `employee_address`, `employee_payroll_info_mod`, `employee_type`, `ethnicity`, `exempt`, `fax`, `first_name`, `hired_date`, `include_ret_element`, `is_active`, `job_title`, `key_employee`, `last_name`, `list_id` (required), `middle_name`, `military_status`, `mobile`, `name`, `notes`, `on_file`, `original_hire_date`, `pager`, `pager_pin`, `part_or_full_time`, `phone`, `print_as`, `released_date`, `request_id`, `salutation`, `suffix`, `supervisor_ref`, `target_bonus`, `us_citizen`, `us_veteran`, `work_auth_expire_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/employees/update-employee
   */
  update(connectionId: string, params: EmployeeUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `employee.create`: Create employee.
 */
export interface EmployeeCreateParams {
  /**
   * Account numbers appear in the QuickBooks chart of accounts, Account fields, and reports and graphs. If the IsUsingAccountNumber preference is false (that is, if the QuickBooks user has the account numbers Preference turned off), you can still set account numbers through the SDK, but the numbers won’t be visible in the user interface.
   */
  account_number?: string;
  additional_contact_ref?: AdditionalContactRef[];
  additional_notes?: AdditionalNotesEmployee[];
  /**
   * Adjusted service date for the employee.
   *
   * Format: date.
   */
  adjusted_service_date?: string;
  /**
   * A telephone number given as an alternative to Phone.
   */
  alt_phone?: string;
  /**
   * Billing rates are used to override the service item rate in a time transaction (TimeTrackingAdd) based on the employee or vendor performing the work. Billing rates are assigned to an employee or a vendor to specify overrides to service items.
   */
  billing_rate_ref?: CurrencyRef;
  /**
   * Date of birth.
   *
   * Format: date.
   */
  birth_date?: string;
  /**
   * The name of the department in the employment job details section.
   */
  department?: string;
  /**
   * The description details in the employment job details section.
   */
  description?: string;
  /**
   * Description of employee’s disablitily.
   */
  disability_desc?: string;
  /**
   * Is employee disabled?
   */
  disabled?: "No" | "Yes";
  /**
   * E-mail address.
   */
  email?: string;
  /**
   * Emergency Contact information for the employee.
   */
  emergency_contacts?: EmergencyContacts;
  /**
   * If an address request fails, some combination of address fields might be too long. If you use payroll, you must specify the employee’s city, state (or province), ZIP (or postal) code, and at least one line of the street address. (Note that the State element has restrictions when it’s used in the `employee_address` aggregate. For more information, click State in the table.)
   */
  employee_address?: EmployeeAddress;
  /**
   * Pay information for this employee.
   */
  employee_payroll_info?: EmployeePayrollInfo;
  /**
   * `employee_type` can affect payroll taxes for an employee. A statutory employee is a person who is defined as an employee by statute. Usually an owner or partner will be on the Other Names list, but if they are on the Employee list, their `employee_type` will be Owner.
   */
  employee_type?: "Officer" | "Owner" | "Regular" | "Statutory";
  /**
   * Ethnicity of employee from AmericianIndian, Asian, Black, Hawaiian, Hispanic, White, TwoOrMoreRaces
   */
  ethnicity?: "AmericianIndian" | "Asian" | "Black" | "Hawaiian" | "Hispanic" | "TwoOrMoreRaces" | "White";
  /**
   * Exempt or Non-exempt status of the employee.
   */
  exempt?: "Exempt" | "NonExempt";
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
  /**
   * The gender of this employee.
   */
  gender?: "Female" | "Male";
  /**
   * An employee’s date of hire.
   *
   * Format: date.
   */
  hired_date?: string;
  include_ret_element?: Array<"AccountNumber" | "AdditionalContactRef" | "AdditionalNotesRet" | "AdjustedServiceDate" | "AltPhone" | "BillingRateRef" | "BirthDate" | "DataExtRet" | "Department" | "Description" | "DisabilityDesc" | "Disabled" | "EditSequence" | "Email" | "EmergencyContacts" | "EmployeeAddress" | "EmployeePayrollInfo" | "EmployeeType" | "Ethnicity" | "Exempt" | "ExternalGUID" | "Fax" | "FirstName" | "Gender" | "HiredDate" | "IsActive" | "JobTitle" | "KeyEmployee" | "LastName" | "ListID" | "MiddleName" | "MilitaryStatus" | "Mobile" | "Name" | "Notes" | "OnFile" | "OriginalHireDate" | "OwnerID" | "Pager" | "PagerPIN" | "PartOrFullTime" | "Phone" | "PrintAs" | "ReleasedDate" | "SSN" | "Salutation" | "Suffix" | "SupervisorRef" | "TargetBonus" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "USCitizen" | "USVeteran" | "WorkAuthExpireDate">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * The job title of a customer, vendor, employee, or person on the “other names” list.
   */
  job_title?: string;
  /**
   * Is employee a key or critical employee.
   */
  key_employee?: "No" | "Yes";
  /**
   * The last name of a customer, vendor, employee, or person on the “other names” list.
   */
  last_name?: string;
  /**
   * The middle name of a customer, vendor, employee, or person on the “other names” list.
   */
  middle_name?: string;
  /**
   * Military status if the employee is a US veteran.
   */
  military_status?: "Active" | "Reserve";
  /**
   * Mobile telephone number.
   */
  mobile?: string;
  /**
   * A concatenation of `first_name`, `middle_name`, and `last_name`.
   */
  name?: string;
  /**
   * Additional information.
   */
  notes?: string;
  /**
   * Is the employee’s I-9 on file?
   */
  on_file?: "No" | "Yes";
  /**
   * Original hire date the employee was hired.
   *
   * Format: date.
   */
  original_hire_date?: string;
  /**
   * The pager number.
   */
  pager?: string;
  /**
   * A personal identification number for this employee’s pager.
   */
  pager_pin?: string;
  /**
   * Full or Part time status of the employee.
   */
  part_or_full_time?: "FullTime" | "PartTime";
  /**
   * The telephone number.
   */
  phone?: string;
  /**
   * By default within QuickBooks, the `print_as` element is the same as the Name element.
   */
  print_as?: string;
  /**
   * The date on which this person’s employment with the company ended.
   *
   * Format: date.
   */
  released_date?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
  /**
   * Social security number. When you add an SSN value to an employee record, it doesn’t have to include dashes; for example, either 123-45-6789 or 123456789 would be valid.
   */
  ssn?: string;
  suffix?: string;
  /**
   * The name of a customer, vendor, employee, or person on the “other names” list in the employment job details section.
   */
  supervisor_ref?: CurrencyRef;
  /**
   * The target bonus amount in the employment job details section.
   */
  target_bonus?: number;
  /**
   * Is employee a US citizen?
   */
  us_citizen?: "No" | "Yes";
  /**
   * Is employee a US veteran?
   */
  us_veteran?: "No" | "Yes";
  /**
   * Date the employee’s work authorization expires.
   *
   * Format: date.
   */
  work_auth_expire_date?: string;
}

/**
 * The params of `employee.query`: List employees.
 */
export interface EmployeeQueryParams {
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
  include_ret_element?: Array<"AccountNumber" | "AdditionalContactRef" | "AdditionalNotesRet" | "AdjustedServiceDate" | "AltPhone" | "BillingRateRef" | "BirthDate" | "DataExtRet" | "Department" | "Description" | "DisabilityDesc" | "Disabled" | "EditSequence" | "Email" | "EmergencyContacts" | "EmployeeAddress" | "EmployeePayrollInfo" | "EmployeeType" | "Ethnicity" | "Exempt" | "ExternalGUID" | "Fax" | "FirstName" | "Gender" | "HiredDate" | "IsActive" | "JobTitle" | "KeyEmployee" | "LastName" | "ListID" | "MiddleName" | "MilitaryStatus" | "Mobile" | "Name" | "Notes" | "OnFile" | "OriginalHireDate" | "Pager" | "PagerPIN" | "PartOrFullTime" | "Phone" | "PrintAs" | "ReleasedDate" | "SSN" | "Salutation" | "Suffix" | "SupervisorRef" | "TargetBonus" | "TimeCreated" | "TimeModified" | "USCitizen" | "USVeteran" | "WorkAuthExpireDate">;
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
 * The params of `employee.update`: Update employee.
 */
export interface EmployeeUpdateParams {
  /**
   * Account numbers appear in the QuickBooks chart of accounts, Account fields, and reports and graphs. If the IsUsingAccountNumber preference is false (that is, if the QuickBooks user has the account numbers Preference turned off), you can still set account numbers through the SDK, but the numbers won’t be visible in the user interface.
   */
  account_number?: string;
  additional_contact_ref?: AdditionalContactRef[];
  additional_notes_mod?: AdditionalNotesModEmployee[];
  /**
   * Adjusted service date for the employee.
   *
   * Format: date.
   */
  adjusted_service_date?: string;
  /**
   * A telephone number given as an alternative to Phone.
   */
  alt_phone?: string;
  /**
   * Billing rates are used to override the service item rate in a time transaction (TimeTrackingAdd) based on the employee or vendor performing the work. Billing rates are assigned to an employee or a vendor to specify overrides to service items.
   */
  billing_rate_ref?: CurrencyRef;
  /**
   * Date of birth.
   *
   * Format: date.
   */
  birth_date?: string;
  /**
   * The name of the department in the employment job details section.
   */
  department?: string;
  /**
   * The description details in the employment job details section.
   */
  description?: string;
  /**
   * Description of employee’s disablitily.
   */
  disability_desc?: string;
  /**
   * Is employee disabled?
   */
  disabled?: "No" | "Yes";
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * E-mail address.
   */
  email?: string;
  /**
   * Emergency Contact information for the employee.
   */
  emergency_contacts?: EmergencyContacts;
  /**
   * If an address request fails, some combination of address fields might be too long. If you use payroll, you must specify the employee’s city, state (or province), ZIP (or postal) code, and at least one line of the street address. (Note that the State element has restrictions when it’s used in the `employee_address` aggregate. For more information, click State in the table.)
   */
  employee_address?: EmployeeAddress;
  /**
   * Pay information for this employee.
   */
  employee_payroll_info_mod?: EmployeePayrollInfo;
  /**
   * `employee_type` can affect payroll taxes for an employee. A statutory employee is a person who is defined as an employee by statute. Usually an owner or partner will be on the Other Names list, but if they are on the Employee list, their `employee_type` will be Owner.
   */
  employee_type?: "Officer" | "Owner" | "Regular" | "Statutory";
  /**
   * Ethnicity of employee from AmericianIndian, Asian, Black, Hawaiian, Hispanic, White, TwoOrMoreRaces.
   */
  ethnicity?: "AmericianIndian" | "Asian" | "Black" | "Hawaiian" | "Hispanic" | "TwoOrMoreRaces" | "White";
  /**
   * Exempt or Non-exempt status of the employee.
   */
  exempt?: "Exempt" | "NonExempt";
  /**
   * Fax number.
   */
  fax?: string;
  /**
   * The first name of a customer, vendor, employee, or person on the “other names” list.
   */
  first_name?: string;
  /**
   * An employee’s date of hire.
   *
   * Format: date.
   */
  hired_date?: string;
  include_ret_element?: Array<"AccountNumber" | "AdditionalContactRef" | "AdditionalNotesRet" | "AdjustedServiceDate" | "AltPhone" | "BillingRateRef" | "BirthDate" | "DataExtRet" | "Department" | "Description" | "DisabilityDesc" | "Disabled" | "EditSequence" | "Email" | "EmergencyContacts" | "EmployeeAddress" | "EmployeePayrollInfo" | "EmployeeType" | "Ethnicity" | "Exempt" | "ExternalGUID" | "Fax" | "FirstName" | "Gender" | "HiredDate" | "IsActive" | "JobTitle" | "KeyEmployee" | "LastName" | "ListID" | "MiddleName" | "MilitaryStatus" | "Mobile" | "Name" | "Notes" | "OnFile" | "OriginalHireDate" | "OwnerID" | "Pager" | "PagerPIN" | "PartOrFullTime" | "Phone" | "PrintAs" | "ReleasedDate" | "SSN" | "Salutation" | "Suffix" | "SupervisorRef" | "TargetBonus" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "USCitizen" | "USVeteran" | "WorkAuthExpireDate">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * The job title of a customer, vendor, employee, or person on the “other names” list.
   */
  job_title?: string;
  /**
   * Is employee a key or critical employee.
   */
  key_employee?: "No" | "Yes";
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
  /**
   * Military status if the employee is a US veteran.
   */
  military_status?: "Active" | "Reserve";
  /**
   * Mobile telephone number.
   */
  mobile?: string;
  /**
   * A concatenation of `first_name`, `middle_name`, and `last_name`.
   */
  name?: string;
  /**
   * Additional information.
   */
  notes?: string;
  /**
   * Is the employee’s I-9 on file?
   */
  on_file?: "No" | "Yes";
  /**
   * Original hire date the employee was hired.
   *
   * Format: date.
   */
  original_hire_date?: string;
  /**
   * The pager number.
   */
  pager?: string;
  /**
   * A personal identification number for this employee’s pager.
   */
  pager_pin?: string;
  /**
   * Full or Part time status of the employee.
   */
  part_or_full_time?: "FullTime" | "PartTime";
  /**
   * The telephone number.
   */
  phone?: string;
  /**
   * By default within QuickBooks, the `print_as` element is the same as the Name element.
   */
  print_as?: string;
  /**
   * The date on which this person’s employment with the company ended.
   *
   * Format: date.
   */
  released_date?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * A formal reference, such as Mr. or Dr., that precedes a name.
   */
  salutation?: string;
  suffix?: string;
  /**
   * The name of a customer, vendor, employee, or person on the “other names” list in the employment job details section.
   */
  supervisor_ref?: CurrencyRef;
  /**
   * The target bonus amount in the employment job details section.
   */
  target_bonus?: number;
  /**
   * Is employee a US citizen?
   */
  us_citizen?: "No" | "Yes";
  /**
   * Is employee a US veteran?
   */
  us_veteran?: "No" | "Yes";
  /**
   * Date the employee’s work authorization expires.
   *
   * Format: date.
   */
  work_auth_expire_date?: string;
}

export interface AdditionalNotesEmployee {
  /**
   * In a BillAddress or ShipAddress aggregate, the Note field value is written at the bottom of the address in the form in which it appears, such as the invoice form.
   */
  note: string;
}

export interface AdditionalNotesModEmployee {
  /**
   * In a BillAddress or ShipAddress aggregate, the Note field value is written at the bottom of the address in the form in which it appears, such as the invoice form.
   */
  note: string;
  /**
   * The ID of the note.
   */
  note_id: number;
}

export interface Earnings {
  /**
   * Each payroll wage item describes and names a payment scheme, for example, Regular Pay or Overtime Pay. A `payroll_item_wage_ref` aggregate refers to one of these wage items. In a request, if a `payroll_item_wage_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  payroll_item_wage_ref: CurrencyRef;
  /**
   * Indicates the price of something.
   *
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate?: number;
  /**
   * Indicates the price of something as a percent.
   *
   * Choose at most one of: `rate`, or `rate_percent`.
   */
  rate_percent?: number;
}

export interface EmergencyContacts {
  /**
   * Primary emergency contact information for the employee.
   */
  primary_contact?: PrimaryContact;
  /**
   * Secondary emergency contact information for the employee.
   */
  secondary_contact?: PrimaryContact;
}

export interface EmployeeAddress {
  /**
   * The first line of an address.
   */
  addr1?: string;
  /**
   * The second line of an address (if a second line is needed).
   */
  addr2?: string;
  addr3?: string;
  addr4?: string;
  /**
   * The city name in an address.
   */
  city?: string;
  country?: string;
  /**
   * The postal code in an address.
   */
  postal_code?: string;
  /**
   * When it appears in the `employee_address` aggregate, the State element acts like an ENUMTYPE with the following possible values: None, AA (military), AE (military), AK, AL, AP (military), AR, AZ, CA, CO, CT, DC, DE, FL, GA, HI, IA, ID, IL, IN, KS, KY, LA, MA, MD, ME, MI, MN, MO, MS, MT, NC, ND, NE, NH, NJ, NM, NV, NY, OH, OK, OR, PA, PR, RI, SC, SD, TN, TX, UT, VA, VT, WA, WI, WV, and WY.
   */
  state?: string;
}

export interface EmployeePayrollInfo {
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * If `clear_earnings` is set to true, the earnings will be deleted for this employee.
   *
   * Choose at most one of: `clear_earnings`, or `earnings`.
   */
  clear_earnings?: boolean;
  /**
   * Choose at most one of: `clear_earnings`, or `earnings`.
   */
  earnings?: Earnings[];
  /**
   * Indicates how often employees are paid. If you include a blank `pay_period` element in an EmployeeMod message, you’ll receive an error. The default value is whatever the QuickBooks user has set in the QuickBooks Employee Preferences.
   */
  pay_period?: "Biweekly" | "Daily" | "Monthly" | "Quarterly" | "Semimonthly" | "Weekly" | "Yearly";
  /**
   * Describes how “sick time” is accrued for this employee, along with how many sick hours the employee has accrued.
   */
  sick_hours?: SickHours;
  /**
   * Indicates whether time data is used to create paychecks for this employee.
   */
  use_time_data_to_create_paychecks?: "DoNotUseTimeData" | "NotSet" | "UseTimeData";
  /**
   * Describes how vacation time is accrued for this employee, along with how many vacation hours the employee has accrued.
   */
  vacation_hours?: SickHours;
}

export interface PrimaryContact {
  /**
   * The name of the contact.
   */
  contact_name: string;
  /**
   * The value of the contact field.
   */
  contact_value: string;
  /**
   * Relationship of emergency contact information to the employee.
   */
  relation?: "Brother" | "Daughter" | "Father" | "Friend" | "Mother" | "Other" | "Partner" | "Sister" | "Son" | "Spouse";
}

export interface SickHours {
  /**
   * Indicates how an employee accrues time off. If you include a blank `accrual_period` element in an EmployeeMod message, you’ll receive an error. The default value is whatever the QuickBooks user has set in the QuickBooks Employee Preferences.
   */
  accrual_period?: "BeginningOfYear" | "EveryHourOnPaycheck" | "EveryPaycheck";
  /**
   * When used in the `sick_hours` or `vacation_hours` aggregates, refers to the date on which sick leave or vacation hours in the current year began to accrue.
   *
   * Format: date.
   */
  accrual_start_date?: string;
  /**
   * The number of hours that the employee will accrue per accrual period. The default value is whatever the QuickBooks user has set in the QuickBooks Employee Preferences.
   */
  hours_accrued?: string;
  /**
   * The total number of hours currently available for the employee to use. If this value is empty, it will default to 0.
   */
  hours_available?: string;
  /**
   * When used in the `sick_hours` or `vacation_hours` aggregates, refers to the number of sick leave or vacation hours used in the current year.
   */
  hours_used?: string;
  /**
   * Indicates whether or not the hours accrued resets to zero at the beginning of the new year. If you include a blank `is_resetting_hours_each_new_year` element in an EmployeeMod message, you’ll receive an error.
   */
  is_resetting_hours_each_new_year?: boolean;
  /**
   * The maximum number of hours that the employee can accrue. (QuickBooks itself doesn’t enforce this limit, however. `hours_available` can be greater than `maximum_hours`.) The default value is whatever the QuickBooks user has set in the QuickBooks Employee Preferences.
   */
  maximum_hours?: string;
}
