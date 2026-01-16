import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./ProformaCalculator.css";

interface MonthlyFinancialData {
  month: string;
  // Revenue items
  bCommerceSubscriptions: number;
  creditCardCommissions: number;
  shippingProfits: number;
  threePLEasy: number;
  totalRevenue: number;
  // COGS items
  cogsBCommerce: number;
  cogsCreditCard: number;
  cogsShipping: number;
  cogsThreePL: number;
  otherCOGS: number;
  totalCOGS: number;
  // Profit
  grossProfit: number;
  // Operating Expenses items
  salaries: number;
  payrollTaxes: number;
  rent: number;
  utilities: number;
  facebookAds: number;
  insurance: number;
  resellerFee: number;
  softwareSubscriptions: number;
  indeedRecruiting: number;
  totalOperatingExpenses: number;
  // Net Operating Income
  netOperatingIncome: number;
  // Other Income/Expenses
  otherIncome: number;
  interestExpense: number;
  taxes: number;
  depreciation: number;
  totalOther: number;
  // Net Income
  netIncomePreDraw: number;
  ownersDraw: number;
  netIncome: number;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const ProformaCalculator: React.FC = () => {
  // Tab state for switching between tables
  const [activeTab, setActiveTab] = useState<number>(0);

  // Input fields from Assumptions tab - matching Excel Assumptions sheet
  const [aov, setAov] = useState<number>(0);
  const [monthlySubscriptionEcommerce, setMonthlySubscriptionEcommerce] =
    useState<number>(0);
  const [monthlySubscriptionWholesale, setMonthlySubscriptionWholesale] =
    useState<number>(0);
  const [endUserMonthlySalesOrders, setEndUserMonthlySalesOrders] =
    useState<number>(0);
  const [commissionPerShipment, _setCommissionPerShipment] =
    useState<number>(0.5);
  const [commissionInput, _setCommissionInput] = useState<string>("0.5");
  const [creditCardCommissions, _setCreditCardCommissions] =
    useState<number>(0.0071);
  const [creditCardInput, _setCreditCardInput] = useState<string>("0.0071");
  const [annualChurnRate, setAnnualChurnRate] = useState<number>(0);

  // Calculate financial data using Excel formulas from Proforma (12-Month) tab
  const monthlyData = useMemo((): MonthlyFinancialData[] => {
    // Calculate base values
    const baseCreditCard =
      (monthlySubscriptionEcommerce + monthlySubscriptionWholesale) *
      endUserMonthlySalesOrders *
      aov *
      creditCardCommissions;
    const baseShipping =
      (monthlySubscriptionEcommerce + monthlySubscriptionWholesale) *
      120 *
      commissionPerShipment;
    const baseBCommerce =
      498 * monthlySubscriptionEcommerce + 4000 * monthlySubscriptionWholesale;

    // Arrays to store cumulative values
    const creditCardValues: number[] = [];
    const shippingValues: number[] = [];

    return MONTHS.map((month, monthIndex) => {
      // Revenue calculations based on Excel formulas
      // B7: bCommerce Subscriptions (Annual) = (498*Assumptions!B7)+(4000*Assumptions!B8)
      // Same for all months
      const bCommerceSubscriptions = baseBCommerce;

      // B8: Credit Card Processing Commissions
      // Month 1: ((Assumptions!B7+Assumptions!B8)*(Assumptions!B9)*Assumptions!B6)*Assumptions!B11
      // Month 2: B8+B8 (doubles)
      // Month 3+: Previous month + 2340
      let creditCardCommissionsRevenue: number;
      if (monthIndex === 0) {
        creditCardCommissionsRevenue = baseCreditCard;
      } else if (monthIndex === 1) {
        creditCardCommissionsRevenue = baseCreditCard * 2;
      } else {
        creditCardCommissionsRevenue = creditCardValues[monthIndex - 1] + 2340;
      }
      creditCardValues[monthIndex] = creditCardCommissionsRevenue;

      // B9: Shipping Profits
      // Month 1: ((Assumptions!B7+Assumptions!B8)*120)*Assumptions!B10
      // Month 2: B9+B9 (doubles)
      // Month 3+: Previous month + 3900
      let shippingProfitsRevenue: number;
      if (monthIndex === 0) {
        shippingProfitsRevenue = baseShipping;
      } else if (monthIndex === 1) {
        shippingProfitsRevenue = baseShipping * 2;
      } else {
        shippingProfitsRevenue = shippingValues[monthIndex - 1] + 3900;
      }
      shippingValues[monthIndex] = shippingProfitsRevenue;

      // B10: 3PL Easy (currently 0 in Excel)
      const threePLEasy = 0;

      // B11: Total Revenue = SUM(B7:B10)
      const totalRevenue =
        bCommerceSubscriptions +
        creditCardCommissionsRevenue +
        shippingProfitsRevenue +
        threePLEasy;

      // COGS calculations (50% of revenue for each stream)
      // B14: Costs of bCommerce = B7/2
      const cogsBCommerce = bCommerceSubscriptions / 2;
      // B15: Costs of Credit Card = B8/2
      const cogsCreditCard = creditCardCommissionsRevenue / 2;
      // B16: Costs of Shipping = B9/2
      const cogsShipping = shippingProfitsRevenue / 2;
      // B17: Costs of 3PL Easy = B10/2
      const cogsThreePL = threePLEasy / 2;
      // B18: Other COGS (0 in Excel)
      const otherCOGS = 0;
      // B19: Total COGS = SUM(B14:B18)
      const totalCOGS =
        cogsBCommerce + cogsCreditCard + cogsShipping + cogsThreePL + otherCOGS;

      // B20: Gross Profit = B11 - B19
      const grossProfit = totalRevenue - totalCOGS;

      // Operating Expenses
      // B23: Salaries & Commission Payments = B11 * 0.3
      const salaries = totalRevenue * 0.3;
      // B24-B26: Payroll Taxes, Rent, Utilities (all 0)
      const payrollTaxes = 0;
      const rent = 0;
      const utilities = 0;
      // B27: Facebook Ads = 1300 (constant for all months)
      const facebookAds = 1300;
      // B28: Insurance (0)
      const insurance = 0;
      // B29: bCommerce Reseller Initiation Fee = 10000 (only month 1)
      const resellerFee = monthIndex === 0 ? 10000 : 0;
      // B30: Software & Subscriptions = 700 (constant)
      const softwareSubscriptions = 700;
      // B31: Indeed Recruiting Expense = 500 (constant)
      const indeedRecruiting = 500;
      // B32: Total Operating Expenses = SUM(B23:B31)
      const totalOperatingExpenses =
        salaries +
        payrollTaxes +
        rent +
        utilities +
        facebookAds +
        insurance +
        resellerFee +
        softwareSubscriptions +
        indeedRecruiting;

      // B33: Net Operating Income = B20 - B32
      const netOperatingIncome = grossProfit - totalOperatingExpenses;

      // Other Income/Expenses (all 0 in Excel)
      const otherIncome = 0;
      const interestExpense = 0;
      const taxes = 0;
      const depreciation = 0;
      const totalOther = otherIncome - interestExpense - taxes - depreciation;

      // B41: Net Income (Pre-Owner Draw) = B33 + B40
      const netIncomePreDraw = netOperatingIncome + totalOther;
      // B42: Owner's Draw (0 in Excel)
      const ownersDraw = 0;
      // B43: Net Income (After Draw) = B41 - B42
      const netIncome = netIncomePreDraw - ownersDraw;

      return {
        month,
        // Revenue
        bCommerceSubscriptions,
        creditCardCommissions: creditCardCommissionsRevenue,
        shippingProfits: shippingProfitsRevenue,
        threePLEasy,
        totalRevenue,
        // COGS
        cogsBCommerce,
        cogsCreditCard,
        cogsShipping,
        cogsThreePL,
        otherCOGS,
        totalCOGS,
        // Profit
        grossProfit,
        // Operating Expenses
        salaries,
        payrollTaxes,
        rent,
        utilities,
        facebookAds,
        insurance,
        resellerFee,
        softwareSubscriptions,
        indeedRecruiting,
        totalOperatingExpenses,
        // Net Operating Income
        netOperatingIncome,
        // Other Income/Expenses
        otherIncome,
        interestExpense,
        taxes,
        depreciation,
        totalOther,
        // Net Income
        netIncomePreDraw,
        ownersDraw,
        netIncome,
      };
    });
  }, [
    aov,
    monthlySubscriptionEcommerce,
    monthlySubscriptionWholesale,
    endUserMonthlySalesOrders,
    commissionPerShipment,
    creditCardCommissions,
    annualChurnRate,
  ]);

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <div className="header-top">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h1>12-Month Pro Forma Calculator</h1>
        </div>
        <p className="subtitle">
          Financial Projections Based on Key Assumptions
        </p>
      </div>

      <div className="inputs-section">
        <h2
          style={{ color: "#ffffff", marginBottom: "24px", fontSize: "1.2rem" }}
        >
          Assumptions
        </h2>
        <div className="inputs-grid">
          <div className="input-group">
            <label htmlFor="aov">
              Average Order Value (AOV)
              <br />
              for End Users ($)
            </label>
            <input
              id="aov"
              type="number"
              min="0"
              step="0.01"
              value={aov || ""}
              onChange={(e) => setAov(parseFloat(e.target.value) || 0)}
              placeholder="Enter AOV"
            />
          </div>

          <div className="input-group">
            <label htmlFor="subscription-ecommerce">
              Monthly Subscription Sales - eCommerce Plan Revenue ($)
            </label>
            <input
              id="subscription-ecommerce"
              type="number"
              min="0"
              step="0.01"
              value={monthlySubscriptionEcommerce || ""}
              onChange={(e) =>
                setMonthlySubscriptionEcommerce(parseFloat(e.target.value) || 0)
              }
              placeholder="Enter eCommerce subscription revenue"
            />
          </div>

          <div className="input-group">
            <label htmlFor="subscription-wholesale">
              Monthly Subscription Sales
              <br />- Wholesale ($)
            </label>
            <input
              id="subscription-wholesale"
              type="number"
              min="0"
              step="0.01"
              value={monthlySubscriptionWholesale || ""}
              onChange={(e) =>
                setMonthlySubscriptionWholesale(parseFloat(e.target.value) || 0)
              }
              placeholder="Enter wholesale subscription revenue"
            />
          </div>

          <div className="input-group">
            <label htmlFor="sales-orders">
              End User Monthly
              <br />
              Sales Orders
            </label>
            <input
              id="sales-orders"
              type="number"
              min="0"
              step="1"
              value={endUserMonthlySalesOrders || ""}
              onChange={(e) =>
                setEndUserMonthlySalesOrders(parseFloat(e.target.value) || 0)
              }
              placeholder="Enter monthly sales orders"
            />
          </div>

          <div className="input-group">
            <label htmlFor="commission">
              Commission Per Sale for Each Shipment ($)
            </label>
            <input
              id="commission"
              type="text"
              inputMode="decimal"
              value={commissionInput}
              disabled={true}
              style={{ opacity: 0.7, cursor: "not-allowed" }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="credit-card">
              Credit Card
              <br />
              Commissions (Rate)
            </label>
            <input
              id="credit-card"
              type="text"
              inputMode="decimal"
              value={creditCardInput}
              disabled={true}
              style={{ opacity: 0.7, cursor: "not-allowed" }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="churn-rate">
              Annual Churn
              <br />
              Rate (%)
            </label>
            <input
              id="churn-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={annualChurnRate || ""}
              onChange={(e) =>
                setAnnualChurnRate(parseFloat(e.target.value) || 0)
              }
              placeholder="Enter annual churn rate"
            />
          </div>
        </div>
      </div>

      <div className="categories-section">
        <h2
          style={{ color: "#ffffff", marginBottom: "32px", fontSize: "1.5rem" }}
        >
          Financial Projections
        </h2>

        <div className="category-card">
          <div className="category-chart">
            <h3>Financial Metrics Overview</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.2)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.7)" }}
                />
                <YAxis
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.7)" }}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a2d47",
                    border: "1px solid #a8c0b1",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                  labelStyle={{
                    color: "#ffffff",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      // Color mapping for each data key
                      const colorMap: { [key: string]: string } = {
                        totalRevenue: "#4CAF50",
                        totalCOGS: "#9E9E9E",
                        grossProfit: "#2196F3",
                        totalOperatingExpenses: "#E91E63",
                        netOperatingIncome: "#FF9800",
                        netIncomePreDraw: "#9C27B0",
                        netIncome: "#F44336",
                      };

                      // Name mapping for display
                      const nameMap: { [key: string]: string } = {
                        totalRevenue: "Total Revenue",
                        totalCOGS: "Total COGS",
                        grossProfit: "Gross Profit",
                        totalOperatingExpenses: "Total Operating Expenses",
                        netOperatingIncome: "Net Operating Income",
                        netIncomePreDraw: "Net Income (Pre-Draw)",
                        netIncome: "Net Income",
                      };

                      return (
                        <div
                          style={{
                            backgroundColor: "#0a2d47",
                            border: "1px solid #a8c0b1",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                        >
                          <p
                            style={{
                              color: "#ffffff",
                              fontWeight: 600,
                              marginBottom: "8px",
                              margin: "0 0 8px 0",
                            }}
                          >
                            {label}
                          </p>
                          {payload.map((entry, index) => {
                            const color =
                              colorMap[entry.dataKey as string] || entry.color;
                            const name =
                              nameMap[entry.dataKey as string] || entry.name;
                            return (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: "6px",
                                  color: "#ffffff",
                                }}
                              >
                                <div
                                  style={{
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "2px",
                                    backgroundColor: color,
                                    marginRight: "8px",
                                    flexShrink: 0,
                                  }}
                                />
                                <span style={{ marginRight: "8px" }}>
                                  {name}:
                                </span>
                                <span style={{ fontWeight: 600 }}>
                                  ${(entry.value as number).toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ color: "#ffffff" }} iconType="line" />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  dot={{ fill: "#4CAF50", r: 4 }}
                  name="Total Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="totalCOGS"
                  stroke="#9E9E9E"
                  strokeWidth={2}
                  dot={{ fill: "#9E9E9E", r: 4 }}
                  name="Total COGS"
                />
                <Line
                  type="monotone"
                  dataKey="grossProfit"
                  stroke="#2196F3"
                  strokeWidth={2}
                  dot={{ fill: "#2196F3", r: 4 }}
                  name="Gross Profit"
                />
                <Line
                  type="monotone"
                  dataKey="totalOperatingExpenses"
                  stroke="#E91E63"
                  strokeWidth={2}
                  dot={{ fill: "#E91E63", r: 4 }}
                  name="Total Operating Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="netOperatingIncome"
                  stroke="#FF9800"
                  strokeWidth={3}
                  dot={{ fill: "#FF9800", r: 5 }}
                  name="Net Operating Income"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="netIncomePreDraw"
                  stroke="#9C27B0"
                  strokeWidth={2}
                  dot={{ fill: "#9C27B0", r: 4 }}
                  name="Net Income (Pre-Draw)"
                />
                <Line
                  type="monotone"
                  dataKey="netIncome"
                  stroke="#F44336"
                  strokeWidth={2}
                  dot={{ fill: "#F44336", r: 4 }}
                  name="Net Income"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table - Key Metrics */}
          <div className="category-table" style={{ marginTop: "32px" }}>
            <h3>Key Financial Metrics Summary</h3>
            <div>
              <div className="table-header">
                <div>Month</div>
                <div>Total Revenue</div>
                <div>Total COGS</div>
                <div>Gross Profit</div>
                <div>Total Operating Expenses</div>
                <div>Net Operating Income</div>
                <div>Net Income (Pre-Draw)</div>
                <div>Net Income</div>
              </div>
              {monthlyData.map((month, idx) => (
                <div key={idx} className="table-row">
                  <div>{month.month}</div>
                  <div>
                    $
                    {month.totalRevenue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div>
                    $
                    {month.totalCOGS.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div>
                    $
                    {month.grossProfit.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div>
                    $
                    {month.totalOperatingExpenses.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div>
                    <strong>
                      $
                      {month.netOperatingIncome.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div>
                    $
                    {month.netIncomePreDraw.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div>
                    $
                    {month.netIncome.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              ))}
              {/* Total Row */}
              <div
                className="table-row"
                style={{
                  background: "rgba(168, 192, 177, 0.3)",
                  borderTop: "2px solid #a8c0b1",
                  fontWeight: 700,
                  marginTop: "8px",
                }}
              >
                <div>Total</div>
                <div>
                  <strong>
                    $
                    {monthlyData
                      .reduce((sum, month) => sum + month.totalRevenue, 0)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </strong>
                </div>
                <div>
                  <strong>
                    $
                    {monthlyData
                      .reduce((sum, month) => sum + month.totalCOGS, 0)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </strong>
                </div>
                <div>
                  <strong>
                    $
                    {monthlyData
                      .reduce((sum, month) => sum + month.grossProfit, 0)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </strong>
                </div>
                <div>
                  <strong>
                    $
                    {monthlyData
                      .reduce(
                        (sum, month) => sum + month.totalOperatingExpenses,
                        0
                      )
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </strong>
                </div>
                <div>
                  <strong>
                    $
                    {monthlyData
                      .reduce((sum, month) => sum + month.netOperatingIncome, 0)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </strong>
                </div>
                <div>
                  <strong>
                    $
                    {monthlyData
                      .reduce((sum, month) => sum + month.netIncomePreDraw, 0)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </strong>
                </div>
                <div>
                  <strong>
                    $
                    {monthlyData
                      .reduce((sum, month) => sum + month.netIncome, 0)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        {true && (
          <div className="tabs-container" style={{ marginTop: "32px" }}>
            <div className="tabs-header">
              <button
                className={`tab-button ${activeTab === 0 ? "active" : ""}`}
                onClick={() => setActiveTab(0)}
              >
                Revenue
              </button>
              <button
                className={`tab-button ${activeTab === 1 ? "active" : ""}`}
                onClick={() => setActiveTab(1)}
              >
                COGS
              </button>
              <button
                className={`tab-button ${activeTab === 2 ? "active" : ""}`}
                onClick={() => setActiveTab(2)}
              >
                Operating Expenses
              </button>
              <button
                className={`tab-button ${activeTab === 3 ? "active" : ""}`}
                onClick={() => setActiveTab(3)}
              >
                Income Statement
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Revenue Table */}
              {activeTab === 0 && (
                <div className="category-card">
                  <h3
                    style={{
                      color: "#ffffff",
                      marginBottom: "24px",
                      fontSize: "1.3rem",
                    }}
                  >
                    Revenue
                  </h3>
                  <div className="category-table">
                    <div>
                      <div className="table-header">
                        <div>Month</div>
                        <div>bCommerce Subscriptions</div>
                        <div>Credit Card Commissions</div>
                        <div>Shipping Profits</div>
                        <div>3PL Easy</div>
                        <div>Total Revenue</div>
                      </div>
                      {monthlyData.map((month, idx) => (
                        <div key={idx} className="table-row">
                          <div>{month.month}</div>
                          <div>
                            $
                            {month.bCommerceSubscriptions.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </div>
                          <div>
                            $
                            {month.creditCardCommissions.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </div>
                          <div>
                            $
                            {month.shippingProfits.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.threePLEasy.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            <strong>
                              $
                              {month.totalRevenue.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* COGS Table */}
              {activeTab === 1 && (
                <div className="category-card">
                  <h3
                    style={{
                      color: "#ffffff",
                      marginBottom: "24px",
                      fontSize: "1.3rem",
                    }}
                  >
                    Cost of Goods Sold (COGS)
                  </h3>
                  <div className="category-table">
                    <div>
                      <div className="table-header">
                        <div>Month</div>
                        <div>Costs of bCommerce</div>
                        <div>Costs of Credit Card</div>
                        <div>Costs of Shipping</div>
                        <div>Costs of 3PL Easy</div>
                        <div>Other COGS</div>
                        <div>Total COGS</div>
                      </div>
                      {monthlyData.map((month, idx) => (
                        <div key={idx} className="table-row">
                          <div>{month.month}</div>
                          <div>
                            $
                            {month.cogsBCommerce.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.cogsCreditCard.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.cogsShipping.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.cogsThreePL.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.otherCOGS.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            <strong>
                              $
                              {month.totalCOGS.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Operating Expenses Table */}
              {activeTab === 2 && (
                <div className="category-card">
                  <h3
                    style={{
                      color: "#ffffff",
                      marginBottom: "24px",
                      fontSize: "1.3rem",
                    }}
                  >
                    Operating Expenses
                  </h3>
                  <div className="category-table">
                    <div>
                      <div className="table-header">
                        <div>Month</div>
                        <div>Salaries & Commission</div>
                        <div>Payroll Taxes</div>
                        <div>Rent</div>
                        <div>Utilities</div>
                        <div>Facebook Ads</div>
                        <div>Insurance</div>
                        <div>Reseller Fee</div>
                        <div>Software & Subscriptions</div>
                        <div>Indeed Recruiting</div>
                        <div>Total Operating Expenses</div>
                      </div>
                      {monthlyData.map((month, idx) => (
                        <div key={idx} className="table-row">
                          <div>{month.month}</div>
                          <div>
                            $
                            {month.salaries.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.payrollTaxes.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.rent.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.utilities.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.facebookAds.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.insurance.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.resellerFee.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.softwareSubscriptions.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </div>
                          <div>
                            $
                            {month.indeedRecruiting.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            <strong>
                              $
                              {month.totalOperatingExpenses.toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Income Statement Table */}
              {activeTab === 3 && (
                <div className="category-card">
                  <h3
                    style={{
                      color: "#ffffff",
                      marginBottom: "24px",
                      fontSize: "1.3rem",
                    }}
                  >
                    Income Statement Summary
                  </h3>
                  <div className="category-table">
                    <div>
                      <div className="table-header">
                        <div>Month</div>
                        <div>Total Revenue</div>
                        <div>Total COGS</div>
                        <div>Gross Profit</div>
                        <div>Total Operating Expenses</div>
                        <div>Net Operating Income</div>
                        <div>Other Income</div>
                        <div>Interest Expense</div>
                        <div>Taxes</div>
                        <div>Depreciation</div>
                        <div>Total Other</div>
                        <div>Net Income (Pre-Draw)</div>
                        <div>Owner's Draw</div>
                        <div>Net Income (After Draw)</div>
                      </div>
                      {monthlyData.map((month, idx) => (
                        <div key={idx} className="table-row">
                          <div>{month.month}</div>
                          <div>
                            $
                            {month.totalRevenue.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.totalCOGS.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            <strong>
                              $
                              {month.grossProfit.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </strong>
                          </div>
                          <div>
                            $
                            {month.totalOperatingExpenses.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </div>
                          <div>
                            <strong>
                              $
                              {month.netOperatingIncome.toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </strong>
                          </div>
                          <div>
                            $
                            {month.otherIncome.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.interestExpense.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.taxes.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.depreciation.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.totalOther.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.netIncomePreDraw.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            $
                            {month.ownersDraw.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            <strong>
                              $
                              {month.netIncome.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProformaCalculator;
