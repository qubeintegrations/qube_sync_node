// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks alert operations: `qube.alert.<action>(connectionId, params, { webhookUrl })`. */
export declare class Alert {
  constructor(client: Client);
  /**
   * Create alert: `POST /connections/{connection_id}/alerts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `activation_date`, `alert_permission`, `alert_tag` (required), `com_callback_info`, `desc` (required), `expiration_date`, `help_text` (required), `http_callback_info`, `message_text` (required), `owner_id` (required), `request_id`, `ui_context`.
   *
   * Give exactly one of: `com_callback_info`, or `http_callback_info`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/alerts/create-alert
   */
  create(connectionId: string, params: AlertCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Delete alert: `DELETE /connections/{connection_id}/alerts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `alert_tag` (required), `owner_id` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/alerts/delete-alert
   */
  delete(connectionId: string, params: AlertDeleteParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List alerts: `GET /connections/{connection_id}/alerts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `meta_data`, `owner_id` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/alerts/list-alerts
   */
  query(connectionId: string, params: AlertQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `alert.create`: Create alert.
 *
 * Give exactly one of: `com_callback_info`, or `http_callback_info`.
 */
export interface AlertCreateParams {
  /**
   * Format: date.
   */
  activation_date?: string;
  alert_permission?: AlertPermission;
  alert_tag: string;
  com_callback_info?: ComCallbackInfo;
  desc: string;
  /**
   * Format: date.
   */
  expiration_date?: string;
  help_text: string;
  http_callback_info?: HttpCallbackInfo;
  message_text: string;
  owner_id: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  ui_context?: Array<"AlertsManager" | "CompanyNavigator">;
}

/**
 * The params of `alert.delete`: Delete alert.
 */
export interface AlertDeleteParams {
  alert_tag: string;
  owner_id: string;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `alert.query`: List alerts.
 */
export interface AlertQueryParams {
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  owner_id: string[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

export interface AlertPermission {
  permission_level: Array<"AccountsPayable" | "AccountsReceivable" | "Banking" | "Finance" | "Inventory" | "TimeTracking">;
  permission_needed: "All" | "Any";
}

/**
 * Give exactly one of: `prog_id`, or `clsid`.
 */
export interface ComCallbackInfo {
  app_name: string;
  clsid?: string;
  prog_id?: string;
}

export interface HttpCallbackInfo {
  url: string;
}
