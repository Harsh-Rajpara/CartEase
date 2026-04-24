const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Seller = require('../models/Seller');
const {
  getAllSellers,
  getSellerById,
  updateSellerVerification,
  updateSellerStatus,
  deleteSeller,
  getSellerStats
} = require('../controllers/adminController');

router.use(protect, adminOnly);

// Get all products with filters
router.get('/products', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .populate('seller', 'businessName email fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      count: products.length,
      total,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get admin stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSellers = await Seller.countDocuments();
    
    // ✅ Calculate revenue from all orders (excluding cancelled)
    const revenueResult = await Order.aggregate([
      { 
        $match: { 
          orderStatus: { $nin: ['cancelled'] }  // Exclude cancelled orders
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$totalAmount' } 
        } 
      }
    ]);
    
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Calculate revenue from last month for growth
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthRevenue = await Order.aggregate([
      { 
        $match: { 
          orderStatus: { $nin: ['cancelled'] },
          createdAt: { $gte: lastMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const previousMonthRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
      : 0;
    
    // Calculate order growth
    const lastMonthOrders = await Order.countDocuments({
      orderStatus: { $nin: ['cancelled'] },
      createdAt: { $gte: lastMonth }
    });
    
    const previousMonthOrders = await Order.countDocuments({
      orderStatus: { $nin: ['cancelled'] },
      createdAt: { $lt: lastMonth }
    });
    
    const orderGrowth = previousMonthOrders > 0 
      ? ((totalOrders - previousMonthOrders) / previousMonthOrders * 100).toFixed(1)
      : 0;
    
    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalSellers,
        totalRevenue,
        revenueGrowth: parseFloat(revenueGrowth),
        orderGrowth: parseFloat(orderGrowth)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent orders
router.get('/recent-orders', protect, adminOnly, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'fullName email');
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent products
router.get('/recent-products', protect, adminOnly, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get users count
router.get('/users/count', protect, adminOnly, async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'user' });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sellers count
router.get('/sellers/count', protect, adminOnly, async (req, res) => {
  try {
    const count = await Seller.countDocuments();
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    // ✅ Show both admin and user roles (exclude sellers if you have separate seller collection)
    const users = await User.find({ role: { $in: ['user', 'admin'] } })
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get order counts for each user
    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ userId: user._id });
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        return {
          ...user.toObject(),
          ordersCount: orders.length,
          totalSpent: totalSpent
        };
      })
    );
    
    res.json({
      success: true,
      count: usersWithOrders.length,
      data: usersWithOrders
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      data: user,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      data: user,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// backend/controllers/adminController.js or your route handler

// Approve product
router.patch('/products/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    console.log('=== APPROVE PRODUCT ===');
    console.log('Product ID:', req.params.id);
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    console.log('Current product status:', product.status);
    
    // Update the product using 'status' field (not 'approvalStatus')
    product.status = 'approved';
    await product.save();
    
    console.log('Updated product status:', product.status);
    
    res.json({ 
      success: true, 
      data: product,
      message: 'Product approved successfully' 
    });
  } catch (error) {
    console.error('Error in approve route:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject product
router.patch('/products/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    console.log('=== REJECT PRODUCT ===');
    console.log('Product ID:', req.params.id);
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    console.log('Current product status:', product.status);
    
    // Update the product using 'status' field
    product.status = 'rejected';
    await product.save();
    
    console.log('Updated product status:', product.status);
    
    res.json({ 
      success: true, 
      data: product,
      message: 'Product rejected successfully' 
    });
  } catch (error) {
    console.error('Error in reject route:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Move to pending
router.patch('/products/:id/pending', protect, adminOnly, async (req, res) => {
  try {
    console.log('=== MOVE TO PENDING ===');
    console.log('Product ID:', req.params.id);
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    console.log('Current product status:', product.status);
    
    // Update the product using 'status' field
    product.status = 'pending';
    await product.save();
    
    console.log('Updated product status:', product.status);
    
    res.json({ 
      success: true, 
      data: product,
      message: 'Product moved to pending successfully' 
    });
  } catch (error) {
    console.error('Error in pending route:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sellers', getAllSellers);
router.get('/sellers/stats', getSellerStats);
router.get('/sellers/:id', getSellerById);
router.put('/sellers/:id/verify', updateSellerVerification);
router.put('/sellers/:id/status', updateSellerStatus);
router.delete('/sellers/:id', deleteSeller);

module.exports = router;