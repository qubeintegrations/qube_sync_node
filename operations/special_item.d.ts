// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, BarCodeItemDiscount } from "./types";

/** QuickBooks special item operations: `qube.specialItem.<action>(connectionId, params, { webhookUrl })`. */
export declare class SpecialItem {
  constructor(client: Client);
  /**
   * Create special item: `POST /connections/{connection_id}/special-items`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `bar_code`, `external_guid`, `include_ret_element`, `request_id`, `special_item_type` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/special-items/create-special-item
   */
  create(connectionId: string, params: SpecialItemCreateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `special_item.create`: Create special item.
 */
export interface SpecialItemCreateParams {
  /**
   * Barcode reference information.
   */
  bar_code?: BarCodeItemDiscount;
  /**
   * Allows for the attachment of a user defined GUID value.
   */
  external_guid?: string;
  include_ret_element?: Array<"BarCodeValue" | "ClassRef" | "DataExtRet" | "EditSequence" | "ExternalGUID" | "FullName" | "IsActive" | "IsPrintItemsInGroup" | "IsTaxIncluded" | "ItemDesc" | "ItemGroupLine" | "ListID" | "Name" | "ParentRef" | "SalesAndPurchase" | "SalesOrPurchase" | "SalesTaxCodeRef" | "SpecialItemType" | "Sublevel" | "TimeCreated" | "TimeModified" | "UnitOfMeasureSetRef">;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Identifies the type of special item. See type for possible enum values.
   */
  special_item_type: "FinanceCharge" | "ReimbursableExpenseGroup" | "ReimbursableExpenseSubtotal";
}
