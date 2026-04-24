const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Brand name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    originalPrice: {
        type: Number,
        required: [true, 'Original price is required'], 
        min: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        default: 0,
        min: 0
    },

    images: [{
        url: String,
        publicId: String
    }],
    specifications: {
        type: Map,
        of: String,
        default: {}
    },
    variants: {
        type: [
            {
                variantType: {
                    type: String, // Removed enum - now accepts any string
                    required: true
                },
                options: [
                    {
                        value: {
                            type: String,
                            required: true
                        },
                        stock: {
                            type: Number,
                            default: 0
                        }
                    }
                ]
            }
        ],
        default: []
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
  
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'  // ✅ Default: pending when seller adds product
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Product', productSchema);