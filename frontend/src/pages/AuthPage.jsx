import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import OTPVerification from '../components/auth/OTPVerification';
import { useAuth } from '../hooks/useAuth';
import { Store } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const {
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
    handleOtpRequest,
    handleOtpVerification
  } = useAuth();

  // Auth states
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState(null);

  // Handle OTP request from login
  const handleRequestOTP = () => {
    setShowOtpInput(true);
    setError('');
    setSuccess('');
  };

  // Handle OTP submission
  const handleOTPSubmit = async (otp) => {
    await handleOtpVerification(otp, identifier, identifierType);
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    const success = await handleOtpRequest(identifier);
    if (success) {
      setTimer(30);
      setCanResend(false);
    }
  };

  // Handle back from OTP
  const handleBackFromOTP = () => {
    setShowOtpInput(false);
    setError('');
    setSuccess('');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue shopping"
      error={error}
      success={success}
    >
      {/* Login Flow */}
      {showOtpInput ? (
        <OTPVerification
          identifier={identifier}
          identifierType={identifierType}
          onVerify={handleOTPSubmit}
          onResend={handleResendOTP}
          onBack={handleBackFromOTP}
          loading={loading}
          timer={timer}
          canResend={canResend}
        />
      ) : (
        <LoginForm
          onSubmit={handlePasswordLogin}
          onRequestOTP={handleRequestOTP}
          loading={loading}
        />
      )}

      {/* Create New Account Link */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              New to our store?
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/register"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Create new account
          </Link>
        </div>
      </div>

      {/* Seller Registration Link */}
      <div className="mt-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Sell on ShopEase</span>
          </div>
        </div>
        
        <Link
          to="/seller/register"
          className="mt-4 inline-flex items-center justify-center w-full py-3 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition duration-300"
        >
          <Store className="h-5 w-5 mr-2" />
          Register as a Seller
        </Link>
        <p className="text-xs text-gray-500 mt-2">
          Start selling your products to millions of customers
        </p>
      </div>
    </AuthLayout>
  );
};

export default AuthPage;