// backend/services/otpService.js
const otpGenerator = require('otp-generator');
const { sendOTPByEmail } = require("./emailService");

// Generate numeric OTP (6 digits)
exports.generateOTP = () => {
    return otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false
    });
};

// Alternative: Simple numeric OTP generator
exports.generateSimpleOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email (for development - logs to console)
exports.sendOTPByEmail  = async (email, otp) => {
     await sendOTPByEmail (email, otp);

      console.log('\n=================================');
    console.log(`📱 OTP for ${email}: ${otp}`);
    console.log('=================================\n');
};

// Send OTP via SMS (for development - logs to console)
exports.sendOTPBySMS = async (phone, otp) => {
    // For development, just log to console
    console.log('\n=================================');
    console.log(`📱 OTP for ${phone}: ${otp}`);
    console.log('=================================\n');
    
    return {
        success: true,
        otp: otp,
        message: "OTP sent successfully"
    };
};