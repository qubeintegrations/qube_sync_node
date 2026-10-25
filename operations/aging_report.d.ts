// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ReportAccountFilter, ReportClassFilter, ReportEntityFilter, ReportItemFilter, ReportModifiedDateRangeFilter, ReportPeriod, ReportTxnTypeFilter } from "./types";

/** QuickBooks aging report operations: `qube.agingReport.<action>(connectionId, params, { webhookUrl })`. */
export declare class AgingReport {
  constructor(client: Client);
  /**
   * List aging reports: `GET /connections/{connection_id}/aging-reports`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `aging_report_type` (required), `display_report`, `include_accounts`, `include_column`, `report_account_filter`, `report_aging_as_of`, `report_class_filter`, `report_date_macro`, `report_detail_level_filter`, `report_entity_filter`, `report_item_filter`, `report_modified_date_range_filter`, `report_modified_date_range_macro`, `report_period`, `report_posting_status_filter`, `report_txn_type_filter`, `request_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/aging-reports/list-aging-reports
   */
  query(connectionId: string, params: AgingReportQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `aging_report.query`: List aging reports.
 */
export interface AgingReportQueryParams {
  /**
   * The type of aging report being queried.
   */
  aging_report_type: "APAgingDetail" | "APAgingSummary" | "ARAgingDetail" | "ARAgingSummary" | "CollectionsReport";
  /**
   * Set `display_report` to true to display this report within the QuickBooks UI. (Default is false.) If you want the request to display the report without returning any data to your application, set the responseData attribute to includeNone.
   */
  display_report?: boolean;
  /**
   * Indicates whether this report should include all accounts or just those that are currently in use.
   */
  include_accounts?: "All" | "InUse";
  include_column?: Array<"Account" | "Aging" | "Amount" | "AmountDifference" | "AverageCost" | "BilledDate" | "BillingStatus" | "CalculatedAmount" | "Class" | "ClearedStatus" | "CostPrice" | "Credit" | "Currency" | "Date" | "Debit" | "DeliveryDate" | "DueDate" | "EstimateActive" | "ExchangeRate" | "FOB" | "IncomeSubjectToTax" | "Invoiced" | "Item" | "ItemDesc" | "LastModifiedBy" | "LatestOrPriorState" | "Memo" | "ModifiedTime" | "Name" | "NameAccountNumber" | "NameAddress" | "NameCity" | "NameContact" | "NameEmail" | "NameFax" | "NamePhone" | "NameState" | "NameZip" | "OpenBalance" | "OriginalAmount" | "PONumber" | "PaidAmount" | "PaidStatus" | "PaidThroughDate" | "PaymentMethod" | "PayrollItem" | "PrintStatus" | "ProgressAmount" | "ProgressPercent" | "Quantity" | "QuantityAvailable" | "QuantityOnHand" | "QuantityOnSalesOrder" | "ReceivedQuantity" | "RefNumber" | "RunningBalance" | "SSNOrTaxID" | "SalesRep" | "SalesTaxCode" | "SerialOrLotNumber" | "ShipDate" | "ShipMethod" | "SourceName" | "SplitAccount" | "TaxLine" | "TaxTableVersion" | "Terms" | "TxnID" | "TxnNumber" | "TxnType" | "UnitPrice" | "UserEdit" | "ValueOnHand" | "WageBase" | "WageBaseTips">;
  /**
   * Allows you to query for a specified account type or for specific list elements.
   */
  report_account_filter?: ReportAccountFilter;
  /**
   * The report will return aging information up to the `report_aging_as_of` date.
   */
  report_aging_as_of?: "ReportEndDate" | "Today";
  /**
   * Allows you to query for a specified class. Classes can be used to separate transactions into meaningful categories. (For example, transactions could be classified according to department, business location, or type of work.) In QuickBooks, class tracking is off by default.
   */
  report_class_filter?: ReportClassFilter;
  /**
   * The time period covered by this report.
   *
   * Choose at most one of: `report_period`, or `report_date_macro`.
   */
  report_date_macro?: "All" | "LastMonth" | "LastMonthToDate" | "LastQuarter" | "LastQuarterToDate" | "LastWeek" | "LastWeekToDate" | "LastYear" | "LastYearToDate" | "NextFourWeeks" | "NextMonth" | "NextQuarter" | "NextWeek" | "NextYear" | "ThisMonth" | "ThisMonthToDate" | "ThisQuarter" | "ThisQuarterToDate" | "ThisWeek" | "ThisWeekToDate" | "ThisYear" | "ThisYearToDate" | "Today" | "Yesterday";
  /**
   * The level of detail to include in the report.
   */
  report_detail_level_filter?: "All" | "AllExceptSummary" | "SummaryOnly";
  /**
   * Allows you to query for a specified name type (customer, employee, vendor, or other) or query for specific list elements.
   */
  report_entity_filter?: ReportEntityFilter;
  /**
   * Allows you to query for a specified item type (for example, discount, inventory, or non-inventory) or query for specific list elements.
   */
  report_item_filter?: ReportItemFilter;
  /**
   * Returns reports that were modified between these two dates (inclusive). The range of acceptable dates for both `from_report_modified_date` and `to_report_modified_date` is 1970-01-01 to 2038-01-19T03:14:07 (2038-01-18T19:14:07-08:00 PST).
   *
   * Choose at most one of: `report_modified_date_range_filter`, or `report_modified_date_range_macro`.
   */
  report_modified_date_range_filter?: ReportModifiedDateRangeFilter;
  /**
   * The time period covered by this report.
   *
   * Choose at most one of: `report_modified_date_range_filter`, or `report_modified_date_range_macro`.
   */
  report_modified_date_range_macro?: "All" | "LastMonth" | "LastMonthToDate" | "LastQuarter" | "LastQuarterToDate" | "LastWeek" | "LastWeekToDate" | "LastYear" | "LastYearToDate" | "NextFourWeeks" | "NextMonth" | "NextQuarter" | "NextWeek" | "NextYear" | "ThisMonth" | "ThisMonthToDate" | "ThisQuarter" | "ThisQuarterToDate" | "ThisWeek" | "ThisWeekToDate" | "ThisYear" | "ThisYearToDate" | "Today" | "Yesterday";
  /**
   * If you omit both `to_report_date` and `from_report_date`, the report will cover the current fiscal year to date.
   *
   * Choose at most one of: `report_period`, or `report_date_macro`.
   */
  report_period?: ReportPeriod;
  /**
   * Allows you to query for posting reports, non-posting reports, or reports that are either one.
   */
  report_posting_status_filter?: "Either" | "NonPosting" | "Posting";
  /**
   * Allows you to report on specific transaction types (for example, charge, check, deposit, or estimate).
   */
  report_txn_type_filter?: ReportTxnTypeFilter;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
}
