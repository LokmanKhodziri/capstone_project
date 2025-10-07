import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ExpenseService from "../services/expense.service";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

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
    );

  const categories = [
    "All",
    "Food",
    "Travel",
    "Utilities",
    "Entertainment",
    "Other",
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3">Expense List</h2>
        <Link to={"/add"} className="btn btn-primary">
          Add Expense
        </Link>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <div key={expense.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
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
