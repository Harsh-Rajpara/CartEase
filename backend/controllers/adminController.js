const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get all sellers
// @route   GET /api/admin/sellers
// @access  Private/Admin
const getAllSellers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.verificationStatus = status;
    }
    
    const skip = (page - 1) * limit;
    
    const sellers = await Seller.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get product count for each seller
    const sellersWithCounts = await Promise.all(
      sellers.map(async (seller) => {
        const productCount = await Product.countDocuments({ seller: seller._id });
        const orders = await Order.find({ 'items.sellerId': seller._id });
        const totalRevenue = orders.reduce((sum, order) => {
          const sellerItems = order.items.filter(item => 
            item.sellerId && item.sellerId.toString() === seller._id.toString()
          );
          return sum + sellerItems.reduce((s, item) => s + (item.totalPrice || 0), 0);
        }, 0);
        
        return {
          ...seller.toObject(),
          totalProducts: productCount,
          totalRevenue: totalRevenue,
          totalOrders: orders.length
        };
      })
    );
    
    const total = await Seller.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: sellersWithCounts.length,
      total,
      data: sellersWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all sellers error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single seller by ID
// @route   GET /api/admin/sellers/:id
// @access  Private/Admin
const getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    
    // Get seller statistics
    const productCount = await Product.countDocuments({ seller: seller._id });
    const orders = await Order.find({ 'items.sellerId': seller._id });
    const totalRevenue = orders.reduce((sum, order) => {
      const sellerItems = order.items.filter(item => 
        item.sellerId && item.sellerId.toString() === seller._id.toString()
      );
      return sum + sellerItems.reduce((s, item) => s + (item.totalPrice || 0), 0);
    }, 0);
    
    const sellerData = {
      ...seller.toObject(),
      totalProducts: productCount,
      totalRevenue: totalRevenue,
      totalOrders: orders.length
    };
    
    res.status(200).json({
      success: true,
      data: sellerData
    });
  } catch (error) {
    console.error('Get seller by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update seller verification status
// @route   PUT /api/admin/sellers/:id/verify
// @access  Private/Admin
const updateSellerVerification = async (req, res) => {
  try {
    const { status } = req.body; // approved, rejected, pending
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    
    seller.verificationStatus = status;
    seller.verifiedAt = status === 'approved' ? new Date() : null;
    seller.verifiedBy = req.user._id;
    
    await seller.save();
    
    res.status(200).json({
      success: true,
      data: seller,
      message: `Seller ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'} successfully`
    });
  } catch (error) {
    console.error('Update seller verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update seller status (active/inactive)
// @route   PUT /api/admin/sellers/:id/status
// @access  Private/Admin
const updateSellerStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    
    seller.isActive = isActive;
    await seller.save();
    
    res.status(200).json({
      success: true,
      data: seller,
      message: `Seller ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update seller status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete seller (soft delete)
// @route   DELETE /api/admin/sellers/:id
// @access  Private/Admin
const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    
    // Soft delete - just mark as inactive
    seller.isActive = false;
    await seller.save();
    
    res.status(200).json({
      success: true,
      message: 'Seller deactivated successfully'
    });
  } catch (error) {
    console.error('Delete seller error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get seller statistics
// @route   GET /api/admin/sellers/stats
// @access  Private/Admin
const getSellerStats = async (req, res) => {
  try {
    const totalSellers = await Seller.countDocuments();
    const approvedSellers = await Seller.countDocuments({ verificationStatus: 'approved' });
    const pendingSellers = await Seller.countDocuments({ verificationStatus: 'pending' });
    const rejectedSellers = await Seller.countDocuments({ verificationStatus: 'rejected' });
    const activeSellers = await Seller.countDocuments({ isActive: true });
    
    // Get total products from all sellers
    const allProducts = await Product.find({});
    const totalProducts = allProducts.length;
    
    // Get total revenue from all sellers
    const orders = await Order.find({});
    let totalRevenue = 0;
    
    orders.forEach(order => {
      totalRevenue += order.totalAmount || 0;
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalSellers,
        approvedSellers,
        pendingSellers,
        rejectedSellers,
        activeSellers,
        totalProducts,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Get seller stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllSellers,
  getSellerById,
  updateSellerVerification,
  updateSellerStatus,
  deleteSeller,
  getSellerStats
};