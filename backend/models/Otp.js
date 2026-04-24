const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true
    },
    phone: {
        type: String,
        trim: true,
        sparse: true
    },
    associatedEmail: {  // ✅ ADD THIS FIELD
        type: String,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['email_verification', 'phone_verification', 'login', 'password_reset'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000)
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto delete after 10 minutes
    }
});


module.exports = mongoose.model('Otp', otpSchema);