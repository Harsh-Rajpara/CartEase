const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper function to calculate cart totals
const calculateCartTotals = (cart) => {
    let subtotal = 0;
    
    // Calculate subtotal from all items
    for (const item of cart.items) {
        subtotal += item.total;
    }
    
    const tax = subtotal * 0.05; // 5% GST
    const shipping = subtotal > 500 ? 0 : 40; // Free shipping above ₹500
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total };
};

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name images price stock brand');
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
      });
    } else {
      // Calculate totals for existing cart
      const { subtotal, tax, shipping, total } = calculateCartTotals(cart);
      cart.subtotal = subtotal;
      cart.tax = tax;
      cart.shipping = shipping;
      cart.total = total;
      await cart.save();
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, selectedVariants } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Convert variants object to string
    let variantString = '';
    if (selectedVariants && Object.keys(selectedVariants).length > 0) {
      variantString = Object.entries(selectedVariants)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    
    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    
    // Calculate item total
    const itemTotal = product.price * quantity;
    
    // Check if item exists with same product and same variant
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.product.toString() === productId && cartItem.variants === variantString
    );
    
    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].total = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: product.price,
        total: itemTotal,
        variants: variantString
      });
    }
    
    // Update cart totals
    cart.subtotal = cart.items.reduce((sum, cartItem) => sum + (cartItem.price * cartItem.quantity), 0);
    cart.tax = cart.subtotal * 0.05;
    cart.shipping = cart.subtotal > 500 ? 0 : 40;
    cart.total = cart.subtotal + cart.tax + cart.shipping;
    
    await cart.save();
    await cart.populate('items.product', 'name images price');
    
    res.json({
      success: true,
      data: cart,
      message: 'Item added to cart successfully'
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Check stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }
    
    // Update quantity and total
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total = cart.items[itemIndex].price * quantity;
    
    // Recalculate all totals
    const { subtotal, tax, shipping, total } = calculateCartTotals(cart);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.shipping = shipping;
    cart.total = total;
    
    await cart.save();
    await cart.populate('items.product', 'name images price stock brand');
    
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );
    
    // Recalculate all totals
    const { subtotal, tax, shipping, total } = calculateCartTotals(cart);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.shipping = shipping;
    cart.total = total;
    
    await cart.save();
    await cart.populate('items.product', 'name images price stock brand');
    
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shipping = 0;
    cart.total = 0;
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,

};