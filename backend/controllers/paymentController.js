const crypto = require('crypto');
const Order = require('../models/Order');

// exports.verifyPayment = async (req, res) => {
//     try {
//         const {
//             orderId,
//             paymentId,
//             razorpayOrderId,
//             signature
//         } = req.body;

//         console.log('Verifying payment:', { orderId, paymentId, razorpayOrderId });

//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found'
//             });
//         }

//         const body = razorpayOrderId + "|" + paymentId;
//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body.toString())
//             .digest("hex");

//         const isAuthentic = expectedSignature === signature;

//         if (isAuthentic) {
//             order.paymentStatus = 'completed';
//             order.orderStatus = 'confirmed'; 
//             order.paymentId = paymentId;
//             order.statusHistory.push({
//                 status: 'confirmed',
//                 comment: 'Payment received and order confirmed',
//                 updatedBy: req.user.id
//             });
            
//             await order.save();

//             res.json({
//                 success: true,
//                 message: 'Payment verified successfully',
//                 data: {
//                     orderId: order._id,
//                     orderNumber: order.orderNumber
//                 }
//             });
//         } else {
//             order.paymentStatus = 'failed';
//             order.statusHistory.push({
//                 status: 'ordered', 
//                 comment: 'Payment verification failed',
//                 updatedBy: req.user.id
//             });
//             await order.save();

//             res.status(400).json({
//                 success: false,
//                 message: 'Invalid payment signature'
//             });
//         }
//     } catch (error) {
//         console.error('Payment verification error:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };