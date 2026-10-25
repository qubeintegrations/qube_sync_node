// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, ReportClassFilter, ReportEntityFilter, ReportItemFilter, ReportPeriod } from "./types";

/** QuickBooks time report operations: `qube.timeReport.<action>(connectionId, params, { webhookUrl })`. */
export declare class TimeReport {
  constructor(client: Client);
  /**
   * List time reports: `GET /connections/{connection_id}/time-reports`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `display_report`, `include_column`, `include_subcolumns`, `report_calendar`, `report_class_filter`, `report_date_macro`, `report_entity_filter`, `report_item_filter`, `report_period`, `request_id`, `return_columns`, `return_rows`, `summarize_columns_by`, `time_report_type` (required).
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/time-reports/list-time-reports
   */
  query(connectionId: string, params: TimeReportQueryParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `time_report.query`: List time reports.
 */
export interface TimeReportQueryParams {
  /**
   * Set `display_report` to true to display this report within the QuickBooks UI. (Default is false.) If you want the request to display the report without returning any data to your application, set the responseData attribute to includeNone.
   */
  display_report?: boolean;
  include_column?: Array<"Account" | "Aging" | "Amount" | "AmountDifference" | "AverageCost" | "BilledDate" | "BillingStatus" | "CalculatedAmount" | "Class" | "ClearedStatus" | "CostPrice" | "Credit" | "Currency" | "Date" | "Debit" | "DeliveryDate" | "DueDate" | "EstimateActive" | "ExchangeRate" | "FOB" | "IncomeSubjectToTax" | "Invoiced" | "Item" | "ItemDesc" | "LastModifiedBy" | "LatestOrPriorState" | "Memo" | "ModifiedTime" | "Name" | "NameAccountNumber" | "NameAddress" | "NameCity" | "NameContact" | "NameEmail" | "NameFax" | "NamePhone" | "NameState" | "NameZip" | "OpenBalance" | "OriginalAmount" | "PONumber" | "PaidAmount" | "PaidStatus" | "PaidThroughDate" | "PaymentMethod" | "PayrollItem" | "PrintStatus" | "ProgressAmount" | "ProgressPercent" | "Quantity" | "QuantityAvailable" | "QuantityOnHand" | "QuantityOnSalesOrder" | "ReceivedQuantity" | "RefNumber" | "RunningBalance" | "SSNOrTaxID" | "SalesRep" | "SalesTaxCode" | "SerialOrLotNumber" | "ShipDate" | "ShipMethod" | "SourceName" | "SplitAccount" | "TaxLine" | "TaxTableVersion" | "Terms" | "TxnID" | "TxnNumber" | "TxnType" | "UnitPrice" | "UserEdit" | "ValueOnHand" | "WageBase" | "WageBaseTips">;
  /**
   * The default value is false, which means that the report won’t include any subcolumn information. To include all available types of subcolumns for this report, set `include_subcolumns` to true. The SDK won’t return subcolumn information for data that can be easily computed. (For example, the SDK doesn’t return the “percent of row” column.)
   */
  include_subcolumns?: boolean;
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
   * Allows you to query for a specified name type (customer, employee, vendor, or other) or query for specific list elements.
   */
  report_entity_filter?: ReportEntityFilter;
  /**
   * Allows you to query for a specified item type (for example, discount, inventory, or non-inventory) or query for specific list elements.
   */
  report_item_filter?: ReportItemFilter;
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
  /**
   * Allows you to report on time that has been recorded in a particular category.
   */
  time_report_type: "TimeByItem" | "TimeByJobDetail" | "TimeByJobSummary" | "TimeByName";
}
