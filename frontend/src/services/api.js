// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
});

// Request interceptor to add token
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('accessToken');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // Response interceptor to handle errors
// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         if (error.response?.status === 401) {
//             // Token expired, try to refresh
//             try {
//                 const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
//                     withCredentials: true
//                 });
                
//                 if (refreshResponse.data.success) {
//                     // Retry original request
//                     return api(error.config);
//                 }
//             } catch (refreshError) {
//                 // Refresh failed, redirect to login
//                 localStorage.removeItem('accessToken');
//                 window.location.href = '/auth';
//             }
//         }
//         return Promise.reject(error);
//     }
// );

export default api;