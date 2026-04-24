import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useFormik } from "formik";
import { Mail, Phone, Lock, Send, Eye, EyeOff, X, Copy, Check } from "lucide-react";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";

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
  
  // OTP Popup states
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpIdentifier, setOtpIdentifier] = useState("");
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

    if (!identifier) {
      otpFormik.setFieldError("identifier", "Email or phone is required");
      return;
    }

    const isEmail = identifier.includes("@");
    if (isEmail) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(identifier)) {
        otpFormik.setFieldError(
          "identifier",
          "Please enter a valid email address",
        );
        return;
      }
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(identifier)) {
        otpFormik.setFieldError(
          "identifier",
          "Please enter a valid mobile number",
        );
        return;
      }
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/send-otp", { identifier });

      if (response.data.success) {
        setOtpSent(true);
        setTimer(60);
        
        // Check if OTP is returned in response (for phone numbers)
        if (response.data.data?.otp) {
          setGeneratedOtp(response.data.data.otp);
          setOtpIdentifier(identifier);
          setShowOtpPopup(true);
          
          // Auto-fill the OTP field for convenience
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
        identifier: values.identifier,
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
  };

  const getIdentifierIcon = (value) => {
    if (value?.includes("@")) {
      return <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />;
    }
    return <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />;
  };

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

  // Login form with Formik
  const loginFormik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.identifier) {
        errors.identifier = "Email or phone is required";
      } else if (values.identifier.length > 100) {
        errors.identifier = "Email or phone number is too long";
      } else {
        const isEmail = values.identifier.includes("@");
        if (isEmail) {
          const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
          if (!emailRegex.test(values.identifier)) {
            errors.identifier = "Please enter a valid email address";
          }
        } else {
          const phoneRegex = /^[6-9]\d{9}$/;
          if (!phoneRegex.test(values.identifier)) {
            errors.identifier = "Please enter a valid mobile number";
          }
        }
      }

      if (!errors.identifier && !showOtpInput) {
        if (!values.password) {
          errors.password = "Password is required";
        } else if (values.password.length < 6) {
          errors.password = "Password must be at least 6 characters";
        } else if (values.password.length > 50) {
          errors.password = "Password is too long";
        }
      }

      return errors;
    },
    onSubmit: async (values) => {
      await handlePasswordLogin(values);
    },
  });

  // OTP form with Formik
  const otpFormik = useFormik({
    initialValues: {
      identifier: "",
      otp: "",
    },
    validate: (values) => {
      const errors = {};

      if (!values.identifier) {
        errors.identifier = "Email or phone is required";
      } else if (values.identifier.length > 100) {
        errors.identifier = "Email or phone number is too long";
      } else {
        const isEmail = values.identifier.includes("@");
        if (isEmail) {
          const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
          if (!emailRegex.test(values.identifier)) {
            errors.identifier = "Please enter a valid email address";
          }
        } else {
          const phoneRegex = /^[6-9]\d{9}$/;
          if (!phoneRegex.test(values.identifier)) {
            errors.identifier = "Please enter a valid mobile number";
          }
        }
      }

      if (!errors.identifier && otpSent) {
        if (!values.otp) {
          errors.otp = "OTP is required";
        } else if (values.otp.length !== 6) {
          errors.otp = "OTP must be 6 digits";
        } else if (!/^\d+$/.test(values.otp)) {
          errors.otp = "OTP must contain only numbers";
        }
      }

      return errors;
    },
    onSubmit: async (values) => {
      await handleVerifyOTP(values);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col justify-center py-6 px-3 sm:py-8 sm:px-4 lg:py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-600">
            Get access to your Orders and Recommendations
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 lg:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-4 px-3 sm:py-6 sm:px-6 lg:py-8 lg:px-10 shadow-xl sm:rounded-lg border border-gray-100">
          {!showOtpInput ? (
            // Password Login Form
            <form onSubmit={loginFormik.handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
                  Email or Mobile number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    {getIdentifierIcon(loginFormik.values.identifier)}
                  </div>
                  <input
                    type="text"
                    name="identifier"
                    value={loginFormik.values.identifier}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                    maxLength={100}
                    className={`block w-full pl-7 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base border ${
                      loginFormik.touched.identifier &&
                      loginFormik.errors.identifier
                        ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                        : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    } rounded-md sm:rounded-lg focus:outline-none transition-all duration-200`}
                    placeholder="Enter email or 10-digit mobile number"
                  />
                </div>
                {loginFormik.touched.identifier &&
                  loginFormik.errors.identifier && (
                    <p className="mt-1 text-xs text-orange-600">
                      {loginFormik.errors.identifier}
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginFormik.values.password}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                    maxLength={50}
                    className={`block w-full pl-7 sm:pl-10 pr-7 sm:pr-10 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base border ${
                      loginFormik.touched.password &&
                      loginFormik.errors.password
                        ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                        : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    } rounded-md sm:rounded-lg focus:outline-none transition-all duration-200`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {loginFormik.touched.password &&
                  loginFormik.errors.password && (
                    <p className="mt-1 text-xs text-orange-600">
                      {loginFormik.errors.password}
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-1.5 sm:py-2 lg:py-2.5 px-3 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2" viewBox="0 0 24 24">
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
            <form onSubmit={otpFormik.handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
                  Email or Mobile number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    {getIdentifierIcon(otpFormik.values.identifier)}
                  </div>
                  <input
                    type="text"
                    name="identifier"
                    value={otpFormik.values.identifier}
                    onChange={otpFormik.handleChange}
                    onBlur={otpFormik.handleBlur}
                    disabled={otpSent}
                    maxLength={100}
                    className={`block w-full pl-7 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base border ${
                      otpFormik.touched.identifier &&
                      otpFormik.errors.identifier
                        ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                        : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    } rounded-md sm:rounded-lg focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    placeholder="Enter email or 10-digit mobile number"
                  />
                </div>
                {otpFormik.touched.identifier &&
                  otpFormik.errors.identifier && (
                    <p className="mt-1 text-xs text-orange-600">
                      {otpFormik.errors.identifier}
                    </p>
                  )}
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || !otpFormik.values.identifier}
                  className="w-full py-1.5 sm:py-2 lg:py-2.5 px-3 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={otpFormik.values.otp}
                      onChange={otpFormik.handleChange}
                      onBlur={otpFormik.handleBlur}
                      maxLength={6}
                      className={`mt-0.5 sm:mt-1 block w-full px-2 sm:px-3 py-1.5 sm:py-2 lg:py-2.5 text-center text-lg sm:text-xl lg:text-2xl tracking-widest border ${
                        otpFormik.touched.otp && otpFormik.errors.otp
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-md sm:rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="6-digit OTP"
                    />
                    {otpFormik.touched.otp && otpFormik.errors.otp && (
                      <p className="mt-1 text-xs text-orange-600">
                        {otpFormik.errors.otp}
                      </p>
                    )}
                    <div className="text-center mt-3 sm:mt-4">
                      {timer > 0 ? (
                        <p className="text-xs text-gray-500">
                          Not received your code?{" "}
                          <span className="text-gray-400">
                            Resend in {timer}s
                          </span>
                        </p>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">
                            Not received your code?{" "}
                            <button
                              type="button"
                              onClick={() => handleResendOTP()}
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
                      className="w-full py-1.5 sm:py-2 lg:py-2.5 px-3 sm:px-4 mt-3 sm:mt-4 text-xs sm:text-sm lg:text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Verifying...
                        </div>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* OR Divider */}
          <div className="relative my-4 sm:my-5 lg:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 sm:px-3 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Request OTP Button */}
          {!showOtpInput ? (
            <div>
              <button
                type="button"
                onClick={switchToOtpMode}
                disabled={loading}
                className="w-full flex justify-center items-center py-1.5 sm:py-2 lg:py-2.5 px-3 sm:px-4 border-2 border-orange-500 rounded-md sm:rounded-lg shadow-sm text-xs sm:text-sm lg:text-base font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-600 transition-all duration-200"
              >
                <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 mr-1.5 sm:mr-2" />
                Request OTP
              </button>
              <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-1.5 sm:mt-2">
                Get a 6-digit OTP on your email or phone
              </p>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={switchToPasswordMode}
                className="w-full flex items-center justify-center py-1.5 sm:py-2 lg:py-2.5 px-3 sm:px-4 border-2 border-orange-500 rounded-md sm:rounded-lg shadow-sm text-xs sm:text-sm lg:text-base font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-600 transition-all duration-200"
              >
                Back to password login
              </button>
            </div>
          )}

          {/* Create New Account Link */}
          <div className="mt-6 sm:mt-7 lg:mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs lg:text-sm">
                <span className="px-2 sm:px-3 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>
            <Link
              to="/register"
              className="mt-3 sm:mt-4 inline-flex items-center justify-center w-full py-1.5 sm:py-2 lg:py-2.5 px-3 sm:px-4 border-2 border-orange-500 rounded-md sm:rounded-lg shadow-sm text-xs sm:text-sm lg:text-base font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-600 transition-all duration-200"
            >
              Register
            </Link>
          </div>

          {/* Seller Registration Link */}
          <div className="mt-4 sm:mt-5 lg:mt-6 text-center">
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500">
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
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
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
                        <span className="font-semibold text-gray-700">{otpIdentifier}</span>
                      </p>
                      
                      {/* OTP Display */}
                      <div className="mt-4 bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-2">Your One-Time Password</p>
                          <div className="flex items-center justify-center space-x-2">
                            <div className="text-3xl sm:text-4xl font-mono font-bold tracking-wider text-orange-600">
                              {generatedOtp.split('').map((digit, index) => (
                                <span key={index} className="inline-block mx-1">
                                  {digit}
                                </span>
                              ))}
                            </div>
                            <button
                              onClick={copyToClipboard}
                              className="ml-2 p-2 text-gray-400 hover:text-orange-600 transition-colors"
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
                      <div className="mt-3">
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
                    // Focus on OTP input field
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