import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExpenseService from "../services/expense.service";
import { FaFilter, FaCalendarAlt } from "react-icons/fa";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All");
    setMonthFilter("All");
    setStartDate("");
    setEndDate("");
  };

  useEffect(() => {
    ExpenseService.getAll().then(
      (response) => {
        setExpenses(response.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  const deleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      ExpenseService.deleteExpense(id).then(() => {
        setExpenses(expenses.filter((expense) => expense.id !== id));
      });
    }
  };

  const filteredExpenses = expenses
    .filter((expense) =>
      expense.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(
      (expense) =>
        categoryFilter === "All" || expense.category === categoryFilter
    )
    .filter((expense) => {
      if (monthFilter === "All") {
        return true;
      }
      const expenseMonth = new Date(expense.date).getMonth();
      return expenseMonth === parseInt(monthFilter);
    })
    .filter((expense) => {
      if (!startDate || !endDate) {
        return true;
      }
      const expenseDate = new Date(expense.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return expenseDate >= start && expenseDate <= end;
    });

  const categories = [
    "All",
    "Food",
    "Travel",
    "Utilities",
    "Entertainment",
    "Other",
  ];

  const months = [
    "All",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3">Expense List</h2>
        <Link to={"/add"} className="btn btn-primary">
          Add Expense
        </Link>
      </div>

      {/* Enhanced Filter Section */}
      <div className="filter-section mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="filter-section-header">
            <h5 className="mb-1">
              <FaFilter className="me-2 text-primary" />
              Filter & Search Expenses
            </h5>
            <p className="text-muted mb-0 small">
              Refine your expense list with advanced filters
            </p>
          </div>
          <button
            className="btn btn-outline-primary filter-toggle-btn"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            aria-expanded={isFilterVisible}
            aria-controls="expense-filters">
            <i
              className={`fas fa-chevron-${isFilterVisible ? "up" : "down"
                } me-2`}></i>
            {isFilterVisible ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div
          id="expense-filters"
          className={`filter-container ${isFilterVisible ? "expanded" : "collapsed"
            }`}>
          <div className="row expense-filters">
            {/* Search Filter */}
            <div className="col-lg-10 col-md-6 mb-3">
              <label className="form-label filter-label">
                <i className="fas fa-search me-1"></i>
                Search Description
              </label>
              <div className="input-group mobile-input-group">
                <input
                  type="text"
                  className="form-control filter-input"
                  placeholder="Type to search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search expenses by description"
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search">
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="col-lg-5 col-md-6 mb-3">
              <label className="form-label filter-label">
                <FaFilter className="me-1" />
                Category
              </label>
              <div className="input-group mobile-input-group">
                <select
                  className="form-select mobile-filter-select filter-input"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter by category">
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month Filter */}
            <div className="col-lg-5 col-md-6 mb-3">
              <label className="form-label filter-label">
                <FaCalendarAlt className="me-1" />
                Month
              </label>
              <div className="input-group mobile-input-group">
                <select
                  className="form-select mobile-filter-select filter-input"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  aria-label="Filter by month">
                  {months.map((month, index) => (
                    <option key={month} value={index === 0 ? "All" : index - 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="col-lg-5 col-md-6 mb-3">
              <label className="form-label filter-label">
                <i className="fas fa-calendar-alt me-1"></i>
                Start Date
              </label>
              <div className="input-group mobile-input-group">
                <input
                  type="date"
                  className="form-control filter-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  aria-label="Filter from start date"
                />
              </div>
            </div>
            <div className="col-lg-5 col-md-6 mb-3">
              <label className="form-label filter-label">
                <i className="fas fa-calendar-alt me-1"></i>
                End Date
              </label>
              <div className="input-group mobile-input-group">
                <input
                  type="date"
                  className="form-control filter-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  aria-label="Filter to end date"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery ||
            categoryFilter !== "All" ||
            monthFilter !== "All" ||
            startDate ||
            endDate) && (
              <div className="active-filters">
                {searchQuery && (
                  <span className="filter-badge">
                    Search: "{searchQuery}"
                    <span
                      className="remove-filter"
                      onClick={() => setSearchQuery("")}>
                      ×
                    </span>
                  </span>
                )}
                {categoryFilter !== "All" && (
                  <span className="filter-badge">
                    Category: {categoryFilter}
                    <span
                      className="remove-filter"
                      onClick={() => setCategoryFilter("All")}>
                      ×
                    </span>
                  </span>
                )}
                {monthFilter !== "All" && (
                  <span className="filter-badge">
                    Month: {months[parseInt(monthFilter) + 1]}
                    <span
                      className="remove-filter"
                      onClick={() => setMonthFilter("All")}>
                      ×
                    </span>
                  </span>
                )}
                {startDate && (
                  <span className="filter-badge">
                    From: {new Date(startDate).toLocaleDateString()}
                    <span
                      className="remove-filter"
                      onClick={() => setStartDate("")}>
                      ×
                    </span>
                  </span>
                )}
                {endDate && (
                  <span className="filter-badge">
                    To: {new Date(endDate).toLocaleDateString()}
                    <span
                      className="remove-filter"
                      onClick={() => setEndDate("")}>
                      ×
                    </span>
                  </span>
                )}
              </div>
            )}

          {/* Filter Actions */}
          <div className="filter-actions">
            <div className="filter-results">
              <span className="filter-count">
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </span>
            </div>
            <div className="filter-buttons">
              <button
                className="btn btn-outline-secondary filter-clear-btn"
                onClick={handleClearFilters}
                disabled={
                  !searchQuery &&
                  categoryFilter === "All" &&
                  monthFilter === "All" &&
                  !startDate &&
                  !endDate
                }>
                <i className="fas fa-eraser me-1"></i>
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <div key={expense.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-10.0">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{expense.description}</h5>
                  <p className="card-text text-success fs-4">{`RM${expense.amount.toFixed(
                    2
                  )}`}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      {new Date(expense.date).toLocaleDateString()}
                    </small>
                  </p>
                  <p className="card-text">
                    <span className="badge bg-info">{expense.category}</span>
                  </p>
                  <div className="mt-auto d-flex justify-content-end">
                    <Link
                      to={`/update/${expense.id}`}
                      className="btn btn-sm btn-outline-primary me-2">
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="btn btn-sm btn-outline-danger">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p className="text-center">No expenses found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
