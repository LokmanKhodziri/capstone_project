import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import expenseService from "../services/expense.service";

const UpdateExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Other");

  useEffect(() => {
    if (!id) {
      setError("Missing expense id");
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    expenseService
      .getExpenseById(id)
      .then((res) => {
        const data = res && res.data ? res.data : res;
        console.log("Fetched expense data:", data);
        if (!mounted) return;
        setDescription(data.description ?? "");
        setAmount(data.amount ?? "");

        const rawDate = data.date; // Prioritize data.date
        let dateStr = "";
        if (rawDate) {
          try {
            // Attempt to parse as a Date object
            const d = new Date(rawDate);
            // Check if the date is valid and then format it to YYYY-MM-DD
            if (!isNaN(d.getTime())) { // Check for valid date
              dateStr = d.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error("Error parsing date:", rawDate, e);
            // Fallback if parsing fails, try to slice if it's a string
            if (typeof rawDate === "string" && rawDate.length >= 10) {
              dateStr = rawDate.slice(0, 10);
            }
          }
        }
        setDate(dateStr);
        setCategory(data.category ?? "Other");
      })
      .catch((err) => {
        console.error("Failed to load expense:", err);
        // show HTTP response body if available
        if (err && err.response) {
          console.error("response data:", err.response.data);
          setError("Failed to load expense: " + (err.response.data?.message || JSON.stringify(err.response.data)));
        } else {
          setError("Failed to load expense: " + (err.message || err));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // normalize payload: amount should be a number, date as ISO yyyy-mm-dd
      const payload = {
        description,
        amount: amount === "" ? null : Number(amount),
        date: date || null,
        category,
      };
      console.log("Updating expense payload:", payload);
      const res = await expenseService.updateExpense(id, payload);
      console.log("Update response:", res);
      navigate("/"); // Redirect to dashboard (root path) after update
    } catch (err) {
      console.error("Update failed:", err);
      // surface server error details for debugging
      if (err && err.response) {
        console.error("server response data:", err.response.data);
        setError(
          "Update failed: " +
          (err.response.data?.message ||
            err.response.data?.error ||
            JSON.stringify(err.response.data))
        );
      } else {
        setError("Update failed: " + (err.message || String(err)));
      }
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Update Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Description</label>
            <input
              type="text"
              className="form-control"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              onChange={(e) => setAmount(e.target.value)}
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
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Food</option>
              <option>Travel</option>
              <option>Utilities</option>
              <option>Entertainment</option>
              <option>Other</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Update Expense</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateExpense;