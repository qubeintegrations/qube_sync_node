// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks qb command exec operations: `qube.qbCommandExec.<action>(connectionId, params, { webhookUrl })`. */
export declare class QbCommandExec {
  constructor(client: Client);
  /**
   * Execute QB command exec: `POST /connections/{connection_id}/qb-command-exec`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `argument`, `qb_command` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/qb-command-exec/execute-qb-command-exec
   */
  execute(connectionId: string, params: QbCommandExecExecuteParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `qb_command_exec.execute`: Execute QB command exec.
 */
export interface QbCommandExecExecuteParams {
  argument?: Argument[];
  qb_command: "Backup" | "ExportQBDT2QBO" | "ExportReport" | "IIFImport" | "MobiLinkSync" | "Restore" | "ScheduledReport";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

export interface Argument {
  arg_name: string;
  /**
   * Choose exactly one of: `arg_value`, or `list_id`, or `txn_id`.
   */
  arg_value?: string;
  /**
   * Choose exactly one of: `arg_value`, or `list_id`, or `txn_id`.
   */
  list_id?: string;
  /**
   * Choose exactly one of: `arg_value`, or `list_id`, or `txn_id`.
   */
  txn_id?: string;
}
