// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks list display operations: `qube.listDisplay.<action>(connectionId, params, { webhookUrl })`. */
export declare class ListDisplay {
  constructor(client: Client);
  /**
   * Create list display: `POST /connections/{connection_id}/list-displays`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `list_display_add_type` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/list-displays/create-list-display
   */
  create(connectionId: string, params: ListDisplayCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update list display: `PUT /connections/{connection_id}/list-displays`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `list_display_mod_type` (required), `list_id` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/list-displays/update-list-display
   */
  update(connectionId: string, params: ListDisplayUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `list_display.create`: Create list display.
 */
export interface ListDisplayCreateParams {
  /**
   * Specifies the type of QuickBooks list for which to open an “add” form in the QuickBooks UI.
   */
  list_display_add_type: "Account" | "Customer" | "Employee" | "Item" | "OtherName" | "Vendor";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `list_display.update`: Update list display.
 */
export interface ListDisplayUpdateParams {
  /**
   * The type of QuickBooks list element to open for modification in the QuickBooks UI. (`list_id` specifies the particular list element.)
   */
  list_display_mod_type: "Account" | "Customer" | "Employee" | "Item" | "OtherName" | "Vendor";
  /**
   * `list_id` and FullName both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list family, not across the company file: customers, vendors, employees and other names share one sequence, every item type shares another, and each other list has its own.
   */
  list_id: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
