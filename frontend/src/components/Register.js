import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthService from "../services/auth.service";
import {
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("danger");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { username, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    AuthService.register(username, email, password).then(
      (response) => {
        setMessageType("success");
        setMessage(response.data.message);
        setLoading(false);
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setMessageType("danger");
        setMessage(resMessage);
        setLoading(false);
      }
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <FaUserPlus />
            </div>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">
              Join us and start tracking your expenses
            </p>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <FaUser className="me-2" />
                Username
              </label>
              <input
                type="text"
                className="form-control auth-input"
                name="username"
                value={username}
                onChange={onChange}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaEnvelope className="me-2" />
                Email Address
              </label>
              <input
                type="email"
                className="form-control auth-input"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaLock className="me-2" />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control auth-input"
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="Create a password"
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn auth-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <FaUserPlus className="me-2" />
                  Create Account
                </>
              )}
            </button>

            {message && (
              <div
                className={`alert auth-alert alert-${messageType}`}
                role="alert">
                {message}
              </div>
            )}
          </form>

          <div className="auth-footer">
            <p className="auth-link-text">
              Already have an account?
              <Link to="/login" className="auth-link">
                {" "}
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
