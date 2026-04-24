import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import {
  Mail,
  Phone,
  User,
  Lock,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  X,
  Copy,
  Check,
} from "lucide-react";
import api from "../services/api";
import { setUser } from "../store/authSlice";

// Validation schemas
const emailSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email is too long")
    .required("Email is required"),
});

const phoneSchema = yup.object({
  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, "Please enter a valid mobile number")
    .required("Phone number is required"),
});

const emailOtpSchema = yup.object({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .matches(/^\d+$/, "OTP must contain only numbers")
    .required("OTP is required"),
});

const phoneOtpSchema = yup.object({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .matches(/^\d+$/, "OTP must contain only numbers")
    .required("OTP is required"),
});

const detailsSchema = yup.object({
  fullName: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]*$/, "Only letters and spaces allowed")
    .required("Full name is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password is too long")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Must contain at least one special character (@$!%*?&)",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Step states
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP Popup states
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpType, setOtpType] = useState(""); // 'email' or 'phone'
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
      // Silent fail - no console
    }
  };

  // Get masked identifier
  const getMaskedIdentifier = (identifier, type) => {
    if (type === 'email') {
      const [username, domain] = identifier.split('@');
      const maskedUsername = username.length > 3 
        ? username.slice(0, 3) + '***' 
        : username[0] + '***';
      return `${maskedUsername}@${domain}`;
    } else {
      return identifier.slice(0, 3) + '****' + identifier.slice(-3);
    }
  };

  // Email Formik
  const emailFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleSendEmailOTP(values.email);
    },
  });

  // Email OTP Formik
  const emailOtpFormik = useFormik({
    initialValues: { otp: "" },
    validationSchema: emailOtpSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleVerifyEmailOTP(values.otp);
    },
  });

  // Phone Formik
  const phoneFormik = useFormik({
    initialValues: { phone: "" },
    validationSchema: phoneSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleSendPhoneOTP(values.phone);
    },
  });

  // Phone OTP Formik
  const phoneOtpFormik = useFormik({
    initialValues: { otp: "" },
    validationSchema: phoneOtpSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleVerifyPhoneOTP(values.otp);
    },
  });

  // Details Formik
  const detailsFormik = useFormik({
    initialValues: {
      fullName: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: detailsSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleCompleteRegistration(values);
    },
  });

  // Step 1: Send Email OTP
  const handleSendEmailOTP = async (emailValue) => {
    try {
      await emailSchema.validate({ email: emailValue });
    } catch (err) {
      emailFormik.setFieldError("email", err.message);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register/send-email-otp", {
        email: emailValue,
      });
      if (response.data.success) {
        setEmail(emailValue);
        setEmailOtpSent(true);
        setTimer(60);
        emailOtpFormik.resetForm();
        
        // Show OTP popup if OTP is returned
        if (response.data.data?.otp) {
          setGeneratedOtp(response.data.data.otp);
          setOtpType('email');
          setShowOtpPopup(true);
          emailOtpFormik.setFieldValue("otp", response.data.data.otp);
        }
      }
    } catch (err) {
      emailFormik.setFieldError(
        "email",
        err.response?.data?.message || "Failed to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verify Email OTP
  const handleVerifyEmailOTP = async (otpValue) => {
    setLoading(true);

    try {
      const response = await api.post("/register/verify-email-otp", {
        email,
        otp: otpValue,
      });
      if (response.data.success) {
        setEmailVerified(true);
        setEmailOtpSent(false);
        setTimer(0);
        emailOtpFormik.resetForm();
        setShowOtpPopup(false); // Close popup on success
      }
    } catch (err) {
      emailOtpFormik.setFieldError(
        "otp",
        err.response?.data?.message || "Invalid OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send Phone OTP
  const handleSendPhoneOTP = async (phoneValue) => {
    try {
      await phoneSchema.validate({ phone: phoneValue });
    } catch (err) {
      phoneFormik.setFieldError("phone", err.message);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register/send-phone-otp", {
        email,
        phone: phoneValue,
      });
      if (response.data.success) {
        setPhone(phoneValue);
        setPhoneOtpSent(true);
        setTimer(60);
        phoneOtpFormik.resetForm();
        
        // Show OTP popup if OTP is returned
        if (response.data.data?.otp) {
          setGeneratedOtp(response.data.data.otp);
          setOtpType('phone');
          setShowOtpPopup(true);
          phoneOtpFormik.setFieldValue("otp", response.data.data.otp);
        }
      }
    } catch (err) {
      phoneFormik.setFieldError(
        "phone",
        err.response?.data?.message || "Failed to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Phone OTP
  const handleVerifyPhoneOTP = async (otpValue) => {
    setLoading(true);

    try {
      const response = await api.post("/register/verify-phone-otp", {
        email,
        phone,
        otp: otpValue,
      });
      if (response.data.success) {
        setPhoneVerified(true);
        setPhoneOtpSent(false);
        setTimer(0);
        phoneOtpFormik.resetForm();
        setShowOtpPopup(false); // Close popup on success
      }
    } catch (err) {
      phoneOtpFormik.setFieldError(
        "otp",
        err.response?.data?.message || "Invalid OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration
  const handleCompleteRegistration = async (values) => {
    try {
      await detailsSchema.validate(values);
    } catch (err) {
      detailsFormik.setFieldError(err.path, err.message);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register/complete", {
        fullName: values.fullName,
        email,
        phone,
        password: values.password,
      });

      if (response.data.success) {
        dispatch(setUser(response.data.data));
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      detailsFormik.setFieldError(
        "password",
        err.response?.data?.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && emailVerified) {
      setStep(2);
      phoneFormik.resetForm();
      setPhoneOtpSent(false);
      setTimer(0);
    } else if (step === 2 && phoneVerified) {
      setStep(3);
      detailsFormik.resetForm();
    }
  };

  const StepIndicator = () => {
    const steps = [
      {
        num: 1,
        label: "Email",
        active: step >= 1,
        completed: emailVerified,
      },
      {
        num: 2,
        label: "Phone",
        active: step >= 2,
        completed: phoneVerified,
      },
      {
        num: 3,
        label: "Details",
        active: step >= 3,
        completed: step === 3,
      },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((stepItem, idx) => (
            <React.Fragment key={stepItem.num}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
                    stepItem.active
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepItem.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    stepItem.num
                  )}
                </div>
                <div
                  className={`mt-2 text-xs sm:text-sm text-center truncate max-w-[60px] sm:max-w-none ${
                    stepItem.active
                      ? "text-orange-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {stepItem.label}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-1 sm:mx-2 h-0.5 bg-gray-200 relative top-[-10px]">
                  <div
                    className={`h-full bg-orange-500 transition-all duration-300 ${
                      stepItem.completed ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Step 1: Email Verification
  const renderEmailStep = () => (
    <div className="space-y-6">
      <form onSubmit={emailFormik.handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="email"
              name="email"
              value={emailFormik.values.email}
              onChange={emailFormik.handleChange}
              disabled={emailVerified || emailOtpSent}
              maxLength={100}
              className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                emailFormik.errors.email && !emailVerified
                  ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
              } rounded-lg focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="you@example.com"
            />
            {emailVerified && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 pointer-events-none" />
            )}
          </div>
          {emailFormik.errors.email && !emailVerified && (
            <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
              {emailFormik.errors.email}
            </p>
          )}
        </div>

        {!emailVerified && !emailOtpSent && (
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
                Sending...
              </div>
            ) : (
              "Send OTP"
            )}
          </button>
        )}
      </form>

      {!emailVerified && emailOtpSent && (
        <div className="space-y-4">
          <form onSubmit={emailOtpFormik.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP sent to {email}
              </label>
              <input
                type="text"
                name="otp"
                value={emailOtpFormik.values.otp}
                onChange={emailOtpFormik.handleChange}
                onBlur={emailOtpFormik.handleBlur}
                maxLength={6}
                className={`mt-1 block w-full px-3 py-2.5 text-center text-xl sm:text-2xl tracking-widest border ${
                  emailOtpFormik.touched.otp && emailOtpFormik.errors.otp
                    ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                } rounded-lg focus:outline-none transition-all duration-200`}
                placeholder="6-digit OTP"
              />
              {emailOtpFormik.touched.otp && emailOtpFormik.errors.otp && (
                <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                  {emailOtpFormik.errors.otp}
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
                      onClick={() =>
                        handleSendEmailOTP(emailFormik.values.email)
                      }
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
        </div>
      )}

      {emailVerified && (
        <button
          type="button"
          onClick={handleNextStep}
          className="w-full py-2.5 px-4 text-sm sm:text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
        >
          Next
        </button>
      )}
    </div>
  );

  // Step 2: Phone Verification
  const renderPhoneStep = () => (
    <div className="space-y-6">
      <form onSubmit={phoneFormik.handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="tel"
              name="phone"
              value={phoneFormik.values.phone}
              onChange={phoneFormik.handleChange}
              disabled={phoneVerified || phoneOtpSent}
              maxLength={10}
              className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                phoneFormik.errors.phone && !phoneVerified
                  ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
              } rounded-lg focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="1234567890"
            />
            {phoneVerified && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 pointer-events-none" />
            )}
          </div>
          {phoneFormik.errors.phone && !phoneVerified && (
            <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
              {phoneFormik.errors.phone}
            </p>
          )}
        </div>

        {!phoneVerified && !phoneOtpSent && (
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
                Sending...
              </div>
            ) : (
              "Send OTP"
            )}
          </button>
        )}
      </form>

      {!phoneVerified && phoneOtpSent && (
        <div className="space-y-4">
          <form onSubmit={phoneOtpFormik.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP sent to {phone}
              </label>
              <input
                type="text"
                name="otp"
                value={phoneOtpFormik.values.otp}
                onChange={phoneOtpFormik.handleChange}
                onBlur={phoneOtpFormik.handleBlur}
                maxLength={6}
                className={`mt-1 block w-full px-3 py-2.5 text-center text-xl sm:text-2xl tracking-widest border ${
                  phoneOtpFormik.touched.otp && phoneOtpFormik.errors.otp
                    ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                } rounded-lg focus:outline-none transition-all duration-200`}
                placeholder="6-digit OTP"
              />
              {phoneOtpFormik.touched.otp && phoneOtpFormik.errors.otp && (
                <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                  {phoneOtpFormik.errors.otp}
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
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

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
                    onClick={() => handleSendPhoneOTP(phoneFormik.values.phone)}
                    disabled={loading}
                    className="text-orange-600 hover:text-orange-800 font-medium focus:outline-none transition-colors"
                  >
                    Resend code
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {phoneVerified && (
        <button
          type="button"
          onClick={handleNextStep}
          className="w-full py-2.5 px-4 text-sm sm:text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
        >
          Next
        </button>
      )}
    </div>
  );

  // Step 3: Account Details
  const renderDetailsStep = () => (
    <form onSubmit={detailsFormik.handleSubmit} className="space-y-6">
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <p className="text-sm font-medium text-orange-800 mb-2">
          Account details:
        </p>
        <p className="text-sm text-orange-600 break-all">📧 {email}</p>
        <p className="text-sm text-orange-600">📱 {phone}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            name="fullName"
            value={detailsFormik.values.fullName}
            onChange={detailsFormik.handleChange}
            maxLength={50}
            className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
              detailsFormik.errors.fullName
                ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
            } rounded-lg focus:outline-none transition-all duration-200`}
            placeholder="Enter your full name"
          />
        </div>
        {detailsFormik.errors.fullName && (
          <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
            {detailsFormik.errors.fullName}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={detailsFormik.values.password}
            onChange={detailsFormik.handleChange}
            maxLength={50}
            className={`block w-full pl-10 pr-10 py-2.5 text-sm sm:text-base border ${
              detailsFormik.errors.password
                ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
            } rounded-lg focus:outline-none transition-all duration-200`}
            placeholder="Create a password"
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
        {detailsFormik.errors.password && (
          <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
            {detailsFormik.errors.password}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={detailsFormik.values.confirmPassword}
            onChange={detailsFormik.handleChange}
            maxLength={50}
            className={`block w-full pl-10 pr-10 py-2.5 text-sm sm:text-base border ${
              detailsFormik.errors.confirmPassword
                ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
            } rounded-lg focus:outline-none transition-all duration-200`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            )}
          </button>
        </div>
        {detailsFormik.errors.confirmPassword && (
          <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
            {detailsFormik.errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Password Requirements */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs text-gray-600 mb-2 font-medium">Password must contain:</p>
        <ul className="text-xs space-y-1">
          <li
            className={
              detailsFormik.values.password.length >= 6
                ? "text-green-600"
                : "text-gray-500"
            }
          >
            ✓ At least 6 characters
          </li>
          <li
            className={
              /[A-Z]/.test(detailsFormik.values.password)
                ? "text-green-600"
                : "text-gray-500"
            }
          >
            ✓ One uppercase letter
          </li>
          <li
            className={
              /[a-z]/.test(detailsFormik.values.password)
                ? "text-green-600"
                : "text-gray-500"
            }
          >
            ✓ One lowercase letter
          </li>
          <li
            className={
              /[0-9]/.test(detailsFormik.values.password)
                ? "text-green-600"
                : "text-gray-500"
            }
          >
            ✓ One number
          </li>
          <li
            className={
              /[@$!%*?&]/.test(detailsFormik.values.password)
                ? "text-green-600"
                : "text-gray-500"
            }
          >
            ✓ One special character (@$!%*?&)
          </li>
        </ul>
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
            Creating account...
          </div>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
            Create account
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 px-2">
            Join us for a great shopping experience
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
          <StepIndicator />

          {/* Back button for steps 2 and 3 */}
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 focus:outline-none transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </button>
          )}

          {/* Render current step */}
          {step === 1 && renderEmailStep()}
          {step === 2 && renderPhoneStep()}
          {step === 3 && renderDetailsStep()}

          {/* Footer Links */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 sm:px-3 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 border-2 border-orange-500 rounded-lg shadow-sm text-sm sm:text-base font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-600 transition-all duration-200"
              >
                Login
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
                      Your Verification Code
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        We've sent a verification code to your{" "}
                        <span className="font-semibold text-gray-700">
                          {otpType === 'email' ? 'email address' : 'phone number'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1 break-all">
                        {otpType === 'email' ? getMaskedIdentifier(email, 'email') : getMaskedIdentifier(phone, 'phone')}
                      </p>
                      
                      {/* OTP Display */}
                      <div className={`mt-4 rounded-lg p-4 border-2 overflow-x-auto ${
                        otpType === 'email' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-2">Your One-Time Password</p>
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2 flex-wrap">
                            <div className={`text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-wider ${
                              otpType === 'email' ? 'text-blue-600' : 'text-green-600'
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
                      const otpInput = document.querySelector(otpType === 'email' ? 'input[name="otp"]' : 'input[name="otp"]');
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

export default RegisterPage;