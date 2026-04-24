// // frontend/src/utils/validationSchemas.js
// import * as yup from 'yup';

// export const phoneRegex = /^[6-9]\d{9}$/;
// export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// // Login Schema
// export const loginSchema = yup.object({
//   identifier: yup
//     .string()
//     .required('Email or Phone is required')
//     .test('identifier', 'Enter valid email or 10-digit phone number', (value) => {
//       if (!value) return false;
//       if (value.includes('@')) {
//         return emailRegex.test(value);
//       }
//       return phoneRegex.test(value);
//     }),
//   password: yup.string(),
// });

// // OTP Schema
// export const otpSchema = yup.object({
//   otp: yup
//     .string()
//     .length(6, 'OTP must be 6 digits')
//     .matches(/^\d+$/, 'OTP must be numbers')
//     .required('OTP is required'),
// });

// // Email Schema
// export const emailSchema = yup.object({
//   email: yup
//     .string()
//     .email('Invalid email format')
//     .required('Email is required'),
// });

// // Phone Schema
// export const phoneSchema = yup.object({
//   phone: yup
//     .string()
//     .matches(phoneRegex, 'Invalid phone number')
//     .required('Phone number is required'),
// });

// // Password Schema
// export const passwordSchema = yup.object({
//   fullName: yup
//     .string()
//     .min(2, 'Name too short')
//     .max(50, 'Name too long')
//     .matches(/^[a-zA-Z\s]*$/, 'Only letters allowed')
//     .required('Full name is required'),
//   password: yup
//     .string()
//     .min(6, 'Password must be at least 6 characters')
//     .matches(/[A-Z]/, 'Must contain uppercase')
//     .matches(/[a-z]/, 'Must contain lowercase')
//     .matches(/[0-9]/, 'Must contain number')
//     .matches(/[@$!%*?&]/, 'Must contain special character')
//     .required('Password is required'),
//   confirmPassword: yup
//     .string()
//     .oneOf([yup.ref('password')], 'Passwords must match')
//     .required('Confirm password is required'),
// });