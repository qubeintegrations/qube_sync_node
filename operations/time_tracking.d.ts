// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyFilter, CurrencyRef, ModifiedDateRangeFilter, TxnDateRangeFilter } from "./types";

/** QuickBooks time tracking operations: `qube.timeTracking.<action>(connectionId, params, { webhookUrl })`. */
export declare class TimeTracking {
  constructor(client: Client);
  /**
   * Create time tracking: `POST /connections/{connection_id}/time-trackings`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `billable_status`, `class_ref`, `customer_ref`, `def_macro`, `duration` (required), `entity_ref` (required), `external_guid`, `include_ret_element`, `item_service_ref`, `notes`, `payroll_item_wage_ref`, `rate`, `request_id`, `txn_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/time-trackings/create-time-tracking
   */
  create(connectionId: string, params: TimeTrackingCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List time trackings: `GET /connections/{connection_id}/time-trackings`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `request_id`, `time_tracking_entity_filter`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/time-trackings/list-time-trackings
   */
  query(connectionId: string, params: TimeTrackingQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update time tracking: `PUT /connections/{connection_id}/time-trackings`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `billable_status`, `class_ref`, `customer_ref`, `duration` (required), `edit_sequence` (required), `entity_ref` (required), `include_ret_element`, `item_service_ref`, `notes`, `payroll_item_wage_ref`, `rate`, `request_id`, `txn_date`, `txn_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/time-trackings/update-time-tracking
   */
  update(connectionId: string, params: TimeTrackingUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `time_tracking.create`: Create time tracking.
 */
export interface TimeTrackingCreateParams {
  /**
   * The billing status of this item line or expense line.
   */
  billable_status?: "Billable" | "HasBeenBilled" | "NotBillable";
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref?: CurrencyRef;
  /**
   * `def_macro` lets you assign a reusable name to a returned `txn_id` or TxnLineID so later requests can reference it with `useMacro`. This feature requires SDK 2.0+.
   */
  def_macro?: string;
  /**
   * Time spent doing the work. In a TimeTrackAdd request, notice that although you can specify seconds, seconds aren’t returned in the response because the UI doesn’t use seconds.
   */
  duration: string;
  /**
   * A QuickBooks “entity” is a customer, vendor, employee, or person on the QuickBooks “other names” list. Special cases to note: In a BillToPayQuery message, `entity_ref` refers to the vendor name. In JournalCreditLine and JournalDebitLine messages for A/R accounts, `entity_ref` must refer to a customer, or else the transaction won’t be recorded.
   */
  entity_ref: CurrencyRef;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"BillableStatus" | "ClassRef" | "CustomerRef" | "Duration" | "EditSequence" | "EntityRef" | "ExternalGUID" | "ItemServiceRef" | "ListID" | "Notes" | "OwnerID" | "PayrollItemWageRef" | "Rate" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * A service item refers to services that a business charges for or purchases. Examples include specialized labor, consulting hours, and professional fees. An `item_service_ref` aggregate refers to an item on the ItemService list. In a request, if an `item_service_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  item_service_ref?: CurrencyRef;
  /**
   * Additional information.
   */
  notes?: string;
  /**
   * Each payroll wage item describes and names a payment scheme, for example, Regular Pay or Overtime Pay. A `payroll_item_wage_ref` aggregate refers to one of these wage items. In a request, if a `payroll_item_wage_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  payroll_item_wage_ref?: CurrencyRef;
  rate?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
}

/**
 * The params of `time_tracking.query`: List time trackings.
 */
export interface TimeTrackingQueryParams {
  include_ret_element?: Array<"BillableStatus" | "ClassRef" | "CustomerRef" | "Duration" | "EditSequence" | "EntityRef" | "ExternalGUID" | "ItemServiceRef" | "Notes" | "PayrollItemWageRef" | "Rate" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `txn_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `time_tracking_entity_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Filters according to the dates when transactions were last modified. The `modified_date_range_filter` aggregate isn’t required to contain any elements, but if it is empty, we recommend that you leave it out altogether. Note that the time portion of the `from_modified_date` and `to_modified_date` fields wasn’t supported in qbXML version 1.0 or 1.1.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `time_tracking_entity_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  modified_date_range_filter?: ModifiedDateRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Allows you to query for one or more names on the QuickBooks Vendor list, Employee list, or Other Names list.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `time_tracking_entity_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  time_tracking_entity_filter?: CurrencyFilter;
  /**
   * Filters according to the original transaction dates.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `time_tracking_entity_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_date_range_filter?: TxnDateRangeFilter;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `time_tracking_entity_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_id?: string[];
}

/**
 * The params of `time_tracking.update`: Update time tracking.
 */
export interface TimeTrackingUpdateParams {
  /**
   * The billing status of this item line or expense line.
   */
  billable_status?: "Billable" | "HasBeenBilled" | "NotBillable";
  /**
   * Use classes to categorize transactions (for example, by department, location, or work type). Class tracking is off by default in QuickBooks. A `class_ref` points to one class; if both `full_name` and `list_id` are provided, `full_name` is ignored. In InvoiceAdd, a header-level `class_ref` is applied to line items unless you override or clear it on individual lines.
   */
  class_ref?: CurrencyRef;
  /**
   * `customer_ref` identifies a customer or customer job. If both `full_name` and `list_id` are provided, `full_name` is ignored. In SalesReceipt and ReceivePayment, it identifies who receives credit. In TimeTracking, it identifies who the time can be billed to and is required in TimeTrackingAdd when IsBillable is true.
   */
  customer_ref?: CurrencyRef;
  /**
   * Time spent doing the work. In a TimeTrackAdd request, notice that although you can specify seconds, seconds aren’t returned in the response because the UI doesn’t use seconds.
   */
  duration: string;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  /**
   * A QuickBooks “entity” is a customer, vendor, employee, or person on the QuickBooks “other names” list. Special cases to note: In a BillToPayQuery message, `entity_ref` refers to the vendor name. In JournalCreditLine and JournalDebitLine messages for A/R accounts, `entity_ref` must refer to a customer, or else the transaction won’t be recorded.
   */
  entity_ref: CurrencyRef;
  include_ret_element?: Array<"BillableStatus" | "ClassRef" | "CustomerRef" | "Duration" | "EditSequence" | "EntityRef" | "ExternalGUID" | "ItemServiceRef" | "ListID" | "Notes" | "OwnerID" | "PayrollItemWageRef" | "Rate" | "TimeCreated" | "TimeModified" | "TxnDate" | "TxnID" | "TxnNumber">;
  /**
   * A service item refers to services that a business charges for or purchases. Examples include specialized labor, consulting hours, and professional fees. An `item_service_ref` aggregate refers to an item on the ItemService list. In a request, if an `item_service_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  item_service_ref?: CurrencyRef;
  /**
   * Additional information.
   */
  notes?: string;
  /**
   * Each payroll wage item describes and names a payment scheme, for example, Regular Pay or Overtime Pay. A `payroll_item_wage_ref` aggregate refers to one of these wage items. In a request, if a `payroll_item_wage_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  payroll_item_wage_ref?: CurrencyRef;
  rate?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date?: string;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
}
