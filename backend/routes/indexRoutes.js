const router = require("express").Router();
const authRoutes = require("./authRoutes");
const registrationRoutes = require('./registrationRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const cartRoutes = require('./cartRoutes'); 
const sellerRoutes = require('./sellerRoutes'); 
const orderRoutes = require('./orderRoutes'); 
const addressRoutes = require('./addressRoutes');
const adminRoutes = require('./adminRoutes');
const paymentRoutes = require('./paymentRoutes'); 

router.use("/auth", authRoutes);
router.use('/register', registrationRoutes); 
router.use('/products', productRoutes);
router.use('/categories',categoryRoutes);
router.use('/cart', cartRoutes); 
router.use('/orders', orderRoutes); 
router.use('/seller', sellerRoutes); 
router.use('/address', addressRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes); 

module.exports = router;