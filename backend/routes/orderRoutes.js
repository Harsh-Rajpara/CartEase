const express = require('express');
const router = express.Router();
const { protect, adminOnly, sellerOnly } = require('../middleware/auth');
const {
    checkoutFromCart,
    buyNow,
    verifyPayment,
    getMyOrders,
    getOrderById,
    cancelOrder,
    // getSellerOrders,
    getAllOrders,
    updateOrderStatus,
    getOrderStats
} = require('../controllers/orderController');

// User routes
router.post('/checkout', protect, checkoutFromCart);
router.post('/buy-now', protect, buyNow);
router.post('/verify-payment', protect, verifyPayment); 
router.get('/my-orders', protect, getMyOrders);
router.put('/:orderId/cancel', protect, cancelOrder);

router.get('/:orderId', protect, getOrderById);

// Seller routes

// Admin routes
router.get('/admin/all-orders', protect, adminOnly, getAllOrders);
router.get('/admin/stats', protect, adminOnly, getOrderStats);
router.put('/:orderId/status', protect, adminOnly, updateOrderStatus);

module.exports = router;