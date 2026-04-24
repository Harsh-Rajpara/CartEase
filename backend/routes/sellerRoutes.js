// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth');
// const Order = require('../models/Order');
// const Product = require('../models/Product');
// const Seller = require('../models/Seller');

// // Get seller orders
// router.get('/orders', protect, async (req, res) => {
//   try {
//     console.log('Fetching orders for seller:', req.user._id);
    
//     // Find the seller
//     const seller = await Seller.findById(req.user._id);
    
//     if (!seller) {
//       console.log('Seller not found');
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Seller not found' 
//       });
//     }
    
//     console.log('Seller found:', seller.businessName);
//     console.log('Seller ID:', seller._id);
    
//     // Find orders that contain this seller's products
//     const orders = await Order.find({ 
//       'items.sellerId': seller._id 
//     })
//     .populate('userId', 'fullName email')
//     .sort({ createdAt: -1 });
    
//     console.log('Orders found:', orders.length);
    
//     // Format orders for seller view
//     const sellerOrders = orders.map(order => {
//       // Filter items belonging to this seller
//       const sellerItems = order.items.filter(item => 
//         item.sellerId && item.sellerId.toString() === seller._id.toString()
//       );
      
//       // Calculate total for seller's items only
//       const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
//       return {
//         _id: order._id,
//         orderNumber: order.orderNumber,
//         customerName: order.userId?.fullName || 'Customer',
//         customerEmail: order.userId?.email,
//         items: sellerItems,
//         totalAmount: sellerTotal,
//         orderStatus: order.orderStatus,
//         paymentStatus: order.paymentStatus,
//         createdAt: order.createdAt,
//         shippingAddress: order.shippingAddress
//       };
//     });
    
//     res.json({
//       success: true,
//       count: sellerOrders.length,
//       data: sellerOrders
//     });
    
//   } catch (error) {
//     console.error('Get seller orders error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// });

// // Get dashboard stats
// router.get('/dashboard-stats', protect, async (req, res) => {
//   try {
//     const seller = await Seller.findById(req.user._id);
    
//     if (!seller) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Seller not found' 
//       });
//     }
    
//     // Get products
//     const products = await Product.find({ seller: seller._id });
    
//     const totalProducts = products.length;
//     const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length;
//     const avgRating = products.reduce((sum, p) => sum + (p.rating || 0), 0) / totalProducts || 0;
    
//     // Get orders for this seller
//     const orders = await Order.find({ 
//       'items.sellerId': seller._id 
//     });
    
//     const totalOrders = orders.length;
//     const totalRevenue = orders.reduce((sum, o) => {
//       // Calculate only seller's portion
//       const sellerItems = o.items.filter(item => 
//         item.sellerId && item.sellerId.toString() === seller._id.toString()
//       );
//       const sellerTotal = sellerItems.reduce((s, item) => s + (item.totalPrice || 0), 0);
//       return sum + sellerTotal;
//     }, 0);
    
//     // Get unique customers
//     const uniqueCustomers = new Set(orders.map(o => o.userId?.toString()).filter(id => id));
    
//     res.json({
//       success: true,
//       data: {
//         totalProducts,
//         totalOrders,
//         totalRevenue,
//         totalCustomers: uniqueCustomers.size,
//         avgRating: avgRating.toFixed(1),
//         lowStock
//       }
//     });
//   } catch (error) {
//     console.error('Dashboard stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// });

// // Get seller products
// router.get('/products', protect, async (req, res) => {
//   try {
//     const seller = await Seller.findById(req.user._id);
    
//     if (!seller) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Seller not found' 
//       });
//     }
    
//     const products = await Product.find({ seller: seller._id });
    
//     res.json({
//       success: true,
//       data: products
//     });
//   } catch (error) {
//     console.error('Get products error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// });

// // Get sales chart data
// router.get('/sales-chart', protect, async (req, res) => {
//   try {
//     const { period = 'monthly' } = req.query;
    
//     // Sample data - replace with actual aggregated data
//     const salesData = [
//       { month: 'Jan', sales: 0 }, { month: 'Feb', sales: 0 },
//       { month: 'Mar', sales: 0 }, { month: 'Apr', sales: 0 },
//       { month: 'May', sales: 0 }, { month: 'Jun', sales: 0 }
//     ];
    
//     res.json({ success: true, data: salesData });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// });

// // Get revenue chart data
// router.get('/revenue-chart', protect, async (req, res) => {
//   try {
//     const { period = 'monthly' } = req.query;
    
//     const revenueData = [
//       { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 },
//       { month: 'Mar', revenue: 0 }, { month: 'Apr', revenue: 0 },
//       { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 }
//     ];
    
//     res.json({ success: true, data: revenueData });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Get seller orders - FIXED VERSION
router.get('/orders', protect, async (req, res) => {
  try {
    const sellerId = req.user.id;

    console.log('========== SELLER ORDERS ==========');
    console.log('Seller ID:', sellerId);

    const orders = await Order.find({
      'items.sellerId': sellerId
    })
      .populate('userId', 'fullName email phone')
      .populate('items.productId', 'name images price description category brand')
      .sort({ createdAt: -1 });

    console.log('Orders found:', orders.length);

    const sellerOrders = orders.map(order => {
      const sellerItems = order.items.filter(item =>
        item.sellerId?.toString() === sellerId.toString()
      );

      const formattedItems = sellerItems.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        variant: item.variant,
        totalPrice: item.price * item.quantity,

        productDetails: item.productId ? {
          _id: item.productId._id,
          name: item.productId.name,
          images: item.productId.images,
          description: item.productId.description,
          category: item.productId.category,
          brand: item.productId.brand
        } : null
      }));

      return {
        _id: order._id,
        orderNumber: order.orderNumber,

        customer: {
          _id: order.userId?._id,
          fullName: order.userId?.fullName || 'Guest',
          email: order.userId?.email || 'N/A',
          phone: order.userId?.phone || order.phone || 'N/A'
        },

        items: formattedItems,
        itemsCount: formattedItems.length,

        subtotal: order.subtotal,
        shippingCharge: order.shippingCharge,
        tax: order.tax,
        totalAmount: order.totalAmount,

        shippingAddress: order.shippingAddress,
        phone: order.phone,

        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,

        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });

    res.json({
      success: true,
      count: sellerOrders.length,
      data: sellerOrders
    });

  } catch (error) {
    console.error('Seller orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/', protect, async (req, res) => {
    try {
        const sellerId = req.user.id;

        console.log('========== SELLER ORDERS ==========');
        console.log('Seller ID:', sellerId);

        // Find orders that contain items from this seller
        const orders = await Order.find({
            'items.sellerId': sellerId
        }).sort({ createdAt: -1 });

        console.log('Orders found:', orders.length);

        // Process each order
        const sellerOrders = [];
        
        for (const order of orders) {
            // Get user details separately (no populate)
            const user = await User.findById(order.userId).select('fullName email phone');
            
            // Filter items for this seller
            const sellerItems = order.items.filter(item => 
                item.sellerId && item.sellerId.toString() === sellerId.toString()
            );
            
            if (sellerItems.length > 0) {
                sellerOrders.push({
                    _id: order._id,
                    orderNumber: order.orderNumber,
                    
                    customer: {
                        _id: user?._id,
                        fullName: user?.fullName || 'Guest',
                        email: user?.email || 'N/A',
                        phone: user?.phone || order.phone || 'N/A'
                    },
                    
                    items: sellerItems.map(item => ({
                        _id: item._id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image,
                        variant: item.variant,
                        totalPrice: (item.price || 0) * (item.quantity || 0)
                    })),
                    
                    itemsCount: sellerItems.length,
                    subtotal: order.subtotal,
                    shippingCharge: order.shippingCharge,
                    tax: order.tax,
                    totalAmount: order.totalAmount,
                    shippingAddress: order.shippingAddress,
                    phone: order.phone,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: order.paymentStatus,
                    orderStatus: order.orderStatus,
                    createdAt: order.createdAt
                });
            }
        }

        res.json({
            success: true,
            count: sellerOrders.length,
            data: sellerOrders
        });

    } catch (error) {
        console.error('Seller orders error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
// Get dashboard stats - FIXED VERSION
router.get('/dashboard-stats', protect, async (req, res) => {
  try {
    // req.user already has the seller data from middleware
    const sellerId = req.user.id;
    
    console.log('Dashboard stats for seller:', sellerId);
    
    // Get products
    const products = await Product.find({ seller: sellerId });
    
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length;
    const avgRating = products.reduce((sum, p) => sum + (p.rating || 0), 0) / totalProducts || 0;
    console.log("totalProducts", totalProducts);
    // Get orders
    const orders = await Order.find({ 
      'items.sellerId': sellerId 
    });
    
    const totalOrders = orders.length;
    let totalRevenue = 0;
    
    orders.forEach(order => {
      const sellerItems = order.items.filter(item => 
        item.sellerId && item.sellerId.toString() === sellerId.toString()
      );
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      totalRevenue += sellerTotal;
    });
    
    // Get unique customers
    const uniqueCustomers = new Set();
    orders.forEach(order => {
      if (order.userId) {
        uniqueCustomers.add(order.userId.toString());
      }
    });
    
    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCustomers: uniqueCustomers.size,
        avgRating: avgRating.toFixed(1),
        lowStock
      }
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get seller products
router.get('/products', protect, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await Product.find({ seller: sellerId });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get sales chart data (units sold over time)
router.get('/sales-chart', protect, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { period = 'monthly' } = req.query;
    
    let startDate;
    let dateRange = [];
    const now = new Date();
    
    // Set up date range based on period
    switch(period) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        
        // Generate last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          dateRange.push({
            key: date.toISOString().split('T')[0],
            label: dayName,
            date: date
          });
        }
        break;
        
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        startDate.setHours(0, 0, 0, 0);
        
        // Generate last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          const year = date.getFullYear();
          dateRange.push({
            key: `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: monthName,
            date: date
          });
        }
        break;
        
      case 'yearly':
        startDate = new Date(now.getFullYear() - 4, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        
        // Generate last 5 years
        for (let i = 4; i >= 0; i--) {
          const year = now.getFullYear() - i;
          dateRange.push({
            key: year.toString(),
            label: year.toString(),
            date: new Date(year, 0, 1)
          });
        }
        break;
        
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        startDate.setHours(0, 0, 0, 0);
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          dateRange.push({
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: monthName,
            date: date
          });
        }
    }
    
    // Get orders within date range
    const orders = await Order.find({
      'items.sellerId': sellerId,
      createdAt: { $gte: startDate },
      orderStatus: { $nin: ['cancelled', 'refunded'] }
    });
    
    // Aggregate sales data
    const salesMap = new Map();
    
    orders.forEach(order => {
      let dateKey;
      if (period === 'weekly') {
        dateKey = order.createdAt.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        dateKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      } else {
        dateKey = order.createdAt.getFullYear().toString();
      }
      
      // Filter items for this seller
      const sellerItems = order.items.filter(item => 
        item.sellerId && item.sellerId.toString() === sellerId.toString()
      );
      
      const totalUnits = sellerItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalRevenue = sellerItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
      if (salesMap.has(dateKey)) {
        const existing = salesMap.get(dateKey);
        existing.sales += totalUnits;
        existing.revenue += totalRevenue;
      } else {
        salesMap.set(dateKey, { sales: totalUnits, revenue: totalRevenue });
      }
    });
    
    // Build response data
    const salesData = dateRange.map(range => ({
      month: range.label,
      sales: salesMap.get(range.key)?.sales || 0,
      revenue: salesMap.get(range.key)?.revenue || 0
    }));
    
    res.json({
      success: true,
      data: salesData,
      period: period
    });
    
  } catch (error) {
    console.error('Sales chart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get revenue chart data
router.get('/revenue-chart', protect, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { period = 'monthly' } = req.query;
    
    let startDate;
    let dateRange = [];
    const now = new Date();
    
    // Set up date range based on period
    switch(period) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          dateRange.push({
            key: date.toISOString().split('T')[0],
            label: dayName,
            date: date
          });
        }
        break;
        
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        startDate.setHours(0, 0, 0, 0);
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          dateRange.push({
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: monthName,
            date: date
          });
        }
        break;
        
      case 'yearly':
        startDate = new Date(now.getFullYear() - 4, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        
        for (let i = 4; i >= 0; i--) {
          const year = now.getFullYear() - i;
          dateRange.push({
            key: year.toString(),
            label: year.toString(),
            date: new Date(year, 0, 1)
          });
        }
        break;
        
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        startDate.setHours(0, 0, 0, 0);
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          dateRange.push({
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: monthName,
            date: date
          });
        }
    }
    
    // Get orders within date range
    const orders = await Order.find({
      'items.sellerId': sellerId,
      createdAt: { $gte: startDate },
      orderStatus: { $nin: ['cancelled', 'refunded'] }
    });
    
    // Aggregate revenue data
    const revenueMap = new Map();
    
    orders.forEach(order => {
      let dateKey;
      if (period === 'weekly') {
        dateKey = order.createdAt.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        dateKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      } else {
        dateKey = order.createdAt.getFullYear().toString();
      }
      
      // Filter items for this seller
      const sellerItems = order.items.filter(item => 
        item.sellerId && item.sellerId.toString() === sellerId.toString()
      );
      
      const sellerRevenue = sellerItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
      if (revenueMap.has(dateKey)) {
        revenueMap.set(dateKey, revenueMap.get(dateKey) + sellerRevenue);
      } else {
        revenueMap.set(dateKey, sellerRevenue);
      }
    });
    
    // Build response data
    const revenueData = dateRange.map(range => ({
      month: range.label,
      revenue: revenueMap.get(range.key) || 0
    }));
    
    res.json({
      success: true,
      data: revenueData,
      period: period
    });
    
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;