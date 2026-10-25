// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks data event recovery info operations: `qube.dataEventRecoveryInfo.<action>(connectionId, params, { webhookUrl })`. */
export declare class DataEventRecoveryInfo {
  constructor(client: Client);
  /**
   * Delete data event recovery info: `DELETE /connections/{connection_id}/data-event-recovery-infos`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `request_id`, `subscriber_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/data-event-recovery-infos/delete-data-event-recovery-info
   */
  delete(connectionId: string, params: DataEventRecoveryInfoDeleteParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List data event recovery infos: `GET /connections/{connection_id}/data-event-recovery-infos`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `request_id`, `subscriber_id` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/data-event-recovery-infos/list-data-event-recovery-infos
   */
  query(connectionId: string, params: DataEventRecoveryInfoQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `data_event_recovery_info.delete`: Delete data event recovery info.
 */
export interface DataEventRecoveryInfoDeleteParams {
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * A unique identifier that an application sets when it adds a subscription so that the application can later query or delete the subscription.
   */
  subscriber_id: string;
}

/**
 * The params of `data_event_recovery_info.query`: List data event recovery infos.
 */
export interface DataEventRecoveryInfoQueryParams {
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * A unique identifier that an application sets when it adds a subscription so that the application can later query or delete the subscription.
   */
  subscriber_id: string;
}
