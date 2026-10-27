// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks list operations: `qube.list.<action>(connectionId, params, { webhookUrl })`. */
export declare class List {
  constructor(client: Client);
  /**
   * Delete list: `DELETE /connections/{connection_id}/lists`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `list_del_type` (required), `list_id` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/lists/delete-list
   */
  delete(connectionId: string, params: ListDeleteParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `list.delete`: Delete list.
 */
export interface ListDeleteParams {
  /**
   * The type of list from which a list member is being deleted.
   */
  list_del_type: "Account" | "BillingRate" | "Class" | "Currency" | "Customer" | "CustomerMsg" | "CustomerType" | "DateDrivenTerms" | "Employee" | "InventorySite" | "ItemDiscount" | "ItemFixedAsset" | "ItemGroup" | "ItemInventory" | "ItemInventoryAssembly" | "ItemNonInventory" | "ItemOtherCharge" | "ItemPayment" | "ItemSalesTax" | "ItemSalesTaxGroup" | "ItemService" | "ItemSubtotal" | "JobType" | "OtherName" | "PaymentMethod" | "PayrollItemNonWage" | "PayrollItemWage" | "PriceLevel" | "SalesRep" | "SalesTaxCode" | "ShipMethod" | "StandardTerms" | "ToDo" | "UnitOfMeasureSet" | "Vehicle" | "Vendor" | "VendorType" | "WorkersCompCode";
  /**
   * `list_id` and FullName both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
