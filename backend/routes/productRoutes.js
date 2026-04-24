const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    addProduct,
    getSellerProducts,
    updateProduct,
    deleteProduct,
    getProductCountByCategory,
    updateProductStock    

} = require('../controllers/productController');
const { protect, sellerOnly } = require('../middleware/auth');
const upload = require('../config/cloudinary');

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
  };
};

// Public routes
router.get('/', getAllProducts);
router.get('/count', getProductCountByCategory); 
router.get('/:id', getProductById);

// Protected routes
router.post('/add-product', protect, sellerOnly, upload.array('images', 5), addProduct);
router.get('/seller/products', protect, allowRoles('admin', 'seller'), getSellerProducts);



router.patch('/:productId/stock', protect, sellerOnly, updateProductStock);
router.put('/:id', protect, sellerOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, allowRoles('admin', 'seller'), deleteProduct);
module.exports = router;