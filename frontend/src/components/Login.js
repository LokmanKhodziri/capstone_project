import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthService from "../services/auth.service";
import { FaSignInAlt, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("danger");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { username, password } = formData;

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setMessageType("info");
      setMessage("You are already logged in.");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, [navigate]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    AuthService.login(username, password).then(
      (response) => {
        setMessageType("success");
        setMessage(response.message);
        setLoading(false);
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 2000);
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
              <FaSignInAlt />
            </div>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account</p>
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
                placeholder="Enter your username"
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
                  placeholder="Enter your password"
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
                  Signing In...
                </>
              ) : (
                <>
                  <FaSignInAlt className="me-2" />
                  Sign In
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
              Don't have an account?
              <Link to="/register" className="auth-link">
                {" "}
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
