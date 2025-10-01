import axios from 'axios';
import AuthService from './auth.service';

const API_URL = '/api/user';

const getAuthHeader = () => {
    const user = AuthService.getCurrentUser();
    return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const getProfile = () => {
    return axios.get(API_URL + '/profile', { headers: getAuthHeader() });
};

const updateProfile = (userData) => {
    return axios.put(API_URL + '/profile', userData, { headers: getAuthHeader() });
};

const UserService = {
    getProfile,
    updateProfile,
};

export default UserService;
