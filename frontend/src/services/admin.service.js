import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/admin/';

const getAllUsers = () => axios.get(API_URL + "users", { headers: authHeader() });

const getExpensesByUserId = (userId) =>
  axios.get(API_URL + "expenses", { params: { userId }, headers: authHeader() });

const updateUserRole = (userId, role) => {
  return axios.put(API_URL + `users/${userId}/role`, { role }, { headers: authHeader() });
};

const adminService = {
  getAllUsers,
  getExpensesByUserId,
  updateUserRole,
};

export default adminService;