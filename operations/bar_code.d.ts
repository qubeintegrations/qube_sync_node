// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks bar code operations: `qube.barCode.<action>(connectionId, params, { webhookUrl })`. */
export declare class BarCode {
  constructor(client: Client);
  /**
   * List bar codes: `GET /connections/{connection_id}/bar-codes`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `bar_code_value`, `iterator`, `meta_data`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/bar-codes/list-bar-codes
   */
  query(connectionId: string, params: BarCodeQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `bar_code.query`: List bar codes.
 */
export interface BarCodeQueryParams {
  bar_code_value?: string[];
  /**
   * Page through every result: QuBe Sync asks QuickBooks for each page in turn and sends each to your `webhook_url` as it arrives, all with the same `id`.
   */
  iterator?: boolean;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
