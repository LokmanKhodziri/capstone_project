import axios from 'axios';
import AuthService from './auth.service';

const API_URL = '/api/admin/';

const getAuthHeader = () => {
  const user = AuthService.getCurrentUser();
  return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const getAllUsers = () => axios.get(API_URL + "users", { headers: getAuthHeader() });

const getExpensesByUserId = (userId) =>
  axios.get(API_URL + "expenses", { params: { userId }, headers: getAuthHeader() });

const updateUserRole = (userId, role) => {
  return axios.put(API_URL + `users/${userId}/role`, { role }, { headers: getAuthHeader() });
};

const adminService = {
  getAllUsers,
  getExpensesByUserId,
  updateUserRole,
};

export default adminService;