
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const crypto = require('crypto');
const Razorpay = require('razorpay');  // ← Add this

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// @desc    Get seller's orders with complete details
// @route   GET /api/orders/seller/orders
// @access  Private/Seller
// const getSellerOrders = async (req, res) => {
//     try {
//         const sellerId = req.user.id;
        
//         console.log('========== GET SELLER ORDERS ==========');
//         console.log('Seller ID:', sellerId);
        
//         // Get all orders with populated data
//         const orders = await Order.find({})
//             .populate('userId', 'fullName email phone')
//             .populate('items.productId', 'name images price description category brand')
//             .sort({ createdAt: -1 });
        
//         console.log('Total orders found:', orders.length);
        
//         // Filter orders that contain items from this seller
//         const sellerOrders = [];
        
//         for (const order of orders) {
//             // Filter items that belong to this seller
//             const sellerItems = (order.items || []).filter(item => {
//                 const itemSellerId = item.sellerId?.toString();
//                 return itemSellerId === sellerId;
//             });
            
//             if (sellerItems.length > 0) {
//                 // Get user data
//                 const userData = order.userId || {};
                
//                 // Format items with complete details
//                 const formattedItems = sellerItems.map(item => ({
//                     _id: item._id,
//                     name: item.name,
//                     price: item.price,
//                     quantity: item.quantity,
//                     image: item.image,
//                     variant: item.variant,
//                     totalPrice: item.price * item.quantity,
//                     productDetails: item.productId ? {
//                         _id: item.productId._id,
//                         name: item.productId.name,
//                         images: item.productId.images,
//                         description: item.productId.description,
//                         category: item.productId.category,
//                         brand: item.productId.brand
//                     } : null
//                 }));
                
//                 // Handle shipping address (string or object)
//                 let shippingAddress = {};
//                 if (typeof order.shippingAddress === 'string') {
//                     shippingAddress = { fullAddress: order.shippingAddress };
//                 } else if (order.shippingAddress) {
//                     shippingAddress = order.shippingAddress;
//                 } else {
//                     shippingAddress = { fullAddress: 'No address provided' };
//                 }
                
//                 sellerOrders.push({
//                     // Order Info
//                     _id: order._id,
//                     orderNumber: order.orderNumber,
                    
//                     // Customer Info
//                     customer: {
//                         _id: userData._id,
//                         fullName: userData.fullName || 'Guest',
//                         email: userData.email || 'N/A',
//                         phone: userData.phone || order.phone || 'N/A'
//                     },
                    
//                     // Order Items
//                     items: formattedItems,
//                     itemsCount: formattedItems.length,
//                     totalItemsCount: order.items.length,
                    
//                     // Order Totals
//                     subtotal: order.subtotal,
//                     shippingCharge: order.shippingCharge,
//                     tax: order.tax,
//                     totalAmount: order.totalAmount,
                    
//                     // Shipping Address
//                     shippingAddress: shippingAddress,
                    
//                     // Payment Info
//                     paymentMethod: order.paymentMethod,
//                     paymentStatus: order.paymentStatus,
                    
//                     // Order Status
//                     orderStatus: order.orderStatus,
                    
//                     // Dates
//                     createdAt: order.createdAt,
//                     updatedAt: order.updatedAt,
                    
//                     // Additional Info
//                     notes: order.notes || '',
//                     phone: order.phone
//                 });
//             }
//         }
        
//         console.log('Seller orders found:', sellerOrders.length);
        
//         // Calculate statistics
//         const totalRevenue = sellerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
//         const totalOrders = sellerOrders.length;
//         const totalItems = sellerOrders.reduce((sum, order) => sum + (order.itemsCount || 0), 0);
        
//         const statusCounts = {
//             ordered: sellerOrders.filter(o => o.orderStatus === 'ordered').length,
//             confirmed: sellerOrders.filter(o => o.orderStatus === 'confirmed').length,
//             processing: sellerOrders.filter(o => o.orderStatus === 'processing').length,
//             packed: sellerOrders.filter(o => o.orderStatus === 'packed').length,
//             shipped: sellerOrders.filter(o => o.orderStatus === 'shipped').length,
//             out_for_delivery: sellerOrders.filter(o => o.orderStatus === 'out_for_delivery').length,
//             delivered: sellerOrders.filter(o => o.orderStatus === 'delivered').length,
//             cancelled: sellerOrders.filter(o => o.orderStatus === 'cancelled').length
//         };
        
//         res.json({
//             success: true,
//             count: sellerOrders.length,
//             stats: {
//                 totalRevenue,
//                 totalOrders,
//                 totalItems,
//                 statusCounts
//             },
//             data: sellerOrders
//         });
        
//     } catch (error) {
//         console.error('Error in getSellerOrders:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };
// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all-orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'fullName email phone')
            .populate('items.productId', 'name images price')
            .populate('items.sellerId', 'fullName email businessName')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('items.productId', 'name images price')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('userId', 'fullName email phone')
            .populate('items.productId', 'name images price')
            .populate('items.sellerId', 'fullName email businessName');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check if user has permission to view this order
        const isOwner = order.userId._id.toString() === req.user.id;
        const isSeller = order.items.some(item => 
            item.sellerId && item.sellerId._id.toString() === req.user.id
        );
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isSeller && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// backend/controllers/orderController.js

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { orderId } = req.params;
        
        console.log('=== UPDATE ORDER STATUS ===');
        console.log('Order ID:', orderId);
        console.log('New Status:', status);
        
        // Valid statuses matching your schema
        const validStatuses = ['ordered', 'packed', 'shipped', 'out_of_delivery', 'delivered'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        console.log('Current order status:', order.orderStatus);
        console.log('Current payment status:', order.paymentStatus);
        console.log('Payment method:', order.paymentMethod);
        
        // Add to status history
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
            status: status,
            comment: `Order status updated to ${status.toUpperCase()} by admin`,
            updatedBy: req.user.id,
            updatedAt: new Date()
        });
        
        order.orderStatus = status;
        
        // 🔥 CRITICAL: Update payment status for COD orders when delivered
        if (status === 'delivered' && order.paymentMethod === 'cod') {
            order.paymentStatus = 'completed';
            console.log('✅ COD order delivered - Payment status updated to completed');
            
            // Add payment completion to status history
            order.statusHistory.push({
                status: status,
                comment: 'Payment collected successfully (Cash on Delivery)',
                updatedBy: req.user.id,
                updatedAt: new Date()
            });
        }
        
       
        
        await order.save();
        
        console.log('✅ Order status updated to:', order.orderStatus);
        console.log('✅ Payment status is now:', order.paymentStatus);
        
        res.json({
            success: true,
            data: order,
            message: `Order ${status === 'delivered' && order.paymentMethod === 'cod' ? 'delivered and payment completed' : 'status updated'} successfully`
        });
        
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check if user owns this order
        if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }
        
        // Check if order can be cancelled (only if not delivered or already cancelled)
        if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled'
            });
        }
        
        order.orderStatus = 'cancelled';
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
            status: 'cancelled',
            comment: 'Order cancelled by user',
            updatedBy: req.user.id,
            updatedAt: new Date()
        });
        
        await order.save();
        
        res.json({
            success: true,
            data: order,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// const checkoutFromCart = async (req, res) => {
//     try {
//         const { addressId, paymentMethod, notes } = req.body;
        
//         // Get user's cart with populated product details
//         const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        
//         if (!cart || cart.items.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Cart is empty'
//             });
//         }
        
//         // Get user and find the specific address
//         const user = await User.findById(req.user.id);
//         const address = user.addresses.id(addressId);
        
//         if (!address) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Address not found'
//             });
//         }
        
//         // Format shipping address as STRING
//         const shippingAddressString = `${address.flatHouseNo}, ${address.areaStreet}${address.landmark ? `, ${address.landmark}` : ''}, ${address.city}, ${address.state} - ${address.pincode}, ${address.country || 'India'}`;
        
//         // Calculate totals and prepare order items
//         let subtotal = 0;
//         const orderItems = [];
        
//         for (const cartItem of cart.items) {
//             const product = cartItem.product;
            
//             // Check if product has seller field
//             if (!product.seller) {
//                 console.error('Product missing seller:', product._id);
//                 return res.status(400).json({
//                     success: false,
//                     message: `Product "${product.name}" is missing seller information`
//                 });
//             }
            
//             const itemTotal = product.price * cartItem.quantity;
//             subtotal += itemTotal;
            
//             orderItems.push({
//                 productId: product._id,
//                 sellerId: product.seller,  // product.seller references Seller model
//                 name: product.name,
//                 price: product.price,
//                 quantity: cartItem.quantity,
//                 image: product.images?.[0]?.url || '',
//                 variant: cartItem.variant || '',
//                 totalPrice: itemTotal
//             });
//         }
        
//         if (orderItems.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No valid items in cart'
//             });
//         }
        
//         const shippingCharge = subtotal > 500 ? 0 : 40;
//         const tax = subtotal * 0.05;
//         const totalAmount = subtotal + shippingCharge + tax;
        
//         // Generate order number
//         const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 100000);
        
//         // Create order
//         const order = await Order.create({
//             orderNumber,
//             userId: req.user.id,
//             items: orderItems,
//             subtotal,
//             shippingCharge,
//             tax,
//             totalAmount,
//             addressId: addressId,
//             shippingAddress: shippingAddressString,
//             phone: user.phone || '',
//             paymentMethod,
//             paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
//             orderStatus: 'ordered',
//             notes: notes || '',
//             statusHistory: [{
//                 status: 'ordered',
//                 comment: 'Order placed successfully',
//                 updatedBy: req.user.id,
//                 updatedAt: new Date()
//             }]
//         });
        
//         // Clear cart
//         cart.items = [];
//         cart.subtotal = 0;
//         cart.tax = 0;
//         cart.shipping = 0;
//         cart.total = 0;
//         await cart.save();
        
//         res.json({
//             success: true,
//             data: order,
//             message: 'Order placed successfully'
//         });
        
//     } catch (error) {
//         console.error('Checkout error:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// Buy Now Controller

// backend/controllers/orderController.js

const checkoutFromCart = async (req, res) => {
    try {
        const { addressId, paymentMethod, notes } = req.body;
        
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }
        
        const user = await User.findById(req.user.id);
        const address = user.addresses.id(addressId);
        
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }
        
        const shippingAddressString = `${address.flatHouseNo}, ${address.areaStreet}${address.landmark ? `, ${address.landmark}` : ''}, ${address.city}, ${address.state} - ${address.pincode}, ${address.country || 'India'}`;
        
        let subtotal = 0;
        const orderItems = [];
        
        for (let i = 0; i < cart.items.length; i++) {
            const cartItem = cart.items[i];
            const product = cartItem.product;
            
            // Check if enough stock is available
            if (product.stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} has only ${product.stock} items in stock. Please reduce quantity.`
                });
            }
            
            // 🔥 REDUCE STOCK IMMEDIATELY
            product.stock -= cartItem.quantity;
            await product.save();


            orderItems.push({
                productId: product._id,
                sellerId: product.seller,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.images?.[0]?.url || '',
                variant: cartItem.variants || '',
                totalPrice: product.price * cartItem.quantity
            });
            
            subtotal += product.price * cartItem.quantity;
        }
        
        const shippingCharge = subtotal > 500 ? 0 : 40;
        const tax = subtotal * 0.05;
        const totalAmount = subtotal + shippingCharge + tax;
        
        let razorpayOrder = null;
        
        // Determine payment status based on payment method
        let paymentStatus = 'pending';
        if (paymentMethod === 'razorpay') {
            // For Razorpay, we'll create an order but payment status remains 'pending'
            // It will be updated to 'completed' after successful payment verification
            paymentStatus = 'pending';
        } else if (paymentMethod === 'cod') {
            // For COD, payment is pending until delivery
            paymentStatus = 'pending';
        }

        // CREATE RAZORPAY ORDER IF PAYMENT METHOD IS RAZORPAY
        if (paymentMethod === 'razorpay') {
            try {
                if (!razorpay) {
                    console.error('Razorpay not initialized');
                    return res.status(500).json({
                        success: false,
                        message: 'Payment gateway configuration error'
                    });
                }
                
                const options = {
                    amount: Math.round(totalAmount * 100),
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`,
                    payment_capture: 1,
                };
                
                console.log('Creating Razorpay order with options:', options);
                razorpayOrder = await razorpay.orders.create(options);
                console.log('Razorpay order created successfully:', razorpayOrder.id);
                
            } catch (razorpayError) {
                console.error('Razorpay order creation failed:', razorpayError);
                product.stock += quantity;
                await product.save();
                return res.status(500).json({
                    success: false,
                    message: razorpayError.message || 'Failed to create payment order. Please try again.'
                });
            }
        }

        const order = await Order.create({
            orderNumber: 'ORD' + Date.now() + Math.floor(Math.random() * 100000),
            userId: req.user.id,
            items: orderItems,
            subtotal,
            shippingCharge,
            tax,
            totalAmount,
            addressId: addressId,
            shippingAddress: shippingAddressString,
            phone: user.phone || '',
            paymentMethod,
            paymentStatus: paymentStatus, // 'pending' for both COD and Razorpay initially
            orderStatus: 'ordered',
            razorpayOrderId: razorpayOrder?.id || null,
            notes: notes || '',
            statusHistory: [{
                status: 'ordered',
                comment: 'Order placed',
                updatedBy: req.user.id,
                updatedAt: new Date()
            }]
        });
        
        // Only clear cart for COD orders (Razorpay orders cleared after payment verification)
        if (paymentMethod === 'cod') {
            cart.items = [];
            cart.subtotal = 0;
            cart.tax = 0;
            cart.shipping = 0;
            cart.total = 0;
            await cart.save();
        }
        
        res.json({
            success: true,
            data: {
                _id: order._id,
                orderNumber: order.orderNumber,
                razorpayOrder: razorpayOrder ? {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                } : null,
            },
            message: paymentMethod === 'razorpay' ? 'Payment order created' : 'Order placed successfully'
        });
        
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const buyNow = async (req, res) => {
    try {
        const { productId, quantity, addressId, paymentMethod, variant, notes } = req.body;
        
        // Get product details
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // 🔥 CRITICAL FIX: Check stock BEFORE creating order
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `${product.name} has only ${product.stock} items in stock.`
            });
        }
        
        // Check if product has seller (using 'seller' field)
        if (!product.seller) {
            return res.status(400).json({
                success: false,
                message: 'Product seller information missing. Please contact support.'
            });
        }
        
        // Get user and find the specific address
        const user = await User.findById(req.user.id);
        const address = user.addresses.id(addressId);
        
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }
        
        // Format shipping address as STRING
        const shippingAddressString = `${address.flatHouseNo}, ${address.areaStreet}${address.landmark ? `, ${address.landmark}` : ''}, ${address.city}, ${address.state} - ${address.pincode}, ${address.country || 'India'}`;
        
        // Calculate totals
        const subtotal = product.price * quantity;
        const shippingCharge = subtotal > 500 ? 0 : 40;
        const tax = subtotal * 0.05;
        const totalAmount = subtotal + shippingCharge + tax;
        
        // Generate order number
        const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 100000);
        

        product.stock -= quantity;
        await product.save();


        // Create order items
        const orderItems = [{
            productId: product._id,
            sellerId: product.seller,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.images?.[0]?.url || '',
            variant: variant || '',
            totalPrice: product.price * quantity
        }];
        
        let razorpayOrder = null;
        
        // 🔥 CREATE RAZORPAY ORDER IF PAYMENT METHOD IS RAZORPAY
        if (paymentMethod === 'razorpay') {
            try {
                const options = {
                    amount: Math.round(totalAmount * 100), // Convert to paise
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`,
                    payment_capture: 1,
                };
                
                razorpayOrder = await razorpay.orders.create(options);
                console.log('Razorpay order created:', razorpayOrder);
                
            } catch (razorpayError) {
                console.error('Razorpay order creation failed:', razorpayError);
                 product.stock += quantity;
                await product.save();
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create payment order. Please try again.'
                });
            }
        }
        
        // Create order
        const order = await Order.create({
            orderNumber,
            userId: req.user.id,
            items: orderItems,
            subtotal,
            shippingCharge,
            tax,
            totalAmount,
            addressId: addressId,
            shippingAddress: shippingAddressString,
            phone: user.phone || '',
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            orderStatus: 'ordered',
            razorpayOrderId: razorpayOrder?.id || null,  // Save Razorpay order ID
            notes: notes || '',
            statusHistory: [{
                status: 'ordered',
                comment: 'Order placed successfully',
                updatedBy: req.user.id,
                updatedAt: new Date()
            }]
        });
        
        // 🔥 RETURN RAZORPAY ORDER DATA FOR FRONTEND
        res.json({
            success: true,
            data: {
                _id: order._id,
                orderNumber: order.orderNumber,
                razorpayOrder: razorpayOrder ? {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                } : null,
            },
            message: paymentMethod === 'razorpay' ? 'Payment order created' : 'Order placed successfully'
        });
        
    } catch (error) {
        console.error('Buy now error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const verifyPayment = async (req, res) => {
    try {
        const { orderId, paymentId, razorpayOrderId, signature } = req.body;
        
        console.log('Verifying payment:', { orderId, paymentId, razorpayOrderId });
        
        // Verify signature
        const body = `${razorpayOrderId}|${paymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');
        
        if (expectedSignature !== signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
        
        // Find order
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // ✅ Update payment details ONLY - DON'T change orderStatus
        order.paymentId = paymentId;
        order.paymentStatus = 'completed';
        order.razorpayOrderId = razorpayOrderId;
        
        // ✅ Add to status history using existing orderStatus (which is 'ordered')
        order.statusHistory.push({
            status: order.orderStatus,  // This will be 'ordered', NOT 'confirmed'
            comment: `Payment completed successfully. Payment ID: ${paymentId}`,
            updatedBy: req.user.id,
            updatedAt: new Date()
        });
        
        await order.save();
        
        console.log('✅ Payment verified - Order status remains:', order.orderStatus);
        console.log('✅ Payment status updated to: completed');
        
        // Clear cart after successful payment
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart && cart.items.length > 0) {
            cart.items = [];
            cart.subtotal = 0;
            cart.tax = 0;
            cart.shipping = 0;
            cart.total = 0;
            await cart.save();
            console.log('✅ Cart cleared');
        }
        
        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: order
        });
        
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment verification failed'
        });
    }
};


// @desc    Get order stats (Admin)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        const statusCounts = await Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            data: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                statusCounts
            }
        });
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
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
};