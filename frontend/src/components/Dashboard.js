import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExpenseService from "../services/expense.service";
import UserService from "../services/user.service";
import ChartDisplay from "./ChartDisplay";
import {
  FaPlus,
  FaMoneyBillWave,
  FaChartLine,
  FaPercentage,
  FaTachometerAlt,
  FaSyncAlt,
} from "react-icons/fa";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [totalSpending, setTotalSpending] = useState(0);
  const [percentageOfIncomeSpent, setPercentageOfIncomeSpent] = useState(0);
  const [expenseSummaryData, setExpenseSummaryData] = useState([]);
  const [monthlyExpenseData, setMonthlyExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await UserService.getProfile();
        setUser(userResponse.data);

        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const summaryResponse = await ExpenseService.getExpenseSummary(
          year,
          month
        );
        const monthlySummaryResponse =
          await ExpenseService.getMonthlyExpenseSummary(year);

        let calculatedTotalSpending = 0;
        if (summaryResponse.data && summaryResponse.data.length > 0) {
          setExpenseSummaryData(summaryResponse.data);
          calculatedTotalSpending = summaryResponse.data.reduce(
            (sum, item) => sum + item.total,
            0
          );
          setTotalSpending(calculatedTotalSpending);
        }

        if (
          monthlySummaryResponse.data &&
          monthlySummaryResponse.data.length > 0
        ) {
          setMonthlyExpenseData(monthlySummaryResponse.data);
        }

        if (
          userResponse.data.monthlyIncome !== undefined &&
          userResponse.data.monthlyIncome !== null
        ) {
          const monthlyIncome = userResponse.data.monthlyIncome;
          if (monthlyIncome > 0) {
            setPercentageOfIncomeSpent(
              (calculatedTotalSpending / monthlyIncome) * 100
            );
          } else {
            setPercentageOfIncomeSpent(0);
          }
        } else {
          setPercentageOfIncomeSpent(0);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <FaTachometerAlt className="spinner-icon" />
          </div>
          <p className="loading-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1 className="dashboard-title">
            <FaTachometerAlt className="me-3" />
            Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.username || "User"}!
          </p>
        </div>
        <div className="dashboard-actions">
          <Link to="/add" className="btn dashboard-btn-primary">
            <FaPlus className="me-2" />
            Add Expense
          </Link>
          <Link to="/recurring" className="btn dashboard-btn-secondary">
            <FaSyncAlt className="me-2" />
            Recurring Expenses
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <ChartDisplay
            expenseSummaryData={expenseSummaryData}
            monthlyExpenseData={monthlyExpenseData}
            user={user}
            totalSpending={totalSpending}
          />
        </div>

        <div className="dashboard-sidebar">
          <div className="stats-card income-card">
            <div className="stats-icon">
              <FaMoneyBillWave />
            </div>
            <div className="stats-content">
              <h5 className="stats-title">Monthly Income</h5>
              <p className="stats-value">
                {user?.monthlyIncome
                  ? `RM${user.monthlyIncome.toFixed(2)}`
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="stats-card spending-card">
            <div className="stats-icon">
              <FaChartLine />
            </div>
            <div className="stats-content">
              <h5 className="stats-title">Total Spending</h5>
              <p className="stats-value">{`RM${totalSpending.toFixed(2)}`}</p>
              <small className="stats-period">This Month</small>
            </div>
          </div>

          <div className="stats-card percentage-card">
            <div className="stats-icon">
              <FaPercentage />
            </div>
            <div className="stats-content">
              <h5 className="stats-title">% of Income Spent</h5>
              <p className="stats-value">{`${percentageOfIncomeSpent.toFixed(
                2
              )}%`}</p>
            </div>
          </div>

          <div className="summary-card">
            <h5 className="summary-title">Spending by Category</h5>
            {expenseSummaryData.length > 0 ? (
              <div className="summary-list">
                {expenseSummaryData.map((item, index) => (
                  <div key={index} className="summary-item">
                    <span className="summary-category">{item.category}</span>
                    <span className="summary-amount">{`RM${item.total.toFixed(
                      2
                    )}`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="summary-empty">No expense data for this month</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
