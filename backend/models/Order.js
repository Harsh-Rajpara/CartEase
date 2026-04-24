
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    variant: String,
    totalPrice: Number
});



const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    shippingCharge: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'razorpay', 'card', 'upi'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['ordered', 'packed', 'shipped', 'out_of_delivery', 'delivered'],
        default: 'ordered'
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    paymentId: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['ordered', 'packed', 'shipped', 'out_of_delivery', 'delivered'],
            required: true
        },
        comment: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);


