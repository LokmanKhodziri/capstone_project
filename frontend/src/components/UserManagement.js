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
        <div className="container mt-4">
            <h2 className="h3 mb-4">User Management</h2>

            <div className="row mb-4">
                <div className="col-md-12">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by username or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row">
                {loading ? (
                    <div className="col-12 text-center">Loading users...</div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.slice(0, visibleUsers).map((user) => (
                        <div key={user.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body d-flex flex-column">
                                    <div className="text-center">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                            alt="Profile"
                                            className="img-fluid rounded-circle mb-3"
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                        <h5 className="card-title">{user.username}</h5>
                                        <p className="card-text text-muted">{user.email}</p>
                                        <p className="card-text"><span className={`badge ${user.role === 'ADMIN' ? 'bg-success' : 'bg-secondary'}`}>{user.role}</span></p>
                                    </div>
                                    <div className="mt-auto d-flex justify-content-center">
                                        {user.username !== 'admin' && (
                                            user.role === 'ADMIN' ? (
                                                <button
                                                    className="btn btn-danger"
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
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <p className="text-center">No users found.</p>
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
