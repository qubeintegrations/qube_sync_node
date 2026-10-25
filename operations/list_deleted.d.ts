// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, DeletedDateRangeFilter } from "./types";

/** QuickBooks list deleted operations: `qube.listDeleted.<action>(connectionId, params, { webhookUrl })`. */
export declare class ListDeleted {
  constructor(client: Client);
  /**
   * List list deleteds: `GET /connections/{connection_id}/list-deleteds`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `deleted_date_range_filter`, `include_ret_element`, `list_del_type` (required), `meta_data`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/list-deleteds/list-list-deleteds
   */
  query(connectionId: string, params: ListDeletedQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `list_deleted.query`: List list deleteds.
 */
export interface ListDeletedQueryParams {
  /**
   * Filters according to delete dates (within the last 90 days).
   */
  deleted_date_range_filter?: DeletedDateRangeFilter;
  include_ret_element?: Array<"FullName" | "ListDelType" | "ListID" | "TimeCreated" | "TimeDeleted">;
  /**
   * The type of list from which a list member is being deleted.
   */
  list_del_type: Array<"Account" | "BillingRate" | "Class" | "Currency" | "Customer" | "CustomerMsg" | "CustomerType" | "DateDrivenTerms" | "Employee" | "InventorySite" | "ItemDiscount" | "ItemFixedAsset" | "ItemGroup" | "ItemInventory" | "ItemInventoryAssembly" | "ItemNonInventory" | "ItemOtherCharge" | "ItemPayment" | "ItemSalesTax" | "ItemSalesTaxGroup" | "ItemService" | "ItemSubtotal" | "JobType" | "OtherName" | "PaymentMethod" | "PayrollItemNonWage" | "PayrollItemWage" | "PriceLevel" | "SalesRep" | "SalesTaxCode" | "ShipMethod" | "StandardTerms" | "ToDo" | "UnitOfMeasureSet" | "Vehicle" | "Vendor" | "VendorType" | "WorkersCompCode">;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
