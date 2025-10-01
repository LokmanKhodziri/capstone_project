import React, { useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const ChartDisplay = ({ expenseSummaryData, monthlyExpenseData, user, totalSpending }) => {
  const [activeTab, setActiveTab] = useState('category');

  const pieChartData = {
    labels: expenseSummaryData.map(item => item.category),
    datasets: [
      {
        label: 'Spending by Category',
        data: expenseSummaryData.map(item => item.total),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyBarChartData = {
    labels: monthlyExpenseData.map(d => monthNames[d.month - 1]),
    datasets: [
      {
        label: 'Total Expenses by Month',
        data: monthlyExpenseData.map(d => d.totalAmount),
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1
      }
    ]
  };

  const unspent = Math.max(0, (user?.monthlyIncome || 0) - totalSpending);
  const incomeVsSpendingPieChartData = {
    labels: ['Spent', 'Unspent'],
    datasets: [
      {
        data: [totalSpending, unspent],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB']
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 18
        }
      }
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <ul className="nav nav-pills card-header-pills">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'category' ? 'active' : ''}`} onClick={() => setActiveTab('category')}>Category Spending</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>Income vs. Spending</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>Monthly Trend</button>
          </li>
        </ul>
      </div>
      <div className="card-.body">
        <div style={{ height: '400px' }}>
          {activeTab === 'category' && (expenseSummaryData.length > 0 ? <Pie data={pieChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Spending by Category'}}}} /> : <p className="text-center">No category data for this month.</p>)}
          {activeTab === 'income' && <Pie data={incomeVsSpendingPieChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Income vs. Spending'}}}} />}
          {activeTab === 'monthly' && (monthlyExpenseData.length > 0 ? <Bar data={monthlyBarChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Monthly Expense Trend'}}}} /> : <p className="text-center">Not enough data for monthly trend.</p>)}
        </div>
      </div>
    </div>
  );
};

export default ChartDisplay;
