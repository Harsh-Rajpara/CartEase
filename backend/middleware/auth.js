
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Seller = require("../models/Seller");

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Get token from cookie
        if (req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authorized, no token" 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        console.log("Cookies:", req.cookies);
console.log("Token:", req.cookies.accessToken);
        next();
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ 
            success: false, 
            message: "Not authorized, token failed" 
        });
    }
};

// Seller only middleware
exports.sellerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'seller') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: "Seller access only" 
        });
    }
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: "Admin access only" 
        });
    }
};