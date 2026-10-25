// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks payroll last period operations: `qube.payrollLastPeriod.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollLastPeriod {
  constructor(client: Client);
  /**
   * List payroll last periods: `GET /connections/{connection_id}/payroll-last-periods`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-last-periods/list-payroll-last-periods
   */
  query(connectionId: string, params: PayrollLastPeriodQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_last_period.query`: List payroll last periods.
 */
export interface PayrollLastPeriodQueryParams {
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
