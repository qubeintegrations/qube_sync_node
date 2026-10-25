// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ReportAccountFilter, ReportClassFilter, ReportEntityFilter, ReportItemFilter, ReportModifiedDateRangeFilter, ReportPeriod } from "./types";

/** QuickBooks payroll summary report operations: `qube.payrollSummaryReport.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollSummaryReport {
  constructor(client: Client);
  /**
   * List payroll summary reports: `GET /connections/{connection_id}/payroll-summary-reports`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `display_report`, `include_subcolumns`, `payroll_summary_report_type` (required), `report_account_filter`, `report_calendar`, `report_class_filter`, `report_date_macro`, `report_detail_level_filter`, `report_entity_filter`, `report_item_filter`, `report_modified_date_range_filter`, `report_modified_date_range_macro`, `report_period`, `report_posting_status_filter`, `request_id`, `return_columns`, `return_rows`, `summarize_columns_by`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-summary-reports/list-payroll-summary-reports
   */
  query(connectionId: string, params: PayrollSummaryReportQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_summary_report.query`: List payroll summary reports.
 */
export interface PayrollSummaryReportQueryParams {
  /**
   * Set `display_report` to true to display this report within the QuickBooks UI. (Default is false.) If you want the request to display the report without returning any data to your application, set the responseData attribute to includeNone.
   */
  display_report?: boolean;
  /**
   * The default value is false, which means that the report won’t include any subcolumn information. To include all available types of subcolumns for this report, set `include_subcolumns` to true. The SDK won’t return subcolumn information for data that can be easily computed. (For example, the SDK doesn’t return the “percent of row” column.)
   */
  include_subcolumns?: boolean;
  /**
   * The type of payroll report: psrtEmployeeEarningsSummary This report shows information similar to the payroll summary report, but in a different layout.
   */
  payroll_summary_report_type: "EmployeeEarningsSummary" | "PayrollLiabilityBalances" | "PayrollSummary";
  /**
   * Allows you to query for a specified account type or for specific list elements.
   */
  report_account_filter?: ReportAccountFilter;
  /**
   * Specifies the type of year that will be used for this report.
   */
  report_calendar?: "CalendarYear" | "FiscalYear" | "TaxYear";
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
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Specifies whether you want the report to include only columns with active information, only columns with nonzero values, or all columns regardless of their content or active status.
   */
  return_columns?: "ActiveOnly" | "All" | "NonZero";
  /**
   * Specifies whether you want the report to include only rows with active information, only rows with nonzero values, or all rows regardless of their content or active status.
   */
  return_rows?: "ActiveOnly" | "All" | "NonZero";
  /**
   * `summarize_columns_by` determines which data the report calculates and how the columns will be labeled across the top of the report. For example, if you set the value to scbTwoWeek, the report’s column labels might be “Feb 10-23, 02,” “Feb 24-Mar9, 02,” and so on.
   */
  summarize_columns_by?: "Account" | "BalanceSheet" | "Class" | "Customer" | "CustomerType" | "Day" | "Employee" | "FourWeek" | "HalfMonth" | "IncomeStatement" | "ItemDetail" | "ItemType" | "Month" | "Payee" | "PaymentMethod" | "PayrollItemDetail" | "PayrollYtdDetail" | "Quarter" | "SalesRep" | "SalesTaxCode" | "ShipMethod" | "Terms" | "TotalOnly" | "TwoWeek" | "Vendor" | "VendorType" | "Week" | "Year";
}
