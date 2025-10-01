import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExpenseService from '../services/expense.service';
import UserService from '../services/user.service';
import ChartDisplay from './ChartDisplay';
import { FaPlus, FaMoneyBillWave, FaChartLine, FaPercentage } from 'react-icons/fa';

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
        const summaryResponse = await ExpenseService.getExpenseSummary(year, month);
        const monthlySummaryResponse = await ExpenseService.getMonthlyExpenseSummary(year);

        let calculatedTotalSpending = 0;
        if (summaryResponse.data && summaryResponse.data.length > 0) {
          setExpenseSummaryData(summaryResponse.data);
          calculatedTotalSpending = summaryResponse.data.reduce((sum, item) => sum + item.total, 0);
          setTotalSpending(calculatedTotalSpending);
        }

        if (monthlySummaryResponse.data && monthlySummaryResponse.data.length > 0) {
          setMonthlyExpenseData(monthlySummaryResponse.data);
        }

        if (userResponse.data.monthlyIncome !== undefined && userResponse.data.monthlyIncome !== null) {
          const monthlyIncome = userResponse.data.monthlyIncome;
          if (monthlyIncome > 0) {
            setPercentageOfIncomeSpent((calculatedTotalSpending / monthlyIncome) * 100);
          } else {
            setPercentageOfIncomeSpent(0);
          }
        } else {
          setPercentageOfIncomeSpent(0);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className='text-center'>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid p-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3">Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.username || 'User'}!</p>
        </div>
        <Link to="/add" className="btn btn-primary">
          <FaPlus className="me-2" />
          Add Expense
        </Link>
      </header>

      <div className="row">
        <div className="col-lg-8">
          <ChartDisplay
            expenseSummaryData={expenseSummaryData}
            monthlyExpenseData={monthlyExpenseData}
            user={user}
            totalSpending={totalSpending}
          />
        </div>
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <FaMoneyBillWave size={30} className="text-success" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="card-title">Monthly Income</h5>
                  <p className="card-text fs-4">{user?.monthlyIncome ? `RM${user.monthlyIncome.toFixed(2)}` : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <FaChartLine size={30} className="text-danger" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="card-title">Total Spending (This Month)</h5>
                  <p className="card-text fs-4">{`RM${totalSpending.toFixed(2)}`}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <FaPercentage size={30} className="text-warning" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="card-title">% of Income Spent</h5>
                  <p className="card-text fs-4">{`${percentageOfIncomeSpent.toFixed(2)}%`}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title text-center mb-3">Spending Summary by Category</h5>
              {expenseSummaryData.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {expenseSummaryData.map((item, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {item.category}
                      <span className="badge bg-primary rounded-pill">{`RM${item.total.toFixed(2)}`}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center">No detailed expense data for this month.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
