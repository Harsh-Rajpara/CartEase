const mongoose = require('mongoose');

const tempRegistrationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        sparse: true
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 60 * 1000) 
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1800 
    }
});

module.exports = mongoose.model('TempRegistration', tempRegistrationSchema);