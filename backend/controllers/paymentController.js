const crypto = require('crypto');
const Order = require('../models/Order');

exports.verifyPayment = async (req, res) => {
    try {
        const {
            orderId,
            paymentId,
            razorpayOrderId,
            signature
        } = req.body;

        console.log('Verifying payment:', { orderId, paymentId, razorpayOrderId });

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify signature
        const body = razorpayOrderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === signature;

        if (isAuthentic) {
            // Update order status - USING VALID STATUS VALUES
            order.paymentStatus = 'completed';
            order.orderStatus = 'confirmed'; // ✅ VALID: 'confirmed'
            order.paymentId = paymentId;
            order.statusHistory.push({
                status: 'confirmed', // ✅ VALID: 'confirmed'
                comment: 'Payment received and order confirmed',
                updatedBy: req.user.id
            });
            
            await order.save();

            res.json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    orderId: order._id,
                    orderNumber: order.orderNumber
                }
            });
        } else {
            order.paymentStatus = 'failed';
            order.statusHistory.push({
                status: 'ordered', // ✅ Keep as 'ordered' since payment failed
                comment: 'Payment verification failed',
                updatedBy: req.user.id
            });
            await order.save();

            res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};