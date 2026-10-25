// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks template operations: `qube.template.<action>(connectionId, params, { webhookUrl })`. */
export declare class Template {
  constructor(client: Client);
  /**
   * List templates: `GET /connections/{connection_id}/templates`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `include_ret_element`, `meta_data`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/templates/list-templates
   */
  query(connectionId: string, params: TemplateQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `template.query`: List templates.
 */
export interface TemplateQueryParams {
  include_ret_element?: Array<"EditSequence" | "IsActive" | "ListID" | "Name" | "TemplateType" | "TimeCreated" | "TimeModified">;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
