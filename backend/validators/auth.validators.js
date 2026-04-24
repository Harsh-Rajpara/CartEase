const Joi = require("joi");
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

exports.loginUserSchema = Joi.object({
    identifier: Joi.alternatives()
        .try(
            Joi.string().email().messages({
                'string.email': 'Please enter a valid email address'
            }),
            Joi.string().pattern(phoneRegex).messages({
                'string.pattern.base': 'Please enter a valid 10-digit Indian mobile number'
            })
        )
        .required()
        .messages({
            'any.required': 'Email or phone number is required',
            'alternatives.match': 'Please enter a valid email or 10-digit phone number'
        }),
    
    password: Joi.string().required().messages({
        'any.required': 'Password is required'
    })
});



exports.registerSellerSchema  = Joi.object({
    fullName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s]*$/).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(phoneRegex).required(),
    password: Joi.string().min(6).required(),
    businessName: Joi.string().min(2).max(100).required(),
    businessType: Joi.string().valid('individual', 'partnership', 'private_limited', 'public_limited', 'llp').required(),
    businessAddress: Joi.string().min(10).required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).required(),
    gstin: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required(),
    panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(),
    bankAccountNumber: Joi.string().min(9).max(18).required(),
    bankIfscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),
    bankName: Joi.string().required(),
    accountHolderName: Joi.string().required(),
    website: Joi.string().uri().optional().allow('')
});


// backend/validators/user.validator.js (add this)
exports.otpSchema = Joi.object({
    identifier: Joi.alternatives()
        .try(
            Joi.string().email().messages({
                'string.email': 'Please enter a valid email address'
            }),
            Joi.string().pattern(phoneRegex).messages({
                'string.pattern.base': 'Please enter a valid 10-digit mobile number'
            })
        )
        .required()
        .messages({
            'any.required': 'Email or phone number is required',
            'alternatives.match': 'Please enter a valid email or phone number'
        }),
    
    otp: Joi.string()
        .length(6)
        .pattern(/^\d+$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits',
            'string.pattern.base': 'OTP must contain only numbers (0-9)',
            'any.required': 'OTP is required'
        })
});