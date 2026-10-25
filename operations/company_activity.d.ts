// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks company activity operations: `qube.companyActivity.<action>(connectionId, params, { webhookUrl })`. */
export declare class CompanyActivity {
  constructor(client: Client);
  /**
   * List company activities: `GET /connections/{connection_id}/company-activities`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `include_ret_element`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/company-activities/list-company-activities
   */
  query(connectionId: string, params: CompanyActivityQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `company_activity.query`: List company activities.
 */
export interface CompanyActivityQueryParams {
  include_ret_element?: Array<"LastCondenseTime" | "LastRestoreTime">;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
