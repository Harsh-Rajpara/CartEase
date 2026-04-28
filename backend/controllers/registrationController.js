// backend/controllers/registrationController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Seller = require("../models/Seller");
const Otp = require("../models/Otp");
const TempRegistration = require("../models/TempRegistration");
const otpService = require("../services/otpService");

const generateTokens = (user, role) => {
    const accessToken = jwt.sign(
        { id: user._id, role }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { id: user._id, role }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

// Send OTP helper
const sendOTPHelper = async (type, value, purpose, sessionEmail = null) => {
    // Check rate limiting
    const recentOtp = await Otp.findOne({
        [type]: value,
        purpose: purpose,
        createdAt: { $gt: new Date(Date.now() - 60000) }
    });
    
    if (recentOtp) {
        throw new Error("Please wait 1 minute before requesting a new OTP");
    }
    
    // Delete old unused OTPs
    await Otp.deleteMany({
        [type]: value,
        purpose: purpose,
        isUsed: false
    });
    
    // Generate OTP
    const otp = otpService.generateSimpleOTP();
    
    // Save OTP
    const otpData = { otp, purpose, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    otpData[type] = value;
    
    // For phone OTP, also store the associated email
    if (purpose === 'phone_verification' && sessionEmail) {
        otpData.associatedEmail = sessionEmail;
    }
    
    await Otp.create(otpData);
    
    // Send OTP
    if (type === 'email') {
        await otpService.sendOTPByEmail(value, otp);
    } else {
        await otpService.sendOTPBySMS(value, otp);
    }
    
    return true;
};

// ==================== STEP 1: EMAIL VERIFICATION ====================

// Send OTP to email
exports.sendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        const existingSeller = await Seller.findOne({ email: email.toLowerCase() });
        
        if (existingUser || existingSeller) {
            return res.status(400).json({
                success: false,
                message: "Email already registered. Please login."
            });
        }

        // Create temporary registration session
        await TempRegistration.findOneAndUpdate(
            { email: email.toLowerCase() },
            { email: email.toLowerCase(), emailVerified: false, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
            { upsert: true, new: true }
        );

        await sendOTPHelper('email', email.toLowerCase(), 'email_verification');

        res.json({
            success: true,
            message: "OTP sent to your email"
        });

    } catch (error) {
        console.log("error", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Verify email OTP
exports.verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await Otp.findOne({
            email: email.toLowerCase(),
            otp,
            purpose: 'email_verification',
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        // Update temp registration
        await TempRegistration.findOneAndUpdate(
            { email: email.toLowerCase() },
            { emailVerified: true }
        );

        res.json({
            success: true,
            message: "Email verified successfully",
            data: { email }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== STEP 2: PHONE VERIFICATION ====================

// Send OTP to phone
exports.sendPhoneOTP = async (req, res) => {
    try {
        const { phone, email } = req.body;

        console.log('=== SEND PHONE OTP ===');
        console.log('Request body:', { phone, email });

        // Verify email is verified
        const tempSession = await TempRegistration.findOne({ 
            email: email.toLowerCase(),
            emailVerified: true,
            expiresAt: { $gt: new Date() }
        });

        console.log('Temp session found:', tempSession);

        if (!tempSession) {
            return res.status(400).json({
                success: false,
                message: "Email not verified. Please verify your email first."
            });
        }

        // Check if phone already exists
        const existingUser = await User.findOne({ phone });
        const existingSeller = await Seller.findOne({ phone });
        
        if (existingUser || existingSeller) {
            return res.status(400).json({
                success: false,
                message: "Phone number already registered"
            });
        }

        // Update temp session with phone
        await TempRegistration.findOneAndUpdate(
            { email: email.toLowerCase() },
            { phone: phone, phoneVerified: false }
        );

        // Check rate limiting
        const recentOtp = await Otp.findOne({
            phone: phone,
            purpose: 'phone_verification',
            createdAt: { $gt: new Date(Date.now() - 60000) }
        });
        
        if (recentOtp) {
            return res.status(429).json({
                success: false,
                message: "Please wait 1 minute before requesting a new OTP"
            });
        }
        
        // Delete old unused OTPs
        await Otp.deleteMany({
            phone: phone,
            purpose: 'phone_verification',
            isUsed: false
        });

        // Generate OTP
        const otp = otpService.generateSimpleOTP();
        console.log('Generated OTP:', otp);
        
        // ✅ FIX: Save OTP with associatedEmail
        const newOtp = await Otp.create({
            phone: phone,
            otp: otp,
            purpose: 'phone_verification',
            associatedEmail: email.toLowerCase(),  // ✅ ADD THIS LINE
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        
        console.log('OTP saved:', newOtp);
        
        // Send OTP
        await otpService.sendOTPBySMS(phone, otp);

        res.json({
            success: true,
            message: "OTP sent to your phone",
            data: { phone, email, otp: otp } // For testing only
        });

    } catch (error) {
        console.error("Send phone OTP error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Verify phone OTP
exports.verifyPhoneOTP = async (req, res) => {
    try {
        const { phone, otp, email } = req.body;

        console.log('=== VERIFY PHONE OTP ===');
        console.log('Request body:', { phone, otp, email });

        // Verify temp session
        const tempSession = await TempRegistration.findOne({ 
            email: email.toLowerCase(),
            phone: phone,
            emailVerified: true,
            expiresAt: { $gt: new Date() }
        });

        console.log('Temp session found:', tempSession);

        if (!tempSession) {
            return res.status(400).json({
                success: false,
                message: "Invalid session. Please start registration again."
            });
        }

        // Find OTP with associatedEmail
        const otpRecord = await Otp.findOne({
            phone: phone,
            otp: otp,
            purpose: 'phone_verification',
            associatedEmail: email.toLowerCase(),  // ✅ Now this will work
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        console.log('OTP record found:', otpRecord);

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        // Update temp session
        await TempRegistration.findOneAndUpdate(
            { email: email.toLowerCase() },
            { phoneVerified: true }
        );

        res.json({
            success: true,
            message: "Phone verified successfully",
            data: { phone, email }
        });

    } catch (error) {
        console.error("Verify phone OTP error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ==================== STEP 3: COMPLETE REGISTRATION ====================

exports.completeRegistration = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        // 🔒 FINAL VERIFICATION: Ensure both email and phone are verified together
        const tempSession = await TempRegistration.findOne({ 
            email: email.toLowerCase(),
            phone: phone,
            emailVerified: true,
            phoneVerified: true,
            expiresAt: { $gt: new Date() }
        });

        if (!tempSession) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration session. Please start over."
            });
        }

        // Final check if user exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { phone }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 11);
        const newUser = await User.create({
            fullName,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            role: 'user',
            isEmailVerified: true,
            isPhoneVerified: true
        });

        // Delete temp session
        await TempRegistration.deleteOne({ email: email.toLowerCase() });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(newUser, 'user');
        newUser.refreshToken = refreshToken;
        await newUser.save();

        // Remove sensitive data
        const userData = {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role
        };

        // Set cookies
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None" ,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            data: userData,
            message: "Account created successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};