import axios from 'axios';
import authHeader from './auth-header';

const API_URL = '/api/user';

const getProfile = () => {
    return axios.get(API_URL + '/profile', { headers: authHeader() });
};

const updateProfile = (userData) => {
    return axios.put(API_URL + '/profile', userData, { headers: authHeader() });
};

const UserService = {
    getProfile,
    updateProfile,
};

export default UserService;
