// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ReportClassFilter, ReportPeriod } from "./types";

/** QuickBooks budget summary report operations: `qube.budgetSummaryReport.<action>(connectionId, params, { webhookUrl })`. */
export declare class BudgetSummaryReport {
  constructor(client: Client);
  /**
   * List budget summary reports: `GET /connections/{connection_id}/budget-summary-reports`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `budget_criterion`, `budget_summary_report_type` (required), `display_report`, `fiscal_year` (required), `report_class_filter`, `report_date_macro`, `report_period`, `request_id`, `summarize_budget_columns_by`, `summarize_budget_rows_by`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/budget-summary-reports/list-budget-summary-reports
   */
  query(connectionId: string, params: BudgetSummaryReportQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `budget_summary_report.query`: List budget summary reports.
 */
export interface BudgetSummaryReportQueryParams {
  /**
   * What this budget covers.
   */
  budget_criterion?: "Accounts" | "AccountsAndClasses" | "AccountsAndCustomers";
  /**
   * The type of budget report being queried.
   */
  budget_summary_report_type: "BalanceSheetBudgetOverview" | "BalanceSheetBudgetVsActual" | "ProfitAndLossBudgetOverview" | "ProfitAndLossBudgetPerformance" | "ProfitAndLossBudgetVsActual";
  /**
   * Set `display_report` to true to display this report within the QuickBooks UI. (Default is false.) If you want the request to display the report without returning any data to your application, set the responseData attribute to includeNone.
   */
  display_report?: boolean;
  /**
   * Specify the fiscal year of the budget to be queried. There can only be one balance sheet budget for each fiscal year, one profit and loss (P&L) by account budget per fiscal year, and one profit and loss (P&L) by account and customer budget per fiscal year. When Fiscal year isn’t the current year, the report returns the data for the full fiscal year.
   */
  fiscal_year: number;
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
   * If you omit both `to_report_date` and `from_report_date`, the report will cover the current fiscal year to date.
   *
   * Choose at most one of: `report_period`, or `report_date_macro`.
   */
  report_period?: ReportPeriod;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `summarize_budget_columns_by` determines which data the report calculates and how the columns will be labeled across the top of the report.
   */
  summarize_budget_columns_by?: "Class" | "Customer" | "Date";
  /**
   * How you want rows to be labeled in the report. For example, if you set the value to sbrbAccount, the report’s row labels might be “Checking,” “Savings,” and so on.
   */
  summarize_budget_rows_by?: "Account" | "Class" | "Customer";
}
