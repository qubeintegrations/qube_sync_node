// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks host operations: `qube.host.<action>(connectionId, params, { webhookUrl })`. */
export declare class Host {
  constructor(client: Client);
  /**
   * List hosts: `GET /connections/{connection_id}/hosts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `include_list_meta_data`, `include_ret_element`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/hosts/list-hosts
   */
  query(connectionId: string, params: HostQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `host.query`: List hosts.
 */
export interface HostQueryParams {
  /**
   * Use this aggregate if you want the query to return list capacity metadata for each object type in QuickBooks.
   */
  include_list_meta_data?: IncludeListMetaData;
  include_ret_element?: Array<"Country" | "IsAutomaticLogin" | "ListMetaData" | "MajorVersion" | "MinorVersion" | "ProductName" | "QBFileMode" | "SupportedQBXMLVersion">;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

export interface IncludeListMetaData {
  /**
   * Specify the value “true” to return max list limits for each object type, or “false” to not return these in the query response. By default, this is “false” for HostQuery.
   */
  include_max_capacity: boolean;
}
