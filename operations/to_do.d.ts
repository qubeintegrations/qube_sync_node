// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks to do operations: `qube.toDo.<action>(connectionId, params, { webhookUrl })`. */
export declare class ToDo {
  constructor(client: Client);
  /**
   * Create to do: `POST /connections/{connection_id}/to-dos`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `customer_ref`, `employee_ref`, `include_ret_element`, `is_active`, `is_done`, `lead_ref`, `notes` (required), `priority`, `reminder_date`, `reminder_time`, `request_id`, `type`, `vendor_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/to-dos/create-to-do
   */
  create(connectionId: string, params: ToDoCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List to dos: `GET /connections/{connection_id}/to-dos`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `active_status`, `done_status`, `from_modified_date`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/to-dos/list-to-dos
   */
  query(connectionId: string, params: ToDoQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update to do: `PUT /connections/{connection_id}/to-dos`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `customer_ref`, `edit_sequence` (required), `employee_ref`, `include_ret_element`, `is_active`, `is_done`, `lead_ref`, `list_id` (required), `notes`, `priority`, `reminder_date`, `reminder_time`, `request_id`, `type`, `vendor_ref`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/to-dos/update-to-do
   */
  update(connectionId: string, params: ToDoUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `to_do.create`: Create to do.
 */
export interface ToDoCreateParams {
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   *
   * Choose at most one of: `customer_ref`, or `employee_ref`, or `lead_ref`, or `vendor_ref`.
   */
  customer_ref?: CurrencyRef;
  /**
   * The employee list contains payroll information about each of the company’s employees.
   *
   * Choose at most one of: `customer_ref`, or `employee_ref`, or `lead_ref`, or `vendor_ref`.
   */
  employee_ref?: CurrencyRef;
  include_ret_element?: Array<"CustomerRef" | "EditSequence" | "EmployeeRef" | "ExternalGUID" | "IsActive" | "IsDone" | "LeadRef" | "ListID" | "Notes" | "OwnerID" | "Priority" | "ReminderDate" | "ReminderTime" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "Type" | "VendorRef">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * If `is_done` is true, this “to do” task has been completed. The default value of `is_done` is false.
   */
  is_done?: boolean;
  /**
   * The lead list contains information about leads for a company.
   *
   * Choose at most one of: `customer_ref`, or `employee_ref`, or `lead_ref`, or `vendor_ref`.
   */
  lead_ref?: CurrencyRef;
  /**
   * Additional information.
   */
  notes: string;
  /**
   * Priority may have one of the following values: Low [DEFAULT], Medium, High
   */
  priority?: "High" | "Low" | "Medium";
  /**
   * The date on which the contents of the Notes string will appear on the Reminder list within QuickBooks.
   *
   * Format: date.
   */
  reminder_date?: string;
  /**
   * The time on which the contents of the Notes string will appear on the Reminder list within QuickBooks.
   */
  reminder_time?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Type may have one of the following values: Task [DEFAULT], Call, Fax, Email, Meeting, Appointment
   */
  type?: "Appointment" | "Call" | "Email" | "Fax" | "Meeting" | "Task";
  /**
   * A vendor is any person or company from whom a small business owner buys goods and services. (Banks and tax agencies usually are included on the vendor list.) A company’s vendor list contains information such as account balance and contact information about each vendor. A `vendor_ref` aggregate refers to one of the vendors on the list.
   *
   * Choose at most one of: `customer_ref`, or `employee_ref`, or `lead_ref`, or `vendor_ref`.
   */
  vendor_ref?: CurrencyRef;
}

/**
 * The params of `to_do.query`: List to dos.
 */
export interface ToDoQueryParams {
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   *
   * Choose at most one of: `list_id`, or the set (`active_status`, `done_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * Selects all the relevant “to do” notes (dsAll), only those that are done (dsDoneOnly), or only those that aren’t done (dsNotDoneOnly).
   *
   * Choose at most one of: `list_id`, or the set (`active_status`, `done_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  done_status?: "All" | "DoneOnly" | "NotDoneOnly";
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or the set (`active_status`, `done_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  include_ret_element?: Array<"CustomerRef" | "EditSequence" | "EmployeeRef" | "IsActive" | "IsDone" | "LeadRef" | "ListID" | "Notes" | "Priority" | "ReminderDate" | "ReminderTime" | "TimeCreated" | "TimeModified" | "Type" | "VendorRef">;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   *
   * Choose at most one of: `list_id`, or the set (`active_status`, `done_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * QuickBooks doesn't page this query: at most this many records come back, in one answer, with no sign of whether more matched. Leave it out for every match, in one answer; one over 4 MB as the Web Connector sends it, about 3 MB of qbXML isn't kept (`error_type` `response_too_large`), so narrow a large one with its filters.
   *
   * Choose at most one of: `list_id`, or the set (`active_status`, `done_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `list_id`, or the set (`active_status`, `done_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or the set (`active_status`, `done_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_range_filter?: NameRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters results to objects modified on or before this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to end-of-day (23:59:59).
   *
   * Choose at most one of: `list_id`, or the set (`active_status`, `done_status`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `to_do.update`: Update to do.
 */
export interface ToDoUpdateParams {
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   *
   * Choose at most one of: `customer_ref`, or `employee_ref`, or `lead_ref`, or `vendor_ref`.
   */
  customer_ref?: CurrencyRef;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * The employee list contains payroll information about each of the company’s employees.
   *
   * Choose at most one of: `customer_ref`, or `employee_ref`, or `lead_ref`, or `vendor_ref`.
   */
  employee_ref?: CurrencyRef;
  include_ret_element?: Array<"CustomerRef" | "EditSequence" | "EmployeeRef" | "ExternalGUID" | "IsActive" | "IsDone" | "LeadRef" | "ListID" | "Notes" | "OwnerID" | "Priority" | "ReminderDate" | "ReminderTime" | "TimeCreated" | "TimeModified" | "TxnID" | "TxnNumber" | "Type" | "VendorRef">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * If `is_done` is true, this “to do” task has been completed. The default value of `is_done` is false.
   */
  is_done?: boolean;
  /**
   * The lead list contains information about leads for a company.
   *
   * Choose at most one of: `customer_ref`, or `employee_ref`, or `lead_ref`, or `vendor_ref`.
   */
  lead_ref?: CurrencyRef;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id: string;
  /**
   * Additional information.
   */
  notes?: string;
  /**
   * Priority may have one of the following values: Low [DEFAULT], Medium, High
   */
  priority?: "High" | "Low" | "Medium";
  /**
   * The date on which the contents of the Notes string will appear on the Reminder list within QuickBooks.
   *
   * Format: date.
   */
  reminder_date?: string;
  /**
   * The time on which the contents of the Notes string will appear on the Reminder list within QuickBooks.
   */
  reminder_time?: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Type may have one of the following values: Task [DEFAULT], Call, Fax, Email, Meeting, Appointment
   */
  type?: "Appointment" | "Call" | "Email" | "Fax" | "Meeting" | "Task";
  /**
   * A vendor is any person or company from whom a small business owner buys goods and services. (Banks and tax agencies usually are included on the vendor list.) A company’s vendor list contains information such as account balance and contact information about each vendor. A `vendor_ref` aggregate refers to one of the vendors on the list.
   *
   * Choose at most one of: `customer_ref`, or `employee_ref`, or `lead_ref`, or `vendor_ref`.
   */
  vendor_ref?: CurrencyRef;
}
