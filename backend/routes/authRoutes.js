// server/routes/authRoutes.js
const router = require('express').Router();
const {
  // registerUser,
  loginUser,
  registerSeller,
  sendOTP,
  verifyOTP,
  resendOTP,
  getCurrentUser,
  logout,
  checkEmail,
  checkPhone
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require("../middleware/validate.middleware");
const {loginUserSchema, registerSellerSchema, otpSchema } = require('../validators/auth.validators');

router.post('/login', validate(loginUserSchema),loginUser);
router.post('/seller/register',validate(registerSellerSchema), registerSeller);

router.post('/send-otp', sendOTP);
router.post('/verify-otp', validate(otpSchema), verifyOTP);
router.post('/resend-otp', sendOTP); // Reuse sendOTP for resend
router.post('/logout',protect,logout);
router.post('/check-email', checkEmail);
router.post('/check-phone', checkPhone);
router.get('/me', protect, getCurrentUser);

module.exports = router;