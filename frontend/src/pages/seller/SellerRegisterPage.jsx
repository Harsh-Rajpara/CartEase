import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Store,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Building,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Globe,
  Briefcase,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../services/api";
import { useDispatch } from "react-redux";
import { fetchUser } from "../../store/authSlice";

// Validation schemas
const phoneRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const sellerRegisterSchema = yup.object({
  fullName: yup
    .string()
    .min(5, "Name must be at least 5 characters")
    .max(50, "Name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]*$/, "Only letters and spaces allowed")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email is too long")
    .required("Email is required"),
  phone: yup
    .string()
    .matches(phoneRegex, "Please enter a valid mobile number")
    .required("Phone number is required"),
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
  businessName: yup
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name cannot exceed 100 characters")
    .required("Business name is required"),
  businessType: yup
    .string()
    .oneOf(
      ["individual", "partnership", "private_limited", "public_limited", "llp"],
      "Please select a valid business type",
    )
    .required("Business type is required"),
  businessAddress: yup
    .string()
    .min(10, "Please enter complete address")
    .max(500, "Address is too long")
    .required("Business address is required"),
  city: yup
    .string()
    .max(50, "City name is too long")
    .required("City is required"),
  state: yup
    .string()
    .max(50, "State name is too long")
    .required("State is required"),
  pincode: yup
    .string()
    .matches(pincodeRegex, "Please enter a valid 6-digit pincode")
    .required("Pincode is required"),
  gstin: yup
    .string()
    .matches(gstRegex, "Please enter a valid 15-digit GSTIN")
    .required("GSTIN is required"),
  panNumber: yup
    .string()
    .matches(panRegex, "Please enter a valid PAN number (e.g., ABCDE1234F)")
    .required("PAN number is required"),
  bankAccountNumber: yup
    .string()
    .min(9, "Bank account number must be between 9-18 digits")
    .max(18, "Bank account number must be between 9-18 digits")
    .required("Bank account number is required"),
  bankIfscCode: yup
    .string()
    .matches(
      /^[A-Z]{4}0[A-Z0-9]{6}$/,
      "Please enter a valid IFSC code (e.g., SBIN0123456)",
    )
    .required("IFSC code is required"),
  bankName: yup
    .string()
    .max(100, "Bank name is too long")
    .required("Bank name is required"),
  accountHolderName: yup
    .string()
    .max(100, "Account holder name is too long")
    .required("Account holder name is required"),
  website: yup.string().url("Please enter a valid URL").max(200, "URL is too long").nullable(),
  acceptTerms: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions"),
});

const SellerRegisterPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [topError, setTopError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      businessType: "",
      businessAddress: "",
      city: "",
      state: "",
      pincode: "",
      gstin: "",
      panNumber: "",
      bankAccountNumber: "",
      bankIfscCode: "",
      bankName: "",
      accountHolderName: "",
      website: "",
      acceptTerms: false,
    },
    validationSchema: sellerRegisterSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleSellerRegistration(values);
    },
  });

  // Check if email or phone already exists
  const checkExistingUser = async (email, phone) => {
    try {
      const emailResponse = await api.post("/auth/check-email", { email });
      if (emailResponse.data.exists) {
        return {
          field: "email",
          message: "This email is already registered. Please use a different email or login.",
        };
      }

      const phoneResponse = await api.post("/auth/check-phone", { phone });
      if (phoneResponse.data.exists) {
        return {
          field: "phone",
          message: "This phone number is already registered. Please use a different number or login.",
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const handleSellerRegistration = async (values) => {
    try {
      await sellerRegisterSchema.validate(values, { abortEarly: false });
    } catch (err) {
      err.inner.forEach((error) => {
        formik.setFieldError(error.path, error.message);
        formik.setFieldTouched(error.path, true);
      });
      return;
    }

    setLoading(true);
    setTopError("");

    try {
      const sellerData = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        businessName: values.businessName,
        businessType: values.businessType,
        businessAddress: values.businessAddress,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        gstin: values.gstin,
        panNumber: values.panNumber,
        bankAccountNumber: values.bankAccountNumber,
        bankIfscCode: values.bankIfscCode,
        bankName: values.bankName,
        accountHolderName: values.accountHolderName,
        website: values.website || "",
      };

      const response = await api.post("/auth/seller/register", sellerData);

      if (response.data.success) {
        // No localStorage usage - using Redux only
        await dispatch(fetchUser());
        setSuccess("Registration successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/seller/dashboard");
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      formik.setFieldError("password", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    setTopError("");

    if (currentStep === 1) {
      const step1Fields = ["fullName", "email", "phone", "password", "confirmPassword"];

      step1Fields.forEach((field) => {
        formik.setFieldTouched(field, true);
      });

      let hasError = false;
      step1Fields.forEach((field) => {
        try {
          sellerRegisterSchema.validateSyncAt(field, formik.values);
          formik.setFieldError(field, "");
        } catch (err) {
          formik.setFieldError(field, err.message);
          hasError = true;
        }
      });

      if (hasError) return;

      setLoading(true);
      const existingUserError = await checkExistingUser(
        formik.values.email,
        formik.values.phone,
      );
      setLoading(false);

      if (existingUserError) {
        setTopError(existingUserError.message);
        formik.setFieldError(existingUserError.field, existingUserError.message);
        formik.setFieldTouched(existingUserError.field, true);
        return;
      }
    }

    if (currentStep === 2) {
      const step2Fields = [
        "businessName",
        "businessType",
        "businessAddress",
        "city",
        "state",
        "pincode",
        "gstin",
        "panNumber",
      ];
      step2Fields.forEach((field) => {
        formik.setFieldTouched(field, true);
      });

      let hasError = false;
      step2Fields.forEach((field) => {
        try {
          sellerRegisterSchema.validateSyncAt(field, formik.values);
          formik.setFieldError(field, "");
        } catch (err) {
          formik.setFieldError(field, err.message);
          hasError = true;
        }
      });
      if (hasError) return;
    }

    if (currentStep === 3) {
      const step3Fields = [
        "bankAccountNumber",
        "bankIfscCode",
        "bankName",
        "accountHolderName",
        "acceptTerms",
      ];
      step3Fields.forEach((field) => {
        formik.setFieldTouched(field, true);
      });

      let hasError = false;
      step3Fields.forEach((field) => {
        try {
          sellerRegisterSchema.validateSyncAt(field, formik.values);
          formik.setFieldError(field, "");
        } catch (err) {
          formik.setFieldError(field, err.message);
          hasError = true;
        }
      });
      if (hasError) return;
    }

    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setTopError("");
    setCurrentStep(currentStep - 1);
  };

  // Responsive Step Indicator
  const StepIndicator = () => (
    <div className="mb-8">
      {/* Desktop View - Hidden on mobile */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div
              className={`ml-2 text-sm ${currentStep >= 1 ? "text-orange-600 font-medium" : "text-gray-500"}`}
            >
              Personal
            </div>
          </div>
          <div className="flex-1 mx-4 h-0.5 bg-gray-200">
            <div
              className={`h-full bg-orange-500 transition-all duration-300 ${currentStep >= 2 ? "w-full" : "w-0"}`}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <div
              className={`ml-2 text-sm ${currentStep >= 2 ? "text-orange-600 font-medium" : "text-gray-500"}`}
            >
              Business
            </div>
          </div>
          <div className="flex-1 mx-4 h-0.5 bg-gray-200">
            <div
              className={`h-full bg-orange-500 transition-all duration-300 ${currentStep >= 3 ? "w-full" : "w-0"}`}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 3 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
            <div
              className={`ml-2 text-sm ${currentStep >= 3 ? "text-orange-600 font-medium" : "text-gray-500"}`}
            >
              Bank & Docs
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View - Visible only on mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 text-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full mx-auto ${
                currentStep >= 1 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div
              className={`text-xs mt-1 ${currentStep >= 1 ? "text-orange-600 font-medium" : "text-gray-500"}`}
            >
              Personal
            </div>
          </div>
          <div className="flex-1 text-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full mx-auto ${
                currentStep >= 2 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <div
              className={`text-xs mt-1 ${currentStep >= 2 ? "text-orange-600 font-medium" : "text-gray-500"}`}
            >
              Business
            </div>
          </div>
          <div className="flex-1 text-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full mx-auto ${
                currentStep >= 3 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
            <div
              className={`text-xs mt-1 ${currentStep >= 3 ? "text-orange-600 font-medium" : "text-gray-500"}`}
            >
              Bank & Docs
            </div>
          </div>
        </div>
        {/* Progress bar for mobile */}
        <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-6 sm:py-8 lg:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navigation Bar with Back to Login Button */}
        <div className="mb-4 sm:mb-4">
          <Link
            to="/login"
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-5 w-4 mr-1 sm:h-5 sm:w-5" />
            Back to Login
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Become a Seller</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Start selling your products to millions of customers
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
          <StepIndicator />

          {/* Top Error Message */}
          {topError && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm text-orange-800">{topError}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={formik.handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-5 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Personal Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      name="fullName"
                      value={formik.values.fullName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={50}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.fullName && formik.touched.fullName
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {formik.errors.fullName && formik.touched.fullName && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={100}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.email && formik.touched.email
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {formik.errors.email && formik.touched.email && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      maxLength="10"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.phone && formik.touched.phone
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  {formik.errors.phone && formik.touched.phone && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={50}
                      className={`block w-full pl-10 pr-10 py-2.5 text-sm sm:text-base border ${
                        formik.errors.password && formik.touched.password
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
                  {formik.errors.password && formik.touched.password && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={50}
                      className={`block w-full pl-10 pr-10 py-2.5 text-sm sm:text-base border ${
                        formik.errors.confirmPassword && formik.touched.confirmPassword
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
                  {formik.errors.confirmPassword && formik.touched.confirmPassword && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    Password must contain:
                  </p>
                  <ul className="text-xs space-y-1">
                    <li
                      className={
                        formik.values.password.length >= 6
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      ✓ At least 6 characters
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(formik.values.password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      ✓ One uppercase letter
                    </li>
                    <li
                      className={
                        /[a-z]/.test(formik.values.password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      ✓ One lowercase letter
                    </li>
                    <li
                      className={
                        /[0-9]/.test(formik.values.password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      ✓ One number
                    </li>
                    <li
                      className={
                        /[@$!%*?&]/.test(formik.values.password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      ✓ One special character (@$!%*?&)
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Business Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      name="businessName"
                      value={formik.values.businessName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={100}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.businessName && formik.touched.businessName
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="Enter your business name"
                    />
                  </div>
                  {formik.errors.businessName && formik.touched.businessName && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <select
                      name="businessType"
                      value={formik.values.businessType}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.businessType && formik.touched.businessType
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200 bg-white`}
                    >
                      <option value="">Select business type</option>
                      <option value="individual">Individual / Sole Proprietor</option>
                      <option value="partnership">Partnership</option>
                      <option value="private_limited">Private Limited</option>
                      <option value="public_limited">Public Limited</option>
                      <option value="llp">LLP</option>
                    </select>
                  </div>
                  {formik.errors.businessType && formik.touched.businessType && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.businessType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    <textarea
                      name="businessAddress"
                      rows="3"
                      value={formik.values.businessAddress}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={500}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.businessAddress && formik.touched.businessAddress
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="Enter complete business address"
                    />
                  </div>
                  {formik.errors.businessAddress && formik.touched.businessAddress && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.businessAddress}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={50}
                      className={`mt-1 block w-full px-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.city && formik.touched.city
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="City"
                    />
                    {formik.errors.city && formik.touched.city && (
                      <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                        {formik.errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={50}
                      className={`mt-1 block w-full px-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.state && formik.touched.state
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="State"
                    />
                    {formik.errors.state && formik.touched.state && (
                      <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                        {formik.errors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength="6"
                      value={formik.values.pincode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`mt-1 block w-full px-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.pincode && formik.touched.pincode
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="6-digit pincode"
                    />
                    {formik.errors.pincode && formik.touched.pincode && (
                      <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                        {formik.errors.pincode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GSTIN <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        name="gstin"
                        value={formik.values.gstin}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        maxLength={15}
                        className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                          formik.errors.gstin && formik.touched.gstin
                            ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                            : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                        } rounded-lg focus:outline-none transition-all duration-200`}
                        placeholder="15-digit GSTIN"
                      />
                    </div>
                    {formik.errors.gstin && formik.touched.gstin && (
                      <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                        {formik.errors.gstin}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        name="panNumber"
                        value={formik.values.panNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        maxLength={10}
                        className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                          formik.errors.panNumber && formik.touched.panNumber
                            ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                            : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                        } rounded-lg focus:outline-none transition-all duration-200`}
                        placeholder="10-digit PAN"
                      />
                    </div>
                    {formik.errors.panNumber && formik.touched.panNumber && (
                      <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                        {formik.errors.panNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="url"
                      name="website"
                      value={formik.values.website}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={200}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.website && formik.touched.website
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="https://www.example.com"
                    />
                  </div>
                  {formik.errors.website && formik.touched.website && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.website}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Bank Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      name="bankAccountNumber"
                      value={formik.values.bankAccountNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={18}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.bankAccountNumber && formik.touched.bankAccountNumber
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="Enter account number"
                    />
                  </div>
                  {formik.errors.bankAccountNumber && formik.touched.bankAccountNumber && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.bankAccountNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      name="bankIfscCode"
                      value={formik.values.bankIfscCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={11}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.bankIfscCode && formik.touched.bankIfscCode
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="Enter IFSC code"
                    />
                  </div>
                  {formik.errors.bankIfscCode && formik.touched.bankIfscCode && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.bankIfscCode}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      name="bankName"
                      value={formik.values.bankName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={100}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.bankName && formik.touched.bankName
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="Enter bank name"
                    />
                  </div>
                  {formik.errors.bankName && formik.touched.bankName && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.bankName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      name="accountHolderName"
                      value={formik.values.accountHolderName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={100}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm sm:text-base border ${
                        formik.errors.accountHolderName && formik.touched.accountHolderName
                          ? "border-orange-400 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                          : "border-gray-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                      } rounded-lg focus:outline-none transition-all duration-200`}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  {formik.errors.accountHolderName && formik.touched.accountHolderName && (
                    <p className="mt-1.5 text-xs sm:text-sm text-orange-600">
                      {formik.errors.accountHolderName}
                    </p>
                  )}
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formik.values.acceptTerms}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="acceptTerms" className="font-medium text-gray-700">
                      I accept the{" "}
                      <a href="#" className="text-orange-600 hover:text-orange-500">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-orange-600 hover:text-orange-500">
                        Seller Policy
                      </a>
                    </label>
                    {formik.errors.acceptTerms && formik.touched.acceptTerms && (
                      <p className="mt-1 text-orange-600 text-xs">{formik.errors.acceptTerms}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 sm:px-6 py-2.5 border-2 border-orange-500 rounded-lg shadow-sm text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-600 transition-all duration-200"
                >
                  Previous
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={`px-4 sm:px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 ${
                    currentStep === 1 ? "ml-auto" : ""
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-4 sm:px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Why sell with us section */}
        <div className="mt-8 bg-orange-50 rounded-xl p-4 sm:p-6 border border-orange-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Why sell with us?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm sm:text-base">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                  10 Crore+ Customers
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Access to a massive customer base
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm sm:text-base">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Easy Shipping</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Pan-India logistics support
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm sm:text-base">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Quick Payments</h4>
                <p className="text-xs sm:text-sm text-gray-600">7-day settlement cycle</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegisterPage;