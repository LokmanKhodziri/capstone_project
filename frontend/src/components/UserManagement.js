import React, { useState, useEffect } from "react";
import AdminService from "../services/admin.service";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleUsers, setVisibleUsers] = useState(9);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        setLoading(true);
        AdminService.getAllUsers()
            .then((response) => setUsers(response.data || []))
            .catch(error => {
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
            .catch(error => {
                console.error("Error updating user role:", error);
                setError("Failed to update user role.");
            });
    };

    const handleRevokeAdmin = (userId) => {
        AdminService.updateUserRole(userId, "USER")
            .then(() => {
                fetchUsers();
            })
            .catch(error => {
                console.error("Error updating user role:", error);
                setError("Failed to update user role.");
            });
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showMore = () => {
        setVisibleUsers(prevVisibleUsers => prevVisibleUsers + 9);
    };

    return (
        <div className="container mt-4 user-management">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h3 mb-0">User Management</h2>
                <div className="text-muted small">Total users: {users.length}</div>
            </div>

            <div className="row mb-4 user-controls">
                <div className="col-12">
                    <div className="input-group user-search-wrapper">
                        <input
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
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                        >Clear</button>
                    </div>
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
                                    <span className={`user-role-badge ${user.role === 'ADMIN' ? 'admin' : 'user'}`}>{user.role}</span>
                                </div>

                                <div className="mt-auto user-actions d-flex w-100 justify-content-center">
                                    {user.username !== 'admin' && (
                                        user.role === 'ADMIN' ? (
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={() => handleRevokeAdmin(user.id)}
                                            >
                                                Revoke Admin
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleGrantAdmin(user.id)}
                                            >
                                                Grant Admin
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="empty-state p-4 text-center">
                            <h4>No users found.</h4>
                            <p className="mb-0">Try clearing your filters or add new users.</p>
                        </div>
                    </div>
                )}
            </div>

            {filteredUsers.length > visibleUsers && (
                <div className="text-center mt-4">
                    <button className="btn btn-primary" onClick={showMore}>
                        Show More
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
