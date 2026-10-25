// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks preferences operations: `qube.preferences.<action>(connectionId, params, { webhookUrl })`. */
export declare class Preferences {
  constructor(client: Client);
  /**
   * List preferences: `GET /connections/{connection_id}/preferences`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `include_ret_element`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/preferences/list-preferences
   */
  query(connectionId: string, params: PreferencesQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update preferences: `PUT /connections/{connection_id}/preferences`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `accounting_preferences_mod` (required), `include_ret_element`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/preferences/update-preferences
   */
  update(connectionId: string, params: PreferencesUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `preferences.query`: List preferences.
 */
export interface PreferencesQueryParams {
  include_ret_element?: Array<"AccountingPreferences" | "CurrentAppAccessRights" | "FinanceChargePreferences" | "ItemsAndInventoryPreferences" | "JobsAndEstimatesPreferences" | "MultiCurrencyPreferences" | "MultiLocationInventoryPreferences" | "PurchasesAndVendorsPreferences" | "ReportsPreferences" | "SalesAndCustomersPreferences" | "SalesTaxPreferences" | "TimeTrackingPreferences">;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `preferences.update`: Update preferences.
 */
export interface PreferencesUpdateParams {
  accounting_preferences_mod: AccountingPreferencesMod;
  include_ret_element?: Array<"AccountingPreferences" | "CurrentAppAccessRights" | "FinanceChargePreferences" | "ItemsAndInventoryPreferences" | "JobsAndEstimatesPreferences" | "MultiCurrencyPreferences" | "MultiLocationInventoryPreferences" | "PurchasesAndVendorsPreferences" | "ReportsPreferences" | "SalesAndCustomersPreferences" | "SalesTaxPreferences" | "TimeTrackingPreferences">;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

export interface AccountingPreferencesMod {
  /**
   * Format: date.
   */
  closing_date?: string;
  closing_date_password?: string;
}
