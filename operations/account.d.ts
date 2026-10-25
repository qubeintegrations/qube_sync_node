// Generated from operations.json by scripts/generate-operations.js: don't edit.

import type { Client } from "../index";
import type { OperationOptions, QueuedRequest, CurrencyFilter, CurrencyRef, NameFilter, NameRangeFilter } from "./types";

/** QuickBooks account operations: `qube.account.<action>(connectionId, params, { webhookUrl })`. */
export declare class Account {
  constructor(client: Client);
  /**
   * Create account: `POST /connections/{connection_id}/accounts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_number`, `account_type` (required), `bank_number`, `currency_ref`, `desc`, `detail_account_type`, `include_ret_element`, `is_active`, `name` (required), `open_balance`, `open_balance_date`, `parent_ref`, `request_id`, `sales_tax_code_ref`, `tax_line_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/accounts/create-account
   */
  create(connectionId: string, params: AccountCreateParams, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * List accounts: `GET /connections/{connection_id}/accounts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the query string.
   *
   * Fields: `account_type`, `active_status`, `currency_filter`, `from_modified_date`, `full_name`, `include_ret_element`, `list_id`, `max_returned`, `meta_data`, `name_filter`, `name_range_filter`, `owner_id`, `request_id`, `to_modified_date`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/accounts/list-accounts
   */
  query(connectionId: string, params: AccountQueryParams | undefined, options: OperationOptions): Promise<QueuedRequest>;
  /**
   * Update account: `PUT /connections/{connection_id}/accounts`, queued for QuickBooks.
   *
   * The answer comes to `webhookUrl` as one webhook.
   * Params go in the JSON body.
   *
   * Fields: `account_number`, `account_type`, `bank_number`, `currency_ref`, `desc`, `edit_sequence` (required), `include_ret_element`, `is_active`, `list_id` (required), `name`, `open_balance`, `open_balance_date`, `parent_ref`, `request_id`, `sales_tax_code_ref`, `tax_line_id`.
   *
   * Resolves to the queued request.
   * @see https://docs.qubesync.com/api-reference/v2/accounts/update-account
   */
  update(connectionId: string, params: AccountUpdateParams, options: OperationOptions): Promise<QueuedRequest>;
}

/**
 * The params of `account.create`: Create account.
 */
export interface AccountCreateParams {
  /**
   * Account numbers appear in the QuickBooks chart of accounts, Account fields, and reports and graphs. If the IsUsingAccountNumber preference is false (that is, if the QuickBooks user has the account numbers Preference turned off), you can still set account numbers through the SDK, but the numbers won’t be visible in the user interface.
   */
  account_number?: string;
  /**
   * The type of QuickBooks account. You can’t create or modify a non-posting account through the SDK, because QuickBooks creates these accounts behind the scenes. This means that you can’t send an AccountAdd request with an `account_type` of NonPosting.
   */
  account_type: "AccountsPayable" | "AccountsReceivable" | "Bank" | "CostOfGoodsSold" | "CreditCard" | "Equity" | "Expense" | "FixedAsset" | "Income" | "LongTermLiability" | "NonPosting" | "OtherAsset" | "OtherCurrentAsset" | "OtherCurrentLiability" | "OtherExpense" | "OtherIncome";
  /**
   * The bank account number or an identifying note about the account. If a `bank_number` exists in a QuickBooks company file, it will only be returned to applications that have been granted permission to access sensitive data and that are using SDK v2.0 or greater.
   */
  bank_number?: string;
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
  /**
   * A descriptive text field.
   */
  desc?: string;
  detail_account_type?: "AP" | "AR" | "AccumulatedAdjustment" | "AccumulatedAmortization" | "AccumulatedAmortizationOfOtherAssets" | "AccumulatedDepletion" | "AccumulatedDepreciation" | "AdvertisingOrPromotional" | "AllowanceForBadDebts" | "Amortization" | "Auto" | "BadDebts" | "BankCharges" | "Buildings" | "CashOnHand" | "CharitableContributions" | "Checking" | "CommonStock" | "CostOfLabor" | "CostOfLaborCOS" | "CreditCard" | "DepletableAssets" | "Depreciation" | "DevelopmentCosts" | "DiscountsOrRefundsGiven" | "DividendIncome" | "DuesAndSubscriptions" | "EmployeeCashAdvances" | "Entertainment" | "EntertainmentMeals" | "EquipmentRental" | "EquipmentRentalCOS" | "FederalIncomeTaxPayable" | "FurnitureAndFixtures" | "Goodwill" | "Insurance" | "InsurancePayable" | "IntangibleAssets" | "InterestEarned" | "InterestPaid" | "Inventory" | "InvestmentMortgageOrRealEstateLoans" | "InvestmentOther" | "InvestmentTaxExemptSecurities" | "InvestmentUSGovObligations" | "Land" | "LeaseBuyout" | "LeaseholdImprovements" | "LegalAndProfessionalFees" | "Licenses" | "LineOfCredit" | "LoanPayable" | "LoansToOfficers" | "LoansToOthers" | "LoansToStockholders" | "MachineryAndEquipment" | "MoneyMarket" | "NonProfitIncome" | "NotesPayable" | "OfficeOrGeneralAdministrativeExpenses" | "OpeningBalanceEquity" | "OrganizationalCosts" | "OtherCostsOfServiceCOS" | "OtherCurrentAssets" | "OtherCurrentLiab" | "OtherFixedAssets" | "OtherInvestmentIncome" | "OtherLongTermAssets" | "OtherLongTermLiab" | "OtherMiscExpense" | "OtherMiscIncome" | "OtherMiscServiceCost" | "OtherPrimaryIncome" | "OwnersEquity" | "PaidInCapitalOrSurplus" | "PartnerContributions" | "PartnerDistributions" | "PartnersEquity" | "PayrollClearing" | "PayrollExpenses" | "PayrollTaxPayable" | "PenaltiesAndSettlements" | "PreferredStock" | "PrepaidExpenses" | "PrepaidExpensesPayable" | "PromotionalMeals" | "RentOrLeaseOfBuildings" | "RentsHeldInTrust" | "RentsInTrustLiab" | "RepairAndMaintenance" | "Retainage" | "RetainedEarnings" | "SalesOfProductIncome" | "SalesTaxPayable" | "Savings" | "SecurityDeposits" | "ServiceOrFeeIncome" | "ShareholderNotesPayable" | "ShippingFreightAndDelivery" | "ShippingFreightAndDeliveryCOS" | "StateOrLocalIncomeTaxPayable" | "SuppliesAndMaterials" | "SuppliesAndMaterialsCOGS" | "TaxExemptInterest" | "TaxesPaid" | "Travel" | "TravelMeals" | "TreasuryStock" | "TrustAccounts" | "TrustAccountsLiab" | "UndepositedFunds" | "Utilities" | "Vehicles";
  include_ret_element?: Array<"AccountNumber" | "AccountType" | "Balance" | "BankNumber" | "CashFlowClassification" | "CurrencyRef" | "DataExtRet" | "Desc" | "DetailAccountType" | "EditSequence" | "ExternalGUID" | "FullName" | "IsActive" | "IsTaxAccount" | "LastCheckNumber" | "ListID" | "Name" | "OwnerID" | "ParentRef" | "SalesTaxCodeRef" | "SpecialAccountType" | "Sublevel" | "TaxLineInfoRet" | "TimeCreated" | "TimeModified" | "TotalBalance" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name: string;
  /**
   * The amount of money in, or the value of, this account as of `open_balance_date`. On a bank statement, the amount of money in the account at the beginning of the statement period.
   */
  open_balance?: number;
  /**
   * The date when an opening balance was entered for this account.
   *
   * Format: date.
   */
  open_balance_date?: string;
  /**
   * A reference to the list object that is one level above this one. For example, an inventory item with the `full_name` of GermanCars:Mercedes-Benz:CL500I99AA might have a parent object with the `full_name` of GermanCars:Mercedes-Benz. In a request, if a `parent_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  parent_ref?: CurrencyRef;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * An internal representation of the tax line associated with this account.
   */
  tax_line_id?: number;
}

/**
 * The params of `account.query`: List accounts.
 */
export interface AccountQueryParams {
  /**
   * The type of QuickBooks account. You can’t create or modify a non-posting account through the SDK, because QuickBooks creates these accounts behind the scenes. This means that you can’t send an AccountAdd request with an `account_type` of NonPosting.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`account_type`, `active_status`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  account_type?: Array<"AccountsPayable" | "AccountsReceivable" | "Bank" | "CostOfGoodsSold" | "CreditCard" | "Equity" | "Expense" | "FixedAsset" | "Income" | "LongTermLiability" | "NonPosting" | "OtherAsset" | "OtherCurrentAsset" | "OtherCurrentLiability" | "OtherExpense" | "OtherIncome">;
  /**
   * Used in filters to select list objects based on whether or not they are currently enabled for use by QuickBooks. The default value is asActiveOnly, which selects only list objects that are active.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`account_type`, `active_status`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  active_status?: "ActiveOnly" | "All" | "InactiveOnly";
  /**
   * Filters by the specified currency.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`account_type`, `active_status`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  currency_filter?: CurrencyFilter;
  /**
   * Filters results to objects modified on or after this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to 00:00:00.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`account_type`, `active_status`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  from_modified_date?: string;
  /**
   * `full_name` (along with `list_id`) is a way to identify a list object. The `full_name` is the name prefixed by the names of each ancestor, for example Jones:Kitchen:Cabinets. `full_name` values aren’t case-sensitive.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`account_type`, `active_status`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  full_name?: string[];
  include_ret_element?: Array<"AccountNumber" | "AccountType" | "Balance" | "BankNumber" | "CashFlowClassification" | "CurrencyRef" | "DataExtRet" | "Desc" | "DetailAccountType" | "EditSequence" | "FullName" | "IsActive" | "IsTaxAccount" | "LastCheckNumber" | "ListID" | "Name" | "ParentRef" | "SalesTaxCodeRef" | "SpecialAccountType" | "Sublevel" | "TaxLineInfoRet" | "TimeCreated" | "TimeModified" | "TotalBalance">;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`account_type`, `active_status`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  list_id?: string[];
  /**
   * Limits the number of objects that a query returns. (To get a count of how many objects could possibly be returned, use the `meta_data` query attribute.) If you include a `max_returned` value, it must be at least 1.
   *
   * QuickBooks doesn't page this query: at most this many records come back, in one answer, with no sign of whether more matched. Leave it out for every match, in one answer; one over 4 MB as the Web Connector sends it, about 3 MB of qbXML isn't kept (`error_type` `response_too_large`), so narrow a large one with its filters.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`account_type`, `active_status`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Minimum 1.
   */
  max_returned?: number;
  /**
   * Use the `meta_data` attribute to control whether query responses include counts. Options are NoMetaData (default), MetaDataOnly (count only), and MetaDataAndResponseData (count plus objects). Counts are approximate and may vary slightly if records are created or deleted during processing.
   */
  meta_data?: "MetaDataAndResponseData" | "MetaDataOnly" | "NoMetaData";
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`account_type`, `active_status`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_filter?: NameFilter;
  /**
   * Filters according to the object’s Name.
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`account_type`, `active_status`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   */
  name_range_filter?: NameRangeFilter;
  /**
   * `owner_id` identifies who owns the data extension. Use 0 for QuickBooks custom fields that appear in the UI, or use a GUID for private extensions owned by an app. Keep private GUIDs confidential unless you intentionally share extensions across apps. If you do share them, both apps must use the same `owner_id` and `data_ext_name`, because that pair uniquely identifies the extension.
   */
  owner_id?: string[];
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * Filters results to objects modified on or before this timestamp. QuickBooks Desktop accepts 1970-01-01 through 2038-01-19T03:14:07. If only a date is provided, time defaults to end-of-day (23:59:59).
   *
   * Choose at most one of: `list_id`, or `full_name`, or the set (`account_type`, `active_status`, `currency_filter`, `from_modified_date`, `max_returned`, `name_filter`, `name_range_filter`, `to_modified_date`). Members of a set combine with each other, not with the other choices.
   *
   * Format: date-time.
   */
  to_modified_date?: string;
}

/**
 * The params of `account.update`: Update account.
 */
export interface AccountUpdateParams {
  /**
   * Account numbers appear in the QuickBooks chart of accounts, Account fields, and reports and graphs. If the IsUsingAccountNumber preference is false (that is, if the QuickBooks user has the account numbers Preference turned off), you can still set account numbers through the SDK, but the numbers won’t be visible in the user interface.
   */
  account_number?: string;
  /**
   * The type of QuickBooks account. You can’t create or modify a non-posting account through the SDK, because QuickBooks creates these accounts behind the scenes. This means that you can’t send an AccountAdd request with an `account_type` of NonPosting.
   */
  account_type?: "AccountsPayable" | "AccountsReceivable" | "Bank" | "CostOfGoodsSold" | "CreditCard" | "Equity" | "Expense" | "FixedAsset" | "Income" | "LongTermLiability" | "NonPosting" | "OtherAsset" | "OtherCurrentAsset" | "OtherCurrentLiability" | "OtherExpense" | "OtherIncome";
  /**
   * The bank account number or an identifying note about the account. If a `bank_number` exists in a QuickBooks company file, it will only be returned to applications that have been granted permission to access sensitive data and that are using SDK v2.0 or greater.
   */
  bank_number?: string;
  /**
   * A currency record defines how QuickBooks stores and displays a currency. Built-in currency name/code values are fixed; formatting and active status can vary by settings and workflow.
   */
  currency_ref?: CurrencyRef;
  /**
   * A descriptive text field.
   */
  desc?: string;
  /**
   * `edit_sequence` is a server-generated revision token. It changes each time the object is updated. To modify an existing object, you must send the current `edit_sequence`. If your value is stale, the update is rejected to prevent overwriting newer changes.
   */
  edit_sequence: string;
  include_ret_element?: Array<"AccountNumber" | "AccountType" | "Balance" | "BankNumber" | "CashFlowClassification" | "CurrencyRef" | "DataExtRet" | "Desc" | "DetailAccountType" | "EditSequence" | "ExternalGUID" | "FullName" | "IsActive" | "IsTaxAccount" | "LastCheckNumber" | "ListID" | "Name" | "OwnerID" | "ParentRef" | "SalesTaxCodeRef" | "SpecialAccountType" | "Sublevel" | "TaxLineInfoRet" | "TimeCreated" | "TimeModified" | "TotalBalance" | "TxnID" | "TxnNumber">;
  /**
   * If `is_active` is true, this object is currently enabled for use by QuickBooks. The default value is true.
   */
  is_active?: boolean;
  /**
   * `list_id` and `full_name` both identify a list object. QuickBooks assigns `list_id` when the object is created. `list_id` values are unique within a list type, not globally across all lists. If both `full_name` and `list_id` are supplied in a request, QuickBooks uses `list_id` and ignores `full_name`.
   */
  list_id: string;
  /**
   * Name is the case-insensitive short name of a list object (without ancestors). It must be unique within its hierarchy scope. Hierarchical lists can reuse the same Name in different branches because `full_name` remains distinct.
   */
  name?: string;
  /**
   * The amount of money in, or the value of, this account as of `open_balance_date`. On a bank statement, the amount of money in the account at the beginning of the statement period.
   */
  open_balance?: number;
  /**
   * The date when an opening balance was entered for this account.
   *
   * Format: date.
   */
  open_balance_date?: string;
  /**
   * A reference to the list object that is one level above this one. For example, an inventory item with the `full_name` of GermanCars:Mercedes-Benz:CL500I99AA might have a parent object with the `full_name` of GermanCars:Mercedes-Benz. In a request, if a `parent_ref` aggregate includes both `full_name` and `list_id`, `full_name` will be ignored.
   */
  parent_ref?: CurrencyRef;
  /**
   * Your own label for the request, sent to QuickBooks as its qbXML `requestID` and echoed in the raw answer (`response_xml`); optional, since the answer's webhook already carries the request's `id`.
   */
  request_id?: string;
  /**
   * `sales_tax_code_ref` points to the sales-tax code used for an item or customer context. QuickBooks includes default TAX and NON codes, and a code can be deleted only when nothing references it. If sales tax is disabled, QuickBooks assigns the default non-taxable code. If both `full_name` and `list_id` are provided in `sales_tax_code_ref`, `full_name` is ignored.
   */
  sales_tax_code_ref?: CurrencyRef;
  /**
   * An internal representation of the tax line associated with this account.
   */
  tax_line_id?: number;
}
