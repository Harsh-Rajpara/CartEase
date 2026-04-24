const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  restoreCategory,

} = require('../controllers/categoryController');
const {protect, adminOnly, sellerOnly } = require('../middleware/auth');

router.get('/', getCategories);
// Routes
router.use(protect);

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


// Admin only routes
router.post('/', adminOnly, createCategory);

router.get('/:id',adminOnly, getCategoryById);

router.put('/:id', adminOnly, updateCategory);

router.delete('/:id', adminOnly, deleteCategory);

router.post('/:id/restore', adminOnly, restoreCategory);

module.exports = router;