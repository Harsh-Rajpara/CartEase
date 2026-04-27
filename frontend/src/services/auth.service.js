// frontend/src/services/auth.service.js
import api from './api';
// https://cartease-backend-rdw1.onrender.com/
const authService = {
    // Regular User Registration
    sendEmailOTP: (email) => {
        return api.post('api/register/send-email-otp', { email });
    },
    
    verifyEmailOTP: (email, otp) => {
        return api.post('/register/verify-email-otp', { email, otp });
    },
    
    sendPhoneOTP: (email, phone) => {
        return api.post('/register/send-phone-otp', { email, phone });
    },
    
    verifyPhoneOTP: (email, phone, otp) => {
        return api.post('/register/verify-phone-otp', { email, phone, otp });
    },
    
    completeRegistration: (userData) => {
        return api.post('/register/complete', userData);
    },
    
    // Seller Registration
    registerSeller: (sellerData) => {
        return api.post('/auth/seller/register', sellerData);
    },
    
    // Login
    login: (identifier, password) => {
        return api.post('/auth/login', { identifier, password });
    },
    
    loginWithOTP: (identifier, otp) => {
        return api.post('/auth/verify-otp', { identifier, otp });
    },
    
    sendLoginOTP: (identifier) => {
        return api.post('/auth/send-otp', { identifier });
    },
    
    logout: () => {
        return api.post('/auth/logout');
    },
    
    getCurrentUser: () => {
        return api.get('/auth/me');
    },
};

export default authService;