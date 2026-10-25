// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef } from "./types";

/** QuickBooks sales tax return line operations: `qube.salesTaxReturnLine.<action>(connectionId, params, { webhookUrl })`. */
export declare class SalesTaxReturnLine {
  constructor(client: Client);
  /**
   * List sales tax return lines: `GET /connections/{connection_id}/sales-tax-return-lines`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `meta_data`, `request_id`, `tax_agency_vendor_ref` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-return-lines/list-sales-tax-return-lines
   */
  query(connectionId: string, params: SalesTaxReturnLineQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `sales_tax_return_line.query`: List sales tax return lines.
 */
export interface SalesTaxReturnLineQueryParams {
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  tax_agency_vendor_ref: CurrencyRef[];
}
