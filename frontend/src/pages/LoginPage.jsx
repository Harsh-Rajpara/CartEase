import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { Mail, Phone, Lock, Send, Eye, EyeOff, X, Copy, Check, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";

// Validation schemas
const loginSchema = yup.object({
  identifier: yup
    .string()
    .max(100, "Email or phone number is too long")
    .required("Email or phone is required")
    .test("valid-identifier", "Please enter a valid email address or mobile number", (value) => {
      if (!value) return true;
      const isEmail = value.includes("@");
      if (isEmail) {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(value);
      } else {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(value);
      }
    }),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password is too long")
    .required("Password is required"),
});

const otpRequestSchema = yup.object({
  identifier: yup
    .string()
    .max(100, "Email or phone number is too long")
    .required("Email or phone is required")
    .test("valid-identifier", "Please enter a valid email address or mobile number", (value) => {
      if (!value) return true;
      const isEmail = value.includes("@");
      if (isEmail) {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(value);
      } else {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(value);
      }
    }),
});

const otpVerifySchema = yup.object({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .matches(/^\d+$/, "OTP must contain only numbers")
    .required("OTP is required"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const dispatch = useDispatch();

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [currentIdentifier, setCurrentIdentifier] = useState("");
  
  // OTP Popup states
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [copied, setCopied] = useState(false);

  // Timer for OTP resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Auto-close popup after 30 seconds
  useEffect(() => {
    if (showOtpPopup) {
      const autoClose = setTimeout(() => {
        setShowOtpPopup(false);
      }, 30000);
      return () => clearTimeout(autoClose);
    }
  }, [showOtpPopup]);

  // Copy OTP to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Get masked identifier
  const getMaskedIdentifier = (identifier) => {
    if (!identifier) return "";
    if (identifier.includes("@")) {
      const [username, domain] = identifier.split("@");
      const maskedUsername = username.length > 3 
        ? username.slice(0, 3) + "***" 
        : username[0] + "***";
      return `${maskedUsername}@${domain}`;
    } else {
      return identifier.slice(0, 3) + "****" + identifier.slice(-3);
    }
  };

  // Handle Password Login
  const handlePasswordLogin = async (values) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        identifier: values.identifier,
        password: values.password,
      });

      if (response.data?.success) {
        const user = response.data.data;
        dispatch(setUser(user));

        const userRole = user?.role;
        
        if (userRole === "seller") {
          navigate("/seller/dashboard");
        } else if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate(from);
        }
      }
    } catch (err) {
      loginFormik.setFieldError(
        "password",
        err.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    const identifier = otpFormik.values.identifier;
    
    setLoading(true);

    try {
      const response = await api.post("/auth/send-otp", { identifier });

      if (response.data.success) {
        setCurrentIdentifier(identifier);
        setOtpSent(true);
        setTimer(60);
        
        // Check if OTP is returned in response
        if (response.data.data?.otp) {
          setGeneratedOtp(response.data.data.otp);
          setShowOtpPopup(true);
          otpFormik.setFieldValue("otp", response.data.data.otp);
        }
      }
    } catch (err) {
      otpFormik.setFieldError(
        "identifier",
        err.response?.data?.message || "Failed to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (values) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-otp", {
        identifier: currentIdentifier,
        otp: values.otp,
      });

      if (response.data.success) {
        const userData = response.data.data;
        dispatch(setUser(userData));
        
        // Close popup if open
        setShowOtpPopup(false);
        
        setTimeout(() => {
          if (userData.role === "seller") {
            navigate("/seller/dashboard");
          } else if (userData.role === "admin") {
            navigate("/admin");
          } else {
            navigate(from);
          }
        }, 1500);
      }
    } catch (err) {
      otpFormik.setFieldError(
        "otp",
        err.response?.data?.message || "Invalid OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (timer > 0) return;
    handleSendOTP();
  };

  const switchToOtpMode = () => {
    setShowOtpInput(true);
    setOtpSent(false);
    setShowOtpPopup(false);
    otpFormik.setValues({ identifier: loginFormik.values.identifier, otp: "" });
    otpFormik.setErrors({});
    otpFormik.setTouched({});
  };

  const switchToPasswordMode = () => {
    setShowOtpInput(false);
    setOtpSent(false);
    setTimer(0);
    setShowOtpPopup(false);
    loginFormik.setValues({
      identifier: otpFormik.values.identifier,
      password: "",
    });
    loginFormik.setErrors({});
    loginFormik.setTouched({});
  };

  const getIdentifierIcon = (value) => {
    if (value?.includes("@")) {
      return <Mail className="h-5 w-5 text-gray-400" />;
    }
    return <Phone className="h-5 w-5 text-gray-400" />;
  };

  // Login form with Formik
  const loginFormik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema: loginSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handlePasswordLogin(values);
    },
  });

  // OTP Request Formik
  const otpFormik = useFormik({
    initialValues: {
      identifier: "",
      otp: "",
    },
    validationSchema: otpRequestSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (!otpSent) {
        await handleSendOTP();
      }
    },
  });

  // OTP Verify Formik
  const otpVerifyFormik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: otpVerifySchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleVerifyOTP(values);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 px-2">
            Get access to your Orders and Recommendations
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
          {/* Back button for OTP mode */}
          {showOtpInput && (
            <button
              onClick={switchToPasswordMode}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 focus:outline-none transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to password login
            </button>
          )}

          {!showOtpInput ? (
            // Password Login Form
            <form onSubmit={loginFormik.handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Mobile number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIdentifierIcon(loginFormik.values.identifier)}
                  </div>
                  <input
                    type="text"
                    name="identifier"
                    value={loginFormik.values.identifier}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                    maxLength={100}
                    className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                      loginFormik.touched.identifier && loginFormik.errors.identifier
                        ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                        : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    } rounded-lg focus:outline-none transition-all duration-200`}
                    placeholder="Enter email or 10-digit mobile number"
                  />
                </div>
                {loginFormik.touched.identifier && loginFormik.errors.identifier && (
                  <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                    {loginFormik.errors.identifier}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginFormik.values.password}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                    maxLength={50}
                    className={`block w-full pl-10 pr-10 py-2.5 text-sm sm:text-base border ${
                      loginFormik.touched.password && loginFormik.errors.password
                        ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                        : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    } rounded-lg focus:outline-none transition-all duration-200`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {loginFormik.touched.password && loginFormik.errors.password && (
                  <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                    {loginFormik.errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm sm:text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          ) : (
            // OTP Login Form
            <div className="space-y-6">
              {!otpSent ? (
                <form onSubmit={otpFormik.handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email or Mobile number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {getIdentifierIcon(otpFormik.values.identifier)}
                      </div>
                      <input
                        type="text"
                        name="identifier"
                        value={otpFormik.values.identifier}
                        onChange={otpFormik.handleChange}
                        onBlur={otpFormik.handleBlur}
                        maxLength={100}
                        className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                          otpFormik.touched.identifier && otpFormik.errors.identifier
                            ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                            : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                        } rounded-lg focus:outline-none transition-all duration-200`}
                        placeholder="Enter email or 10-digit mobile number"
                      />
                    </div>
                    {otpFormik.touched.identifier && otpFormik.errors.identifier && (
                      <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                        {otpFormik.errors.identifier}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 text-sm sm:text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending OTP...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Send className="h-5 w-5 mr-2" />
                        Send OTP
                      </div>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={otpVerifyFormik.handleSubmit} className="space-y-6">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-800 mb-2">
                      OTP sent to:
                    </p>
                    <p className="text-sm text-orange-600 break-all">
                      {getMaskedIdentifier(currentIdentifier)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={otpVerifyFormik.values.otp}
                      onChange={otpVerifyFormik.handleChange}
                      onBlur={otpVerifyFormik.handleBlur}
                      maxLength={6}
                      className={`block w-full px-3 py-2.5 text-center text-xl sm:text-2xl tracking-widest border ${
                        otpVerifyFormik.touched.otp && otpVerifyFormik.errors.otp
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="6-digit OTP"
                    />
                    {otpVerifyFormik.touched.otp && otpVerifyFormik.errors.otp && (
                      <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                        {otpVerifyFormik.errors.otp}
                      </p>
                    )}
                  </div>

                  <div className="text-center">
                    {timer > 0 ? (
                      <p className="text-xs sm:text-sm text-gray-500">
                        Not received your code?{" "}
                        <span className="text-gray-400">Resend in {timer}s</span>
                      </p>
                    ) : (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Not received your code?{" "}
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={loading}
                            className="text-orange-600 hover:text-orange-800 font-medium focus:outline-none transition-colors"
                          >
                            Resend code
                          </button>
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 text-sm sm:text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </div>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* OR Divider - Only show in password mode */}
          {!showOtpInput && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 sm:px-3 bg-white text-gray-500">OR</span>
              </div>
            </div>
          )}

          {/* Request OTP Button - Only show in password mode */}
          {!showOtpInput && (
            <div className="mt-6">
              <button
                type="button"
                onClick={switchToOtpMode}
                className="w-full flex justify-center items-center py-2.5 px-4 border-2 border-orange-500 rounded-lg shadow-sm text-sm sm:text-base font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-600 transition-all duration-200"
              >
                <Send className="h-5 w-5 mr-2" />
                Request OTP
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Get a 6-digit OTP on your email or phone
              </p>
            </div>
          )}

          {/* Create New Account Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 sm:px-3 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 border-2 border-orange-500 rounded-lg shadow-sm text-sm sm:text-base font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-600 transition-all duration-200"
              >
                Create New Account
              </Link>
            </div>
          </div>

          {/* Seller Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Start selling your products?{" "}
              <Link
                to="/seller/register"
                className="text-orange-600 hover:text-orange-900 font-semibold transition-colors"
              >
                Register as a Seller
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Popup Modal */}
      {showOtpPopup && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowOtpPopup(false)}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {/* Close button */}
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    onClick={() => setShowOtpPopup(false)}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Your OTP Code
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        We've sent a verification code to{" "}
                        <span className="font-semibold text-gray-700">
                          {currentIdentifier.includes("@") ? "your email address" : "your phone number"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1 break-all">
                        {getMaskedIdentifier(currentIdentifier)}
                      </p>
                      
                      {/* OTP Display */}
                      <div className={`mt-4 rounded-lg p-4 border-2 overflow-x-auto ${
                        currentIdentifier.includes("@") 
                          ? "bg-blue-50 border-blue-200" 
                          : "bg-green-50 border-green-200"
                      }`}>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-2">Your One-Time Password</p>
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2 flex-wrap">
                            <div className={`text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-wider ${
                              currentIdentifier.includes("@") ? "text-blue-600" : "text-green-600"
                            }`}>
                              {generatedOtp.split('').map((digit, index) => (
                                <span key={index} className="inline-block mx-0.5 sm:mx-1">
                                  {digit}
                                </span>
                              ))}
                            </div>
                            <button
                              onClick={copyToClipboard}
                              className="ml-1 sm:ml-2 p-2 text-gray-400 hover:text-orange-600 transition-colors"
                              title="Copy OTP"
                            >
                              {copied ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <Copy className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {copied && (
                            <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowOtpPopup(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpPopup(false);
                    setTimeout(() => {
                      const otpInput = document.querySelector('input[name="otp"]');
                      if (otpInput) otpInput.focus();
                    }, 100);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;