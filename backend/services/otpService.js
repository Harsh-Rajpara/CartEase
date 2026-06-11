// backend/services/otpService.js
const otpGenerator = require('otp-generator');
const { sendOTPByEmail } = require("./emailService");

// Generate numeric OTP 
exports.generateOTP = () => {
    return otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false
    });
};

exports.generateSimpleOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

