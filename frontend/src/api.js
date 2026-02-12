import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api/v1' });

// Add the token to every request automatically
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const login = (formData) => API.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
export const register = (formData) => API.post('/auth/register', formData);
export const predictTransaction = (data) => API.post('/predict', data);
export const getHistory = () => API.get('/history');