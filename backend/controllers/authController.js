const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Seller = require("../models/Seller");
const bcrypt = require("bcrypt");
const Otp = require("../models/Otp");
const otpService = require("../services/otpService");


// Register user
// POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, password, role } = req.body;

        // Check if user exists with either email OR phone
        const checkExist = await User.findOne({
            $or: [
                { email: email?.toLowerCase() },
                { phone }
            ]
        });

        if (checkExist) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: "User already exists with this email or phone" 
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 11);

        // Create user
        const newUser = await User.create({
            fullName,
            email: email?.toLowerCase(),
            phone,
            password: hashPassword,
            role: role || 'user'
        });

        // Generate tokens
        const accessToken = jwt.sign(
            { id: newUser._id }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );
        
        const refreshToken = jwt.sign(
            { id: newUser._id }, 
            process.env.REFRESH_TOKEN_SECRET, 
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
        );

        // Save refresh token to user
        newUser.refreshToken = refreshToken;
        await newUser.save();

        // Remove sensitive data
        const userObj = newUser.toObject();
        delete userObj.password;
        delete userObj.refreshToken;
        delete userObj.__v;

        // Set cookies and send response
        res
            .cookie("accessToken", accessToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            })
            .cookie("refreshToken", refreshToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })
            .status(201)
            .json({ 
                success: true, 
                data: userObj, 
                message: "User registered successfully" 
            });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            data: null, 
            message: error.message || "Internal Server Error" 
        });
    }
};

// Login user (supports email OR phone)
//  POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const isEmail = identifier.includes('@');

        let query = {};
        if (isEmail) {
            query.email = identifier.toLowerCase();
        } else {
            query.phone = identifier;
        }

        // 🔥 STEP 1: Check User
        let account = await User.findOne(query).select("+password +refreshToken");
        let role;

        if (account) {
        role = account.role; // ✅ admin रहेगा
}
        // 🔥 STEP 2: If not user → check Seller
        if (!account) {
            account = await Seller.findOne(query).select("+password +refreshToken");
            role = "seller";
        }
console.log("Account:", account);
        // ❌ If not found in both
        if (!account) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 🔐 Compare password
        const isMatch = await bcrypt.compare(password, account.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 🎯 Generate tokens (include role)
        const accessToken = jwt.sign(
            { id: account._id, role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );

        const refreshToken = jwt.sign(
            { id: account._id, role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
        );

        // Save refresh token
        account.refreshToken = refreshToken;
        await account.save();

        // Remove sensitive data
        const userObj = account.toObject();
        delete userObj.password;
        delete userObj.refreshToken;
        delete userObj.__v;

        return res
            .cookie("accessToken", accessToken, { 
                httpOnly: true,
                sameSite: "lax",     
                secure: false, 
            })
            .cookie("refreshToken", refreshToken, { 
                httpOnly: true,
                sameSite: "lax",   
                secure: false, 
            })
            .status(200)
            .json({
                success: true,
                data: { ...userObj, role }, // 👈 include role
                message: `${role} login successful`
            });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.registerSeller = async (req, res) => {
    try {
        const { 
            fullName, email, phone, password,
            businessName, businessType, businessAddress,
            city, state, pincode, gstin, panNumber,
            bankAccountNumber, bankIfscCode, bankName, accountHolderName,
            website 
        } = req.body;

        // Validate ALL required fields
        const requiredFields = {
            fullName: "Full name",
            email: "Email address",
            phone: "Phone number",
            password: "Password",
            businessName: "Business name",
            businessType: "Business type",
            businessAddress: "Business address",
            city: "City",
            state: "State",
            pincode: "Pincode",
            gstin: "GSTIN",
            panNumber: "PAN number",
            bankAccountNumber: "Bank account number",
            bankIfscCode: "IFSC code",
            bankName: "Bank name",
            accountHolderName: "Account holder name"
        };
        
        // Check for missing fields
        const missingFields = [];
        for (const [field, label] of Object.entries(requiredFields)) {
            if (!req.body[field] || req.body[field].trim() === '') {
                missingFields.push(label);
            }
        }
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: "Please enter a valid email address" 
            });
        }

        // Validate phone number (Indian format)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: "Please enter a valid 10-digit Indian mobile number" 
            });
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: "Password must contain at least 6 characters, one uppercase, one lowercase, one number, and one special character" 
            });
        }

        // Validate pincode
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(pincode)) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: "Please enter a valid 6-digit pincode" 
            });
        }

        // Validate GSTIN format
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(gstin.toUpperCase())) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: "Please enter a valid 15-digit GSTIN" 
            });
        }

        // Validate PAN format
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(panNumber.toUpperCase())) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: "Please enter a valid 10-character PAN number (e.g., ABCDE1234F)" 
            });
        }

        // Validate IFSC code
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(bankIfscCode.toUpperCase())) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: "Please enter a valid 11-character IFSC code (e.g., SBIN0123456)" 
            });
        }

        // Validate bank account number (at least 9 digits)
        if (!bankAccountNumber || bankAccountNumber.length < 9 || bankAccountNumber.length > 18) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: "Please enter a valid bank account number (9-18 digits)" 
            });
        }

        // Check if seller already exists with email or phone
        const checkExist = await Seller.findOne({
            $or: [{ email: email.toLowerCase() }, { phone }]
        });

        if (checkExist) {
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: "Seller already exists with this email or phone" 
            });
        }

        const checkExistUser = await User.findOne({
            $or: [{ email: email?.toLowerCase() }, { phone }]
        });
        
        if(checkExistUser){
            return res.status(400).json({
                success: false, 
                data: null, 
                message: "Already exists with this email or phone" 
            })
        }
        const hashPassword = await bcrypt.hash(password, 11);

        // Create seller with all fields
        const newSeller = await Seller.create({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            password: hashPassword,
            businessName: businessName.trim(),
            businessType,
            businessAddress: businessAddress.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            gstin: gstin.toUpperCase().trim(),
            panNumber: panNumber.toUpperCase().trim(),
            bankDetails: {
                accountNumber: bankAccountNumber.trim(),
                ifscCode: bankIfscCode.toUpperCase().trim(),
                bankName: bankName.trim(),
                accountHolderName: accountHolderName.trim()
            },
            website: website ? website.trim() : '',
            verificationStatus: 'pending'
        });

        // Generate tokens
        // const { accessToken, refreshToken } = generateTokens(newSeller, 'seller');

        const accessToken = jwt.sign(
  { id: newSeller._id, role: 'seller' },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
);

const refreshToken = jwt.sign(
  { id: newSeller._id, role: 'seller' },
  process.env.REFRESH_TOKEN_SECRET,
  { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
);
        newSeller.refreshToken = refreshToken;
        await newSeller.save();

        // Remove sensitive data from response
        const sellerObj = newSeller.toObject();
        delete sellerObj.password;
        delete sellerObj.refreshToken;
        delete sellerObj.__v;
        delete sellerObj.documents;
        
        // Remove bank account number and IFSC from response for security
        if (sellerObj.bankDetails) {
            delete sellerObj.bankDetails.accountNumber;
            delete sellerObj.bankDetails.ifscCode;
        }

        // Set cookies
        res
            .cookie("accessToken", accessToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000
            })
            .cookie("refreshToken", refreshToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            .status(201)
            .json({ 
                success: true, 
                data: sellerObj, 
                message: "Seller registered successfully. Awaiting verification." 
            });

    } catch (error) {
        console.error("Seller registration error:", error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false, 
                data: null, 
                message: `${field === 'email' ? 'Email' : 'Phone number'} already exists` 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            data: null, 
            message: error.message || "Internal Server Error" 
        });
    }
};

exports.sendOTP = async (req, res) => {
    try {
        const { identifier } = req.body;

        if (!identifier) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Email or phone number is required"
            });
        }

        const isEmail = identifier.includes('@');
        
        // Find user in both collections
        let user = null;
        if (isEmail) {
            user = await User.findOne({ email: identifier.toLowerCase() });
            if (!user) {
                user = await Seller.findOne({ email: identifier.toLowerCase() });
            }
        } else {
            user = await User.findOne({ phone: identifier });
            if (!user) {
                user = await Seller.findOne({ phone: identifier });
            }
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "No account found with this email or phone number"
            });
        }

        // Check for recent OTP (within last minute)
        const recentOtp = await Otp.findOne({
            ...(isEmail ? { email: identifier.toLowerCase() } : { phone: identifier }),
            purpose: 'login',
            createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
        });

        if (recentOtp) {
            return res.status(429).json({
                success: false,
                data: null,
                message: "Please wait 1 minute before requesting a new OTP"
            });
        }

        // Generate numeric OTP
        const otp = otpService.generateSimpleOTP(); // Use simple numeric generator

        // Save OTP to database
        const otpData = {
            otp,
            purpose: 'login',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        };
        
        if (isEmail) {
            otpData.email = identifier.toLowerCase();
        } else {
            otpData.phone = identifier;
        }

        await Otp.create(otpData);

        // Send OTP
        if (isEmail) {
            await otpService.sendOTPByEmail(identifier, otp);
        } else {
            await otpService.sendOTPBySMS(identifier, otp);

            // Return OTP in response for phone numbers (development)
            return res.status(200).json({
                success: true,
                data: {
                    identifier: identifier,
                    type: 'phone',
                    otp: otp  // ← This will show OTP on frontend
                },
                message: `OTP sent to your phone number. Your OTP is: ${otp}`
            });
        }

        res.status(200).json({
            success: true,
            data: {
                identifier: identifier,
                type: isEmail ? 'email' : 'phone'
            },
            message: `OTP sent to your ${isEmail ? 'email' : 'phone number'}`
        });

    } catch (error) {
        console.error("Send OTP error:", error);
        res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Internal Server Error"
        });
    }
};

// Verify OTP and login
// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
    try {
        const { identifier, otp } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Identifier and OTP are required"
            });
        }

        const isEmail = identifier.includes('@');
        
        // Find OTP in database
        let otpRecord = null;
        if (isEmail) {
            otpRecord = await Otp.findOne({
                email: identifier.toLowerCase(),
                otp: otp,
                purpose: 'login',
                isUsed: false,
                expiresAt: { $gt: new Date() }
            });
        } else {
            otpRecord = await Otp.findOne({
                phone: identifier,
                otp: otp,
                purpose: 'login',
                isUsed: false,
                expiresAt: { $gt: new Date() }
            });
        }

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Invalid or expired OTP"
            });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        // Find user
        let user = null;
        let role = '';
        
        if (isEmail) {
            user = await User.findOne({ email: identifier.toLowerCase() });
            if (user) role = 'user';
            else {
                user = await Seller.findOne({ email: identifier.toLowerCase() });
                if (user) role = 'seller';
            }
        } else {
            user = await User.findOne({ phone: identifier });
            if (user) role = 'user';
            else {
                user = await Seller.findOne({ phone: identifier });
                if (user) role = 'seller';
            }
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "User not found"
            });
        }

        // Generate tokens
         // 🎯 Generate tokens (include role)
        const accessToken = jwt.sign(
            { id: user._id, role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id, role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
        );
        user.refreshToken = refreshToken;
        await user.save();

        // Remove sensitive data
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.refreshToken;
        delete userObj.__v;
        
        if (role === 'seller' && userObj.bankDetails) {
            delete userObj.bankDetails.accountNumber;
            delete userObj.bankDetails.ifscCode;
        }

        // Set cookies
        res
            .cookie("accessToken", accessToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000
            })
            .cookie("refreshToken", refreshToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            .status(200)
            .json({
                success: true,
                data: userObj,
                role: role,
                message: "Login successful"
            });

    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Internal Server Error"
        });
    }
};

// Resend OTP
// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
    try {
        const { identifier } = req.body;

        if (!identifier) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Email or phone number is required"
            });
        }

        const isEmail = identifier.includes('@');
        
        // Find user
        let user = null;
        if (isEmail) {
            user = await User.findOne({ email: identifier.toLowerCase() });
            if (!user) {
                user = await Seller.findOne({ email: identifier.toLowerCase() });
            }
        } else {
            user = await User.findOne({ phone: identifier });
            if (!user) {
                user = await Seller.findOne({ phone: identifier });
            }
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "No account found with this email or phone number"
            });
        }

        // Check for recent OTP
        const recentOtp = await Otp.findOne({
            ...(isEmail ? { email: identifier.toLowerCase() } : { phone: identifier }),
            purpose: 'login',
            createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
        });

        if (recentOtp) {
            return res.status(429).json({
                success: false,
                data: null,
                message: "Please wait 1 minute before requesting a new OTP"
            });
        }

        // Generate numeric OTP
        const otp = otpService.generateSimpleOTP();

        // Save OTP
        const otpData = {
            otp,
            purpose: 'login',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        };
        
        if (isEmail) {
            otpData.email = identifier.toLowerCase();
        } else {
            otpData.phone = identifier;
        }

        await Otp.create(otpData);

        // Send OTP
        if (isEmail) {
            await otpService.sendOTPByEmail(identifier, otp);
        } else {
            await otpService.sendOTPBySMS(identifier, otp);

            // Return OTP for phone numbers
            return res.status(200).json({
                success: true,
                data: {
                    identifier: identifier,
                    type: 'phone',
                    otp: otp  // ← Return OTP for frontend
                },
            });
        }

        res.status(200).json({
            success: true,
            data: {
                identifier: identifier,
                type: isEmail ? 'email' : 'phone'
            },
            message: `New OTP sent to your ${isEmail ? 'email' : 'phone number'}`
        });

    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Internal Server Error"
        });
    }
};


// GET /api/auth/me
exports.getCurrentUser = async (req, res) => {
    try {
        let userData;
        
        // Check role from token (attached by protect middleware)
        if (req.user.role === 'seller') {
            // Get seller data
            userData = await Seller.findById(req.user.id)
                .select('-password -refreshToken -__v -bankDetails.accountNumber -bankDetails.ifscCode');
            
            if (!userData) {
                return res.status(404).json({
                    success: false,
                    message: "Seller not found"
                });
            }
            
            // Add role to response
            userData = userData.toObject();
            userData.role = 'seller';
            console.log("userdata ", userData);
        } else if (req.user.role === 'admin') {
            // Get admin data (from User model)
            userData = await User.findById(req.user.id)
                .select('-password -refreshToken -__v');
            
            if (!userData) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });
            }
            
            userData = userData.toObject();
            userData.role = 'admin';
                        console.log("quserdata ", userData);

        } else {
            // Get regular user data
            userData = await User.findById(req.user.id)
                .select('-password -refreshToken -__v');
            
            if (!userData) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
            
            userData = userData.toObject();
            userData.role = 'user';
        }
                    console.log("suserdata ", userData);

        res.status(200).json({
            success: true,
            data: userData,
            message: "User fetched successfully"
        });
        
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};


exports.logout = async (req, res) => {
    try {
        // 🔥 1. Remove refresh token from DB (VERY IMPORTANT)
        const userId = req.user?.id;

        if (userId) {
            const User = require("../models/User");
            const Seller = require("../models/Seller");

            await User.findByIdAndUpdate(userId, { refreshToken: null });
            await Seller.findByIdAndUpdate(userId, { refreshToken: null });
        }

        // 🔥 2. Clear cookies
        res.clearCookie("accessToken", {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        // 🔥 3. Send response
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                exists: false, 
                message: "Email is required" 
            });
        }
        
        // Check in User collection
        const userExists = await User.findOne({ email: email.toLowerCase() });
        
        // Check in Seller collection
        const sellerExists = await Seller.findOne({ email: email.toLowerCase() });
        
        const exists = !!(userExists || sellerExists);
        
        res.json({ 
            success: true, 
            exists,
            message: exists ? "Email already registered" : "Email available"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Check if phone exists
// @route   POST /api/auth/check-phone
// @access  Public
exports.checkPhone = async (req, res) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({ 
                success: false, 
                exists: false, 
                message: "Phone number is required" 
            });
        }
        
        // Check in User collection
        const userExists = await User.findOne({ phone });
        
        // Check in Seller collection
        const sellerExists = await Seller.findOne({ phone });
        
        const exists = !!(userExists || sellerExists);
        
        res.json({ 
            success: true, 
            exists,
            message: exists ? "Phone number already registered" : "Phone number available"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
