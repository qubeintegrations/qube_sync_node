// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyRef } from "./types";

/** QuickBooks form1099 category account mapping operations: `qube.form1099CategoryAccountMapping.<action>(connectionId, params, { webhookUrl })`. */
export declare class Form1099CategoryAccountMapping {
  constructor(client: Client);
  /**
   * List form1099 category account mappings: `GET /connections/{connection_id}/form1099-category-account-mappings`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `form_type`, `mapping_category`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/form1099-category-account-mappings/list-form1099-category-account-mappings
   */
  query(connectionId: string, params: Form1099CategoryAccountMappingQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update form1099 category account mapping: `PUT /connections/{connection_id}/form1099-category-account-mappings`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `category_account_mapping_mod`, `is_filing1099_misc`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/form1099-category-account-mappings/update-form1099-category-account-mapping
   */
  update(connectionId: string, params: Form1099CategoryAccountMappingUpdateParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `form1099_category_account_mapping.query`: List form1099 category account mappings.
 */
export interface Form1099CategoryAccountMappingQueryParams {
  /**
   * Added a form type to support Form 1099-NEC and Form 1099-MISC. `form_type` is a property to identify the type of form (MISC/NEC) for which Form1099CategoryAccountMapping query is run. Form type will be MISC if no `form_type` is specified.
   */
  form_type?: string;
  /**
   * A mapping category indicates the form 1099 box that one or more accounts is being mapped to. You must specify one of the following enumerated values based on the form type:
   */
  mapping_category?: Array<"BOX1" | "BOX10" | "BOX13" | "BOX14" | "BOX2" | "BOX3" | "BOX4" | "BOX5" | "BOX6" | "BOX7" | "BOX8" | "BOX9">;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

/**
 * The params of `form1099_category_account_mapping.update`: Update form1099 category account mapping.
 */
export interface Form1099CategoryAccountMappingUpdateParams {
  category_account_mapping_mod?: CategoryAccountMappingMod[];
  /**
   * This property reports only (it doesn’t set!) the current status of 1099 preferences setting in the company file. The value true indicates that the company file currently has the 1099 filing preference turned on. The value false indicates that the company file isn’t currently set to file 1099-MISC and 1099-NEC forms.
   */
  is_filing1099_misc?: boolean;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}

export interface CategoryAccountMappingMod {
  mapping_account?: MappingAccount[];
  /**
   * A mapping category indicates the form 1099 box that one or more accounts is being mapped to. You must specify one of the following enumerated values based on the form type:
   */
  mapping_category: "BOX1" | "BOX10" | "BOX13" | "BOX14" | "BOX2" | "BOX3" | "BOX4" | "BOX5" | "BOX6" | "BOX7" | "BOX8" | "BOX9";
  /**
   * This is the dollar amount at which the IRS requires you to file the 1099-MISC and 1099-NEC forms. Each box (“Category” in SDK lingo) can have a separate threshold, as established by the IRS. For the latest thresholds, check the website for the Internal Revenue Service, currently at www.irs.gov.
   */
  threshold?: number;
}

export interface MappingAccount {
  /**
   * `account_ref` points to an account in the company file. If both `full_name` and `list_id` are provided, `full_name` is ignored. Meaning depends on context: for checks it is the funding account; for ExpenseLineAdd it may be required by accounting preferences; for credit-card transactions it identifies the bank or card account involved.
   */
  account_ref: CurrencyRef;
  /**
   * In some circumstances, changing the account mapping could result in the displaying of a user dialog in the QuickBooks UI prompting the user to confirm, which would prevent the SDK request from completing. Setting this property to true causes that user dialog to be suppressed.
   */
  force_mapping?: boolean;
}
