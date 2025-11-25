import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/recurring-expenses';

const createRecurringExpense = (recurringExpense) => {
  return axios.post(API_URL, recurringExpense, { headers: authHeader() });
};

const getRecurringExpenses = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

const deleteRecurringExpense = (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
};

export default {
  createRecurringExpense,
  getRecurringExpenses,
  deleteRecurringExpense,
};
