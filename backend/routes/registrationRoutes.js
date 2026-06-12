const router = require('express').Router();
const {
    sendEmailOTP,
    verifyEmailOTP,
    sendPhoneOTP,
    verifyPhoneOTP,
    completeRegistration
} = require('../controllers/registrationController');
const validate = require('../middleware/validate.middleware');
const {
    emailOTPSchema,
    verifyEmailOTPSchema,
    phoneOTPSchema,
    verifyPhoneOTPSchema,
    completeRegistrationSchema
} = require('../validators/registration.validator');

// Step 1: Email OTP
router.post('/send-email-otp', validate(emailOTPSchema), sendEmailOTP);
router.post('/verify-email-otp', validate(verifyEmailOTPSchema), verifyEmailOTP);

// Step 2: Phone OTP
router.post('/send-phone-otp', validate(phoneOTPSchema), sendPhoneOTP);
router.post('/verify-phone-otp', validate(verifyPhoneOTPSchema), verifyPhoneOTP);

// Step 3: Complete Registration
router.post('/complete', validate(completeRegistrationSchema), completeRegistration);

module.exports = router;