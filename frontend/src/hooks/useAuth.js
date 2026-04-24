// frontend/src/hooks/useAuth.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import axios from 'axios';

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Handle Password Login
  const handlePasswordLogin = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      const isEmail = values.identifier.includes('@');
      const loginData = {
        [isEmail ? 'email' : 'phone']: values.identifier,
        password: values.password,
      };

      // Simulate API call - Replace with actual API
      const response = {
        data: {
          success: true,
          token: 'mock-token',
          user: {
            id: 1,
            fullName: 'Test User',
            email: isEmail ? values.identifier : null,
            phone: !isEmail ? values.identifier : null,
            needsProfileCompletion: false
          }
        }
      };
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        dispatch(setCredentials(response.data));
        
        if (response.data.user.needsProfileCompletion) {
          navigate('/complete-profile');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (signupData) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      const response = {
        data: {
          success: true,
          token: 'mock-token',
          user: {
            id: 1,
            fullName: signupData.fullName,
            email: signupData.email,
            phone: signupData.phone,
            needsProfileCompletion: false
          }
        }
      };
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        dispatch(setCredentials(response.data));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Check if email exists
  const checkEmailExists = async (email) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      const emailExists = false; // Change to true to test
      
      if (emailExists) {
        setError('This email already has an account. Please login.');
        return true;
      }
      return false;
    } catch (err) {
      setError('Error checking email. Please try again.');
      return true;
    } finally {
      setLoading(false);
    }
  };

  // Check if phone exists
  const checkPhoneExists = async (phone) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      const phoneExists = false; // Change to true to test
      
      if (phoneExists) {
        setError('This phone number already has an account. Please login.');
        return true;
      }
      return false;
    } catch (err) {
      setError('Error checking phone number. Please try again.');
      return true;
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Request
  const handleOtpRequest = async (identifier) => {
    setLoading(true);
    setError('');
    
    try {
      setTimer(30);
      setCanResend(false);
      setSuccess(`OTP sent to your ${identifier.includes('@') ? 'email' : 'phone'}`);
      return true;
    } catch (err) {
      setError('Failed to send OTP');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleOtpVerification = async (otp, identifier, identifierType) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      const response = {
        data: {
          success: true,
          token: 'mock-token',
          user: {
            id: 1,
            fullName: 'Test User',
            email: identifierType === 'email' ? identifier : null,
            phone: identifierType === 'phone' ? identifier : null,
            needsProfileCompletion: false
          }
        }
      };

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        dispatch(setCredentials(response.data));
        
        if (response.data.user.needsProfileCompletion) {
          navigate('/complete-profile');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    timer,
    canResend,
    setError,
    setSuccess,
    setTimer,
    setCanResend,
    handlePasswordLogin,
    handleSignup,
    checkEmailExists,
    checkPhoneExists,
    handleOtpRequest,
    handleOtpVerification
  };
};