// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef, ModifiedDateRangeFilter, TxnDateRangeFilter } from "./types";

/** QuickBooks vehicle mileage operations: `qube.vehicleMileage.<action>(connectionId, params, { webhookUrl })`. */
export declare class VehicleMileage {
  constructor(client: Client);
  /**
   * Create vehicle mileage: `POST /connections/{connection_id}/vehicle-mileages`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `billable_status`, `class_ref`, `customer_ref`, `def_macro`, `include_ret_element`, `item_ref`, `notes`, `odometer_end`, `odometer_start`, `request_id`, `total_miles`, `trip_end_date`, `trip_start_date`, `vehicle_ref` (required).
   *
   * Give exactly one of: (`odometer_end`, `odometer_start`), or `total_miles`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/vehicle-mileages/create-vehicle-mileage
   */
  create(connectionId: string, params: VehicleMileageCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List vehicle mileages: `GET /connections/{connection_id}/vehicle-mileages`, queued for QuickBooks.
   *
   * QuickBooks answers in pages: each page comes to `webhookUrl` as its own webhook.
   * Params go in the query string.
   *
   * Fields: `include_ret_element`, `iterator`, `max_returned`, `meta_data`, `modified_date_range_filter`, `request_id`, `txn_date_range_filter`, `txn_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/vehicle-mileages/list-vehicle-mileages
   */
  query(connectionId: string, params: VehicleMileageQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `vehicle_mileage.create`: Create vehicle mileage.
 *
 * Give exactly one of: (`odometer_end`, `odometer_start`), or `total_miles`.
 */
export interface VehicleMileageCreateParams {
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
  include_ret_element?: Array<"BillableAmount" | "BillableRate" | "BillableStatus" | "ClassRef" | "CustomerRef" | "EditSequence" | "ExternalGUID" | "ItemRef" | "ListID" | "Notes" | "OdometerEnd" | "OdometerStart" | "OwnerID" | "StandardMileageRate" | "StandardMileageTotalAmount" | "TimeCreated" | "TimeModified" | "TotalMiles" | "TripEndDate" | "TripStartDate" | "TxnID" | "TxnNumber" | "VehicleRef">;
  /**
   * `item_ref` may accept all item types or a restricted subset, depending on the request. Examples: PurchaseOrder and Bill do not allow discount or sales-tax items; VehicleMileageAdd requires a service or other-charge item; BillingRateAdd requires a service item. If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  item_ref?: CurrencyRef;
  /**
   * Additional information.
   */
  notes?: string;
  /**
   * Odometer reading at the end of the trip. `odometer_start` and `odometer_end` must both be specified if `total_miles` isn’t specified. QuickBooks will calculate the total trip miles from these two values. If `total_miles` is specified, you can’t specify `odometer_start` and `odometer_end`.
   */
  odometer_end?: number;
  /**
   * Odometer reading at the start of the trip. `odometer_start` and `odometer_end` must both be specified if `total_miles` isn’t specified. QuickBooks will calculate the total trip miles from these two values. If `total_miles` is specified, you can’t specify `odometer_start` and `odometer_end`.
   */
  odometer_start?: number;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Total trip miles. If `total_miles` is specified, you can’t specify `odometer_start` and `odometer_end`. If you use `odometer_start` and `odometer_end` instead of `total_miles`, QuickBooks will calculate the total trip miles from these two values.
   */
  total_miles?: number;
  /**
   * Date the trip ended. If left blank, the current date at the time of transaction will be used. Notice that only dates are supported for vehicle mileage, so make sure you enter any datetime values with dates only, no time values. That is, 2002-02-02 will work for trip end date or start date, but 2002-02-02T12:20:20 won’t work.
   *
   * Format: date.
   */
  trip_end_date?: string;
  /**
   * Date the trip began. If left blank, the current date at the time of transaction will be used. Notice that only dates are supported for vehicle mileage, so make sure you enter any datetime values with dates only, no time values. That is, 2002-02-02 will work for trip end date or start date, but 2002-02-02T12:20:20 won’t work.
   *
   * Format: date.
   */
  trip_start_date?: string;
  /**
   * A vehicle for use in VehicleMileage transactions. Each vehicle name must be unique.
   */
  vehicle_ref: CurrencyRef;
}

/**
 * The params of `vehicle_mileage.query`: List vehicle mileages.
 */
export interface VehicleMileageQueryParams {
  include_ret_element?: Array<"BillableAmount" | "BillableRate" | "BillableStatus" | "ClassRef" | "CustomerRef" | "EditSequence" | "ItemRef" | "Notes" | "OdometerEnd" | "OdometerStart" | "StandardMileageRate" | "StandardMileageTotalAmount" | "TimeCreated" | "TimeModified" | "TotalMiles" | "TripEndDate" | "TripStartDate" | "TxnID" | "VehicleRef">;
  /**
   * Page through every match: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`. On by default, with pages of 100 records; send `iterator=true` with `max_returned` for another size. Off when you send `iterator=false` (every match in one answer) or `max_returned` alone (at most that many, in one answer). It pages a filtered query only: with `txn_id` every match comes back in one answer, so leave `iterator` out.
   */
  iterator?: boolean;
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * The page size, with `iterator=true`. Sent without `iterator`, or with `iterator=false`, it's a cap instead: at most this many records come back, in one answer, and QuickBooks doesn't say whether more matched.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
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
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  modified_date_range_filter?: ModifiedDateRangeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters according to the original transaction dates.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_date_range_filter?: TxnDateRangeFilter;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   *
   * Choose at most one of: `txn_id`, or the set (`max_returned`, `modified_date_range_filter`, `txn_date_range_filter`). Members of a set combine with each other, not with the other choices.
   */
  txn_id?: string[];
}
