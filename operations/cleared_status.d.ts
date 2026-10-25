// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks cleared status operations: `qube.clearedStatus.<action>(connectionId, params, { webhookUrl })`. */
export declare class ClearedStatus {
  constructor(client: Client);
  /**
   * Update cleared status: `PUT /connections/{connection_id}/cleared-statuses`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `cleared_status` (required), `request_id`, `txn_id` (required), `txn_line_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/cleared-statuses/update-cleared-status
   */
  update(connectionId: string, params: ClearedStatusUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `cleared_status.update`: Update cleared status.
 */
export interface ClearedStatusUpdateParams {
  /**
   * Indicates whether a transaction or transaction line has been cleared.
   */
  cleared_status: "Cleared" | "NotCleared" | "Pending";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `txn_id` is the unique QuickBooks identifier for a transaction. Use it to reference that transaction in later requests. `txn_id` values are transaction-specific and should not be reused across unrelated transaction types.
   */
  txn_id: string;
  /**
   * Identification number of the transaction line. (`txn_line_id` is supported as of v2.0 of the SDK. With qbXML v1.0 and v1.1, `txn_line_id` is always returned as zero.) G/p>If you need to add a new transaction line in a transaction Mod request, you can do so by setting the `txn_line_id` to -1.
   */
  txn_line_id?: string;
}
