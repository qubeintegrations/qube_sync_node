// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks sales tax payable operations: `qube.salesTaxPayable.<action>(connectionId, params, { webhookUrl })`. */
export declare class SalesTaxPayable {
  constructor(client: Client);
  /**
   * List sales tax payables: `GET /connections/{connection_id}/sales-tax-payables`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `as_of_date`, `include_ret_element`, `meta_data`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/sales-tax-payables/list-sales-tax-payables
   */
  query(connectionId: string, params: SalesTaxPayableQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `sales_tax_payable.query`: List sales tax payables.
 */
export interface SalesTaxPayableQueryParams {
  /**
   * The date when the exchange rate was last changed.
   *
   * Format: date.
   */
  as_of_date?: string;
  include_ret_element?: Array<"Amount" | "PayeeEntityRef" | "SalesTaxPayableLineRet">;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
