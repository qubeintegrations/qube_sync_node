// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks account tax line info operations: `qube.accountTaxLineInfo.<action>(connectionId, params, { webhookUrl })`. */
export declare class AccountTaxLineInfo {
  constructor(client: Client);
  /**
   * List account tax line infos: `GET /connections/{connection_id}/account-tax-line-infos`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/account-tax-line-infos/list-account-tax-line-infos
   */
  query(connectionId: string, params: AccountTaxLineInfoQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `account_tax_line_info.query`: List account tax line infos.
 */
export interface AccountTaxLineInfoQueryParams {
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
