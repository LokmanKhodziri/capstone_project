import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ExpenseService from '../services/expense.service';

const AddExpense = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: 'Other'
  });
  const [loading, setLoading] = useState(false);

  const { description, amount, date, category } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    ExpenseService.createExpense(formData).then(() => {
      setLoading(false);
      navigate('/');
      window.location.reload();
    });
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Add Expense</h2>
              <form onSubmit={onSubmit}>
                <div className="form-group mb-3">
                  <label>Description</label>
                  <input
                    type="text"
                    className="form-control"
                    name="description"
                    value={description}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    value={amount}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={date}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Category</label>
                  <select
                    className="form-control"
                    name="category"
                    value={category}
                    onChange={onChange}
                  >
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading && (
                      <span className="spinner-border spinner-border-sm"></span>
                    )}{" "}
                    Add Expense
                  </button>
                  <Link to="/" className="btn btn-secondary">Back to Dashboard</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
