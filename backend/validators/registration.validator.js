const Joi = require("joi");

const phoneRegex = /^[6-9]\d{9}$/;

// Step 1: Send Email OTP
exports.emailOTPSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address'
    })
});

// Step 1: Verify Email OTP
exports.verifyEmailOTPSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
        'string.length': 'OTP must be 6 digits',
        'string.pattern.base': 'OTP must contain only numbers'
    })
});

// Step 2: Send Phone OTP
exports.phoneOTPSchema = Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(phoneRegex).required().messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    })
});

// Step 2: Verify Phone OTP
exports.verifyPhoneOTPSchema = Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(phoneRegex).required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
});

// Step 3: Complete Registration
exports.completeRegistrationSchema = Joi.object({
    fullName: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'Full name is required',
        'string.min': 'Name must be at least 2 characters'
    }),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(phoneRegex).required(),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters'
    })
});