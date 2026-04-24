const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    fullAddress: {
        type: String,
        required: true
    },
    flatHouseNo: {
        type: String,
        required: true
    },
    areaStreet: {
        type: String,
        required: true
    },
    landmark: String,
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: 'India'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'seller', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    addresses: [addressSchema] // Add addresses array to user
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);