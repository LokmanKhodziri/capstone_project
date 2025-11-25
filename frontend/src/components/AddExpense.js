import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ExpenseService from "../services/expense.service";
import RecurringExpenseService from "../services/recurring-expense.service";
import {
  FaPlus,
  FaArrowLeft,
  FaDollarSign,
  FaCalendarAlt,
  FaTag,
  FaSyncAlt,
  FaFileAlt,
} from "react-icons/fa";

const AddExpense = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: "",
    category: "Other",
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState(1);
  const [loading, setLoading] = useState(false);

  const { description, amount, date, category } = formData;

  const repeatedExpenses = [
    { description: "Car Payment", category: "Utilities" },
    { description: "House Payment", category: "Utilities" },
    { description: "Internet Bill", category: "Utilities" },
    { description: "Phone Bill", category: "Utilities" },
  ];

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRepeatedExpenseChange = (e) => {
    const selectedExpense = repeatedExpenses.find(
      (ex) => ex.description === e.target.value
    );
    if (selectedExpense) {
      setFormData({
        ...formData,
        description: selectedExpense.description,
        category: selectedExpense.category,
        amount: "",
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isRecurring) {
      const recurringExpense = { ...formData, recurrenceDayOfMonth };
      RecurringExpenseService.createRecurringExpense(recurringExpense).then(
        () => {
          setLoading(false);
          navigate("/");
          window.location.reload();
        }
      );
    } else {
      ExpenseService.createExpense(formData).then(() => {
        setLoading(false);
        navigate("/");
        window.location.reload();
      });
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">
              <FaPlus />
            </div>
            <h2 className="form-title">Add Expense</h2>
            <p className="form-subtitle">
              Track your spending and manage your finances
            </p>
          </div>

          <form onSubmit={onSubmit} className="expense-form">
            <div className="form-section">
              <h4 className="section-title">
                <FaFileAlt className="me-2" />
                Basic Information
              </h4>

              <div className="form-group">
                <label className="form-label">
                  <FaFileAlt className="me-2" />
                  Description
                </label>
                <input
                  type="text"
                  className="form-control expense-input"
                  name="description"
                  value={description}
                  onChange={onChange}
                  placeholder="What did you spend on?"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaDollarSign className="me-2" />
                  Amount
                </label>
                <input
                  type="number"
                  className="form-control expense-input"
                  name="amount"
                  value={amount}
                  onChange={onChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaCalendarAlt className="me-2" />
                  Date
                </label>
                <input
                  type="date"
                  className="form-control expense-input"
                  name="date"
                  value={date}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaTag className="me-2" />
                  Category
                </label>
                <select
                  className="form-control expense-input"
                  name="category"
                  value={category}
                  onChange={onChange}>
                  <option value="Food">🍽️ Food</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Utilities">⚡ Utilities</option>
                  <option value="Entertainment">🎬 Entertainment</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h4 className="section-title">
                <FaSyncAlt className="me-2" />
                Quick Templates
              </h4>

              <div className="form-group">
                <label className="form-label">Common Expenses</label>
                <select
                  className="form-control expense-input"
                  onChange={handleRepeatedExpenseChange}>
                  <option value="">Select a common expense template</option>
                  {repeatedExpenses.map((ex) => (
                    <option key={ex.description} value={ex.description}>
                      {ex.description} ({ex.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <h4 className="section-title">
                <FaSyncAlt className="me-2" />
                Recurring Options
              </h4>

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isRecurring">
                  Make this a recurring expense
                </label>
              </div>

              {isRecurring && (
                <div className="form-group">
                  <label className="form-label">Day of Month</label>
                  <input
                    type="number"
                    className="form-control expense-input"
                    name="recurrenceDayOfMonth"
                    value={recurrenceDayOfMonth}
                    onChange={(e) => setRecurrenceDayOfMonth(e.target.value)}
                    min="1"
                    max="31"
                    placeholder="1-31"
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn expense-btn-primary"
                disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Adding Expense...
                  </>
                ) : (
                  <>
                    <FaPlus className="me-2" />
                    Add Expense
                  </>
                )}
              </button>

              <Link to="/" className="btn expense-btn-secondary">
                <FaArrowLeft className="me-2" />
                Back to Dashboard
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
