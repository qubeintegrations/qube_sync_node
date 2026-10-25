// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyFilter, CurrencyRef } from "./types";

/** QuickBooks bill to pay operations: `qube.billToPay.<action>(connectionId, params, { webhookUrl })`. */
export declare class BillToPay {
  constructor(client: Client);
  /**
   * List bill to pays: `GET /connections/{connection_id}/bill-to-pays`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `ap_account_ref`, `currency_filter`, `due_date`, `include_ret_element`, `meta_data`, `payee_entity_ref` (required), `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/bill-to-pays/list-bill-to-pays
   */
  query(connectionId: string, params: BillToPayQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `bill_to_pay.query`: List bill to pays.
 */
export interface BillToPayQueryParams {
  /**
   * Refers to an accounts payable account in the QuickBooks file. (The AccountType of this account will be AccountsPayable.) If `ap_account_ref` is missing, the SDK will use the QuickBooks default AP account. In a request, if an `ap_account_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  ap_account_ref?: CurrencyRef;
  /**
   * Filters by the specified currency.
   */
  currency_filter?: CurrencyFilter;
  /**
   * The date on which payment is due.
   *
   * Format: date.
   */
  due_date?: string;
  include_ret_element?: Array<"BillToPay" | "CreditToApply">;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * `payee_entity_ref` identifies the payee (customer, vendor, employee, or Other Name). If both `full_name` and `list_id` are provided, `full_name` is ignored.
   */
  payee_entity_ref: CurrencyRef;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
