import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import expenseService from '../services/expense.service';

const UpdateExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: 'Other'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { description, amount, date, category } = formData;

  useEffect(() => {
    if (!id) {
      setError('Missing expense id');
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    expenseService
      .getExpenseById(id)
      .then(res => {
        const data = res && res.data ? res.data : res;
        if (!mounted) return;

        const rawDate = data.date;
        let dateStr = '';
        if (rawDate) {
          try {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Error parsing date:', rawDate, e);
            if (typeof rawDate === 'string' && rawDate.length >= 10) {
              dateStr = rawDate.slice(0, 10);
            }
          }
        }
        setFormData({
          description: data.description ?? '',
          amount: data.amount ?? '',
          date: dateStr,
          category: data.category ?? 'Other'
        });
      })
      .catch(err => {
        console.error('Failed to load expense:', err);
        if (err && err.response) {
          setError('Failed to load expense: ' + (err.response.data?.message || JSON.stringify(err.response.data)));
        } else {
          setError('Failed to load expense: ' + (err.message || err));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        amount: amount === '' ? null : Number(amount)
      };
      await expenseService.updateExpense(id, payload);
      navigate('/');
    } catch (err) {
      console.error('Update failed:', err);
      if (err && err.response) {
        setError('Update failed: ' + (err.response.data?.message || err.response.data?.error || JSON.stringify(err.response.data)));
      } else {
        setError('Update failed: ' + (err.message || String(err)));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-5 text-center">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Update Expense</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
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
                    )}{' '}
                    Update Expense
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

export default UpdateExpense;