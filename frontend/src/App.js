import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './components/Login';
import Register from './components/Register';
import ExpenseList from './components/ExpenseList';
import AddExpense from './components/AddExpense';
import UpdateExpense from './components/UpdateExpense';
import UserManagement from './components/UserManagement';
import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';

import AuthService from './services/auth.service';

import RecurringExpenseList from './components/RecurringExpenseList';
import YearlyReport from './components/YearlyReport';

function App() {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
      setIsAdmin(user.role === 'ADMIN');
    }
  }, []);

  const logOut = (e) => {
    e.preventDefault();
    AuthService.logout().then(
      response => {
        setNotification({ type: 'success', message: response.data.message });
        setCurrentUser(undefined);
        setIsAdmin(false);
        setTimeout(() => {
          setNotification(null);
          window.location.href = '/login';
        }, 3000);
      },
      error => {
        setNotification({ type: 'danger', message: 'Logout failed.' });
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    );
  };

  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Expense Tracker</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {currentUser && (
                  <>
                    <li className="nav-item">
                      <Link to={"/expenses"} className="nav-link">
                        Expenses
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to={"/yearly-report"} className="nav-link">
                        Yearly Report
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to={"/recurring"} className="nav-link">
                        Recurring
                      </Link>
                    </li>
                  </>
                )}
                {isAdmin && (
                  <li className="nav-item">
                    <Link to={"/admin"} className="nav-link">
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
              {currentUser ? (
                <div className="navbar-nav ml-auto">
                  <li className="nav-item fw-bolder">
                    <Link to={"/profile"} className="nav-link">
                      {currentUser.username}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <a href="/login" className="nav-link" onClick={logOut}>
                      Logout
                    </a>
                  </li>
                </div>
              ) : (
                <div className="navbar-nav ml-auto">
                  <li className="nav-item">
                    <Link to={"/login"} className="nav-link">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={"/register"} className="nav-link">
                      Register
                    </Link>
                  </li>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="container mt-4">
          {notification && (
            <div className={`alert alert-${notification.type}`} role="alert">
              {notification.message}
            </div>
          )}

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<ExpenseList />} />
              <Route path="/yearly-report" element={<YearlyReport />} />
              <Route path="/add" element={<AddExpense />} />
              <Route path="/update/:id" element={<UpdateExpense />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/recurring" element={<RecurringExpenseList />} />
            </Route>

            <Route element={<AdminPrivateRoute />}>
              <Route path="/admin" element={<UserManagement />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
