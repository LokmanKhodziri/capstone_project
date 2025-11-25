import React, { useState, useEffect, useMemo } from "react";
import AdminService from "../services/admin.service";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleUsers, setVisibleUsers] = useState(9);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    AdminService.getAllUsers()
      .then((response) => {
        setUsers(response.data || []);
        setLastRefreshed(new Date());
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users.");
      })
      .finally(() => setLoading(false));
  };

  const handleGrantAdmin = (userId) => {
    AdminService.updateUserRole(userId, "ADMIN")
      .then(() => {
        fetchUsers();
      })
      .catch((error) => {
        console.error("Error updating user role:", error);
        setError("Failed to update user role.");
      });
  };

  const handleRevokeAdmin = (userId) => {
    AdminService.updateUserRole(userId, "USER")
      .then(() => {
        fetchUsers();
      })
      .catch((error) => {
        console.error("Error updating user role:", error);
        setError("Failed to update user role.");
      });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = useMemo(() => users.length, [users]);
  const adminCount = useMemo(
    () => users.filter((user) => user.role === "ADMIN").length,
    [users]
  );
  const standardCount = useMemo(
    () => users.filter((user) => user.role !== "ADMIN").length,
    [users]
  );
  const adminCoverage = totalUsers
    ? Math.round((adminCount / totalUsers) * 100)
    : 0;
  const visibleCount = Math.min(filteredUsers.length, visibleUsers);
  const formattedLastRefresh = useMemo(() => {
    if (!lastRefreshed) return "Awaiting sync";
    return `Synced ${lastRefreshed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }, [lastRefreshed]);

  const statCards = [
    {
      label: "Administrators",
      value: adminCount,
      meta: `${adminCoverage}% coverage`,
    },
    {
      label: "Standard users",
      value: standardCount,
      meta: "Default role",
    },
    {
      label: "Search results",
      value: filteredUsers.length,
      meta: searchQuery ? `Filtered by "${searchQuery}"` : "No filters applied",
    },
  ];

  const showMore = () => {
    setVisibleUsers((prevVisibleUsers) => prevVisibleUsers + 9);
  };

  return (
    <div className="container-fluid user-management-page py-4">
      <div className="user-hero mb-4">
        <div>
          <p className="user-hero-eyebrow">Admin console</p>
          <h2 className="user-hero-title">User Management</h2>
          <p className="user-hero-subtitle">
            Keep access aligned with responsibility. Promote, demote, and search
            all users in one place.
          </p>
        </div>
        <div className="user-hero-meta">
          <span className="user-hero-chip primary">
            Total users · {totalUsers}
          </span>
          <span className="user-hero-chip accent">Admins · {adminCount}</span>
          <span className="user-hero-chip secondary">
            {formattedLastRefresh}
          </span>
        </div>
      </div>

      <div className="user-stat-grid mb-4">
        {statCards.map((card) => (
          <div key={card.label} className="user-stat-card">
            <span className="stat-label">{card.label}</span>
            <span className="stat-value">{card.value}</span>
            <span className="stat-meta">{card.meta}</span>
          </div>
        ))}
      </div>

      <div className="user-toolbar mb-4">
        <div className="flex-grow-1">
          <label
            className="form-label text-muted small mb-1"
            htmlFor="user-search">
            Search directory
          </label>
          <div className="input-group user-search-wrapper">
            <input
              id="user-search"
              type="text"
              className="form-control"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search users"
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search">
              Clear
            </button>
          </div>
        </div>
        <div className="user-toolbar-meta">
          <span className="result-pill">
            Showing {visibleCount} of {filteredUsers.length} results
          </span>
          <button
            className="btn refresh-btn"
            type="button"
            onClick={fetchUsers}
            disabled={loading}>
            {loading ? "Refreshing..." : "Refresh list"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="user-grid">
        {loading ? (
          <div className="col-12 text-center">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.slice(0, visibleUsers).map((user) => (
            <div key={user.id} className="user-card p-3">
              <div className="d-flex flex-column h-100 align-items-center text-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                  alt="Profile"
                  className="user-avatar mb-3"
                />
                <h5 className="mb-1">{user.username}</h5>
                <p className="mb-1 text-muted small">{user.email}</p>
                <div className="mb-3">
                  <span
                    className={`user-role-badge ${
                      user.role === "ADMIN" ? "admin" : "user"
                    }`}>
                    {user.role}
                  </span>
                </div>

                <div className="mt-auto user-actions d-flex w-100 justify-content-center">
                  {user.username !== "admin" &&
                    (user.role === "ADMIN" ? (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleRevokeAdmin(user.id)}>
                        Revoke Admin
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleGrantAdmin(user.id)}>
                        Grant Admin
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="empty-state p-4 text-center">
              <h4>No users found.</h4>
              <p className="mb-0">
                Try clearing your filters or add new users.
              </p>
            </div>
          </div>
        )}
      </div>

      {filteredUsers.length > visibleUsers && (
        <div className="text-center mt-4">
          <button className="btn btn-primary show-more-btn" onClick={showMore}>
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
