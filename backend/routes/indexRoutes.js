const router = require("express").Router();
const authRoutes = require("./authRoutes");
const registrationRoutes = require('./registrationRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const cartRoutes = require('./cartRoutes'); // Add cart routes
const sellerRoutes = require('./sellerRoutes'); // ✅ ADD THIS LINE
const orderRoutes = require('./orderRoutes'); // ✅ Make sure this exists
const addressRoutes = require('./addressRoutes');
const adminRoutes = require('./adminRoutes');
const paymentRoutes = require('./paymentRoutes'); // ✅ ADD THIS LINE

router.use("/auth", authRoutes);
router.use('/register', registrationRoutes); // Progressive registration with OTP
router.use('/products', productRoutes);
router.use('/categories',categoryRoutes);
router.use('/cart', cartRoutes); 
router.use('/orders', orderRoutes); // ✅ Make sure this is present
router.use('/seller', sellerRoutes); // ✅ ADD THIS LINE
router.use('/address', addressRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes); // ✅ ADD THIS LINE

module.exports = router;