// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef } from "./types";

/** QuickBooks item assemblies can build operations: `qube.itemAssembliesCanBuild.<action>(connectionId, params, { webhookUrl })`. */
export declare class ItemAssembliesCanBuild {
  constructor(client: Client);
  /**
   * List item assemblies can builds: `GET /connections/{connection_id}/item-assemblies-can-builds`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `item_inventory_assembly_ref` (required), `request_id`, `txn_date` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/item-assemblies-can-builds/list-item-assemblies-can-builds
   */
  query(connectionId: string, params: ItemAssembliesCanBuildQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `item_assemblies_can_build.query`: List item assemblies can builds.
 */
export interface ItemAssembliesCanBuildQueryParams {
  /**
   * An inventory assembly item is one that is assembled or manufactured from inventory items. The items and/or assemblies that make up the assembly are called components. For Premier, an assembly can have a maximum of 100 components. For Enterprise, the maximum is 500 components.
   */
  item_inventory_assembly_ref: CurrencyRef;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * The date of the transaction. In some cases, if you leave `txn_date` out of an -Add message, QuickBooks will prefill `txn_date` with the date of the last-saved transaction of the same type.
   *
   * Format: date.
   */
  txn_date: string;
}
