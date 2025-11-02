import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RecurringExpenseService from "../services/recurring-expense.service";
import {
  FaSyncAlt,
  FaCalendarAlt,
  FaTag,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

const RecurringExpenseList = () => {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    RecurringExpenseService.getRecurringExpenses()
      .then((response) => {
        setRecurringExpenses(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching recurring expenses:", error);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this recurring expense?")
    ) {
      RecurringExpenseService.deleteRecurringExpense(id)
        .then(() => {
          setRecurringExpenses(recurringExpenses.filter((re) => re.id !== id));
        })
        .catch((error) => {
          console.error("Error deleting recurring expense:", error);
        });
    }
  };

  const getNextPaymentDate = (dayOfMonth) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Create date for this month
    let nextPayment = new Date(currentYear, currentMonth, dayOfMonth);

    // If the day has already passed this month, move to next month
    if (nextPayment <= today) {
      nextPayment = new Date(currentYear, currentMonth + 1, dayOfMonth);
    }

    return nextPayment.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading recurring expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">
            <FaSyncAlt className="me-2 text-primary" />
            Recurring Expenses
          </h2>
          <p className="text-muted mb-0">
            Manage your monthly recurring payments
          </p>
        </div>
        <Link to={"/add"} className="btn btn-primary">
          <FaPlus className="me-2" />
          Add Recurring Expense
        </Link>
      </div>

      {/* Recurring Expenses Grid */}
      <div className="row">
        {recurringExpenses.length > 0 ? (
          recurringExpenses.map((recurringExpense) => (
            <div key={recurringExpense.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card recurring-expense-card h-100">
                <div className="card-body d-flex flex-column">
                  {/* Card Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="recurring-indicator">
                      <FaSyncAlt className="text-primary" />
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(recurringExpense.id)}
                      title="Delete recurring expense">
                      <FaTrash />
                    </button>
                  </div>

                  {/* Expense Details */}
                  <h5 className="card-title mb-3">
                    {recurringExpense.description}
                  </h5>

                  <div className="expense-amount mb-3">
                    <span className="amount-value">
                      RM{recurringExpense.amount.toFixed(2)}
                    </span>
                    <span className="amount-period">/month</span>
                  </div>

                  {/* Expense Info */}
                  <div className="expense-info mb-3">
                    <div className="info-item mb-2">
                      <FaTag className="me-2 text-muted" />
                      <span className="badge bg-info">
                        {recurringExpense.category}
                      </span>
                    </div>
                    <div className="info-item">
                      <FaCalendarAlt className="me-2 text-muted" />
                      <span className="text-muted">
                        Day {recurringExpense.recurrenceDayOfMonth} of each
                        month
                      </span>
                    </div>
                  </div>

                  {/* Next Payment Info */}
                  <div className="mt-auto">
                    <div className="next-payment-info">
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        Next payment:{" "}
                        {getNextPaymentDate(
                          recurringExpense.recurrenceDayOfMonth
                        )}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="empty-state text-center py-5">
              <FaSyncAlt
                className="text-muted mb-3"
                style={{ fontSize: "3rem" }}
              />
              <h4 className="text-muted mb-3">No Recurring Expenses</h4>
              <p className="text-muted mb-4">
                You haven't set up any recurring expenses yet. Add your first
                recurring expense to get started.
              </p>
              <Link to={"/add"} className="btn btn-primary">
                <FaPlus className="me-2" />
                Add Your First Recurring Expense
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringExpenseList;
