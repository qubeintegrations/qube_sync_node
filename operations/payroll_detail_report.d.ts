// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ReportAccountFilter, ReportClassFilter, ReportEntityFilter, ReportItemFilter, ReportModifiedDateRangeFilter, ReportPeriod } from "./types";

/** QuickBooks payroll detail report operations: `qube.payrollDetailReport.<action>(connectionId, params, { webhookUrl })`. */
export declare class PayrollDetailReport {
  constructor(client: Client);
  /**
   * List payroll detail reports: `GET /connections/{connection_id}/payroll-detail-reports`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `display_report`, `include_accounts`, `include_column`, `payroll_detail_report_type` (required), `report_account_filter`, `report_class_filter`, `report_date_macro`, `report_detail_level_filter`, `report_entity_filter`, `report_item_filter`, `report_modified_date_range_filter`, `report_modified_date_range_macro`, `report_open_balance_as_of`, `report_period`, `report_posting_status_filter`, `request_id`, `summarize_rows_by`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/payroll-detail-reports/list-payroll-detail-reports
   */
  query(connectionId: string, params: PayrollDetailReportQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `payroll_detail_report.query`: List payroll detail reports.
 */
export interface PayrollDetailReportQueryParams {
  /**
   * Set `display_report` to true to display this report within the QuickBooks UI. (Default is false.) If you want the request to display the report without returning any data to your application, set the responseData attribute to includeNone.
   */
  display_report?: boolean;
  /**
   * Indicates whether this report should include all accounts or just those that are currently in use.
   */
  include_accounts?: "All" | "InUse";
  include_column?: Array<"Account" | "Aging" | "Amount" | "AmountDifference" | "AverageCost" | "BilledDate" | "BillingStatus" | "CalculatedAmount" | "Class" | "ClearedStatus" | "CostPrice" | "Credit" | "Currency" | "Date" | "Debit" | "DeliveryDate" | "DueDate" | "EstimateActive" | "ExchangeRate" | "FOB" | "IncomeSubjectToTax" | "Invoiced" | "Item" | "ItemDesc" | "LastModifiedBy" | "LatestOrPriorState" | "Memo" | "ModifiedTime" | "Name" | "NameAccountNumber" | "NameAddress" | "NameCity" | "NameContact" | "NameEmail" | "NameFax" | "NamePhone" | "NameState" | "NameZip" | "OpenBalance" | "OriginalAmount" | "PONumber" | "PaidAmount" | "PaidStatus" | "PaidThroughDate" | "PaymentMethod" | "PayrollItem" | "PrintStatus" | "ProgressAmount" | "ProgressPercent" | "Quantity" | "QuantityAvailable" | "QuantityOnHand" | "QuantityOnSalesOrder" | "ReceivedQuantity" | "RefNumber" | "RunningBalance" | "SSNOrTaxID" | "SalesRep" | "SalesTaxCode" | "SerialOrLotNumber" | "ShipDate" | "ShipMethod" | "SourceName" | "SplitAccount" | "TaxLine" | "TaxTableVersion" | "Terms" | "TxnID" | "TxnNumber" | "TxnType" | "UnitPrice" | "UserEdit" | "ValueOnHand" | "WageBase" | "WageBaseTips">;
  payroll_detail_report_type: "EmployeeStateTaxesDetail" | "PayrollItemDetail" | "PayrollReviewDetail" | "PayrollTransactionDetail" | "PayrollTransactionsByPayee";
  /**
   * Allows you to query for a specified account type or for specific list elements.
   */
  report_account_filter?: ReportAccountFilter;
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
   * The report will return open balance information up to the `report_open_balance_as_of` date.
   */
  report_open_balance_as_of?: "ReportEndDate" | "Today";
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
   * `summarize_rows_by` (along with IncludeColumnList, in most cases) determines what data is calculated for this report and controls how the rows are organized and labeled. For example, if you set the value to srbAccount, the report’s row labels might be “Checking,” “Savings,” and so on.
   */
  summarize_rows_by?: "Account" | "BalanceSheet" | "Class" | "Customer" | "CustomerType" | "Day" | "Employee" | "FourWeek" | "HalfMonth" | "IncomeStatement" | "ItemDetail" | "ItemType" | "Month" | "Payee" | "PaymentMethod" | "PayrollItemDetail" | "PayrollYtdDetail" | "Quarter" | "SalesRep" | "SalesTaxCode" | "ShipMethod" | "TaxLine" | "Terms" | "TotalOnly" | "TwoWeek" | "Vendor" | "VendorType" | "Week" | "Year";
}
