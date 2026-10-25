// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest } from "./types";

/** QuickBooks company operations: `qube.company.<action>(connectionId, params, { webhookUrl })`. */
export declare class Company {
  constructor(client: Client);
  /**
   * List companies: `GET /connections/{connection_id}/companies`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `include_ret_element`, `owner_id`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/companies/list-companies
   */
  query(connectionId: string, params: CompanyQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `company.query`: List companies.
 */
export interface CompanyQueryParams {
  include_ret_element?: Array<"AccountantCopy" | "Address" | "AddressBlock" | "CompanyAddressBlockForCustomer" | "CompanyAddressForCustomer" | "CompanyEmailForCustomer" | "CompanyName" | "CompanyType" | "CompanyWebSite" | "DataExtRet" | "EIN" | "Email" | "Fax" | "FirstMonthFiscalYear" | "FirstMonthIncomeTaxYear" | "IsSampleCompany" | "LegalAddress" | "LegalCompanyName" | "Phone" | "SSN" | "SubscribedServices" | "TaxForm">;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id?: string[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
