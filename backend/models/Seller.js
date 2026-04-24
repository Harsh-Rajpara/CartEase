// server/models/Seller.js
const mongoose = require('mongoose');

module.exports = mongoose.model(
    "Seller",
    mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    refreshToken: {
        type: String,
        select: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Business Information
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessType: {
        type: String,
        required: true,
        enum: ['individual', 'partnership', 'private_limited', 'public_limited', 'llp']
    },
    businessAddress: {
        type: String,
        required: true
    },
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
        required: true,
        match: /^[1-9][0-9]{5}$/
    },
    
    // Tax Information
    gstin: {
        type: String,
        required: true,
        uppercase: true,
        match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    },
    panNumber: {
        type: String,
        required: true,
        uppercase: true,
        match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    },
    
    // Bank Details
    bankDetails: {
        accountNumber: {
            type: String,
            required: true
        },
        ifscCode: {
            type: String,
            required: true,
            uppercase: true,
            match: /^[A-Z]{4}0[A-Z0-9]{6}$/
        },
        bankName: {
            type: String,
            required: true
        },
        accountHolderName: {
            type: String,
            required: true
        }
    },
    
    // Additional Information
    website: {
        type: String,
        trim: true
    },
    
    // Documents
    documents: {
        panCard: {
            url: String,
            publicId: String,
            uploadedAt: Date
        },
        gstCertificate: {
            url: String,
            publicId: String,
            uploadedAt: Date
        },
        addressProof: {
            url: String,
            publicId: String,
            uploadedAt: Date
        },
        bankPassbook: {
            url: String,
            publicId: String,
            uploadedAt: Date
        }
    },
    
    // Verification Status
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: String,
    
    // Store Settings
    storeLogo: {
        url: String,
        publicId: String
    },
    storeBanner: {
        url: String,
        publicId: String
    },
    storeDescription: String,
    
    // Statistics
    totalProducts: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
}) );

