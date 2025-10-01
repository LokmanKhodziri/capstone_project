import axios from "axios";
import AuthService from "./auth.service";

const API_URL = "/api/";

const getAuthHeader = () => {
  const u = AuthService.getCurrentUser();
  return u && u.token ? { Authorization: `Bearer ${u.token}` } : {};
};

const getAll = () => axios.get(API_URL + "expenses", { headers: getAuthHeader() });
// alias for code that calls expenseService.get()
const get = () => getAll();

const createExpense = (payload) => axios.post(API_URL + "expenses", payload, { headers: getAuthHeader() });
const updateExpense = (id, payload) => axios.put(API_URL + `expenses/${id}`, payload, { headers: getAuthHeader() });
const getExpenseById = (id) => axios.get(API_URL + `expenses/${id}`, { headers: getAuthHeader() });
const deleteExpense = (id) => axios.delete(API_URL + `expenses/${id}`, { headers: getAuthHeader() });

const getExpenseSummary = (year, month) => {
    return axios.get(API_URL + `expenses/summary/${year}/${month}`, { headers: getAuthHeader() });
};

const getMonthlyExpenseSummary = (year) => {
    return axios.get(API_URL + `expenses/summary/monthly/${year}`, { headers: getAuthHeader() });
};

const expenseService = { getAll, get, createExpense, updateExpense, getExpenseById, deleteExpense, getExpenseSummary, getMonthlyExpenseSummary };
export default expenseService;
