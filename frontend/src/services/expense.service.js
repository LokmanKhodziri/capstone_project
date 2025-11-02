import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api/";

const getAll = () => axios.get(API_URL + "expenses", { headers: authHeader() });
// alias for code that calls expenseService.get()
const get = () => getAll();

const createExpense = (payload) => axios.post(API_URL + "expenses", payload, { headers: authHeader() });
const updateExpense = (id, payload) => axios.put(API_URL + `expenses/${id}`, payload, { headers: authHeader() });
const getExpenseById = (id) => axios.get(API_URL + `expenses/${id}`, { headers: authHeader() });
const deleteExpense = (id) => axios.delete(API_URL + `expenses/${id}`, { headers: authHeader() });

const getExpenseSummary = (year, month) => {
    return axios.get(API_URL + `expenses/summary/${year}/${month}`, { headers: authHeader() });
};

const getMonthlyExpenseSummary = (year, category, includeRecurring = true) => {
    let url = API_URL + `expenses/summary/monthly/${year}`;
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (includeRecurring === false) params.push(`includeRecurring=false`);
    if (params.length) url += `?${params.join('&')}`;
    return axios.get(url, { headers: authHeader() });
};

const getYearlyExpenseSummary = (category, includeRecurring = true) => {
    let url = API_URL + `expenses/summary/years`;
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (includeRecurring === false) params.push(`includeRecurring=false`);
    if (params.length) url += `?${params.join('&')}`;
    return axios.get(url, { headers: authHeader() });
};

const getCategories = () => {
    return axios.get(API_URL + `expenses/categories`, { headers: authHeader() });
};

const expenseService = { getAll, get, createExpense, updateExpense, getExpenseById, deleteExpense, getExpenseSummary, getMonthlyExpenseSummary, getYearlyExpenseSummary, getCategories };
export default expenseService;
