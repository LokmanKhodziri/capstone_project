import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from '../services/auth.service';

const AdminPrivateRoute = () => {
  const currentUser = AuthService.getCurrentUser();

  const getRoles = (u) => {
    if (!u) return [];
    if (typeof u.role === 'string' && u.role) return [u.role];
    if (Array.isArray(u.roles) && u.roles.length) return u.roles;
    if (Array.isArray(u.authorities) && u.authorities.length) {
      return u.authorities.map(a => (typeof a === 'string' ? a : a.authority || a.role || '')).filter(Boolean);
    }
    return [];
  };

  const roles = getRoles(currentUser);
  const isAdmin = roles.some(r => String(r).toUpperCase().includes('ADMIN'));

  return isAdmin ? <Outlet /> : <Navigate to="/profile" />;
};

export default AdminPrivateRoute;
