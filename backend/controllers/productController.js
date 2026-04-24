const Product = require("../models/Product");
const Seller = require("../models/Seller");
const Category = require("../models/Category");

// @desc    Get all products (public)
// @route   GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const {
      categories,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    let filter = { status: 'approved' };

    if (categories) {
      const categoryArray = categories.split(',');
      filter.category = { $in: categoryArray };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { category: searchRegex }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case "price-low":
        sortOption = { price: 1 };
        break;
      case "price-high":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { averageRating: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const limitNum = Number(limit);

    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(limitNum)
      .skip(skip);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    
    // ✅ Only return product if it's approved (for public access)
    // For admin/seller, they can see all products
    if (product.status !== 'approved') {
      return res.status(403).json({ 
        success: false, 
        message: "Product is not available for purchase" 
      });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new product with Cloudinary
const addProduct = async (req, res) => {
  try {
    console.log("User ID from token:", req.user.id);

    const seller = await Seller.findById(req.user.id);

    if (!seller) {
      return res.status(403).json({
        success: false,
        message: "Seller account not found",
      });
    }

    console.log("Seller found:", seller._id);

    const categoryName = req.body.category;
    console.log("🏷️ Requested category:", categoryName);

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName}$`, "i") },
      isDeleted: false,
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Category "${categoryName}" does not exist`,
      });
    }

    console.log("✅ Category found:", category.name, "ID:", category._id);

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    } else {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    let specifications = {};
    if (req.body.specifications) {
      try {
        specifications = JSON.parse(req.body.specifications);
        if (typeof specifications !== 'object' || Array.isArray(specifications)) {
          specifications = {};
        }
      } catch (error) {
        console.error("Error parsing specifications:", error);
        specifications = {};
      }
    }

    let variants = [];
    if (req.body.variants) {
      try {
        const parsedVariants = JSON.parse(req.body.variants);
        
        if (Array.isArray(parsedVariants)) {
          variants = parsedVariants
            .filter(v => v.variantType && v.variantType.trim() !== "")
            .map((v) => ({
              variantType: v.variantType.trim(),
              options: (v.options || [])
                .filter(opt => opt.value && opt.value.trim() !== "")
                .map((opt) => ({
                  value: opt.value.trim(),
                  stock: Number(opt.stock) || 0,
                })),
            }))
            .filter(v => v.options.length > 0);
        }
        
        console.log("Processed variants:", JSON.stringify(variants, null, 2));
      } catch (error) {
        console.error("Error parsing variants:", error);
        variants = [];
      }
    }

    const requiredFields = ['name', 'brand', 'description', 'price', 'stock', 'originalPrice'];
    for (const field of requiredFields) {
      if (!req.body[field] && req.body[field] !== 0) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    const price = Number(req.body.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
    }

    const originalPrice = Number(req.body.originalPrice);
    if (isNaN(originalPrice) || originalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Original price must be a positive number",
      });
    }

    if (originalPrice < price) {
      return res.status(400).json({
        success: false,
        message: "Original price must be greater than or equal to selling price",
      });
    }

    const stock = Number(req.body.stock);
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number",
      });
    }

    let discount = 0;
    if (originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    if (req.body.name.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Product name must be at least 3 characters long",
      });
    }

    if (req.body.brand.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Brand name must be at least 2 characters long",
      });
    }

    const product = await Product.create({
      name: req.body.name.trim(),
      brand: req.body.brand.trim(),
      category: req.body.category,
      description: req.body.description.trim(),
      price: price,
      originalPrice: originalPrice,
      discount: discount,
      stock: stock,
      images: images,
      specifications: specifications,
      variants: variants,
      seller: seller._id,
      isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : true,
      status: 'pending'
    });

    console.log("Product created successfully:", product._id);

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });

  } catch (error) {
    console.error("Add product error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A product with this name already exists",
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while adding the product",
    });
  }
};

// @desc    Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const seller = await Seller.findById(req.user.id);
    if (product.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const cloudinary = require("cloudinary").v2;
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get seller products
const getSellerProducts = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id);
    if (!seller) {
      return res.status(403).json({ success: false, message: "Seller account not found" });
    }

    const products = await Product.find({ seller: seller._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product stock (no approval needed)
const updateProductStock = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { productId } = req.params;
        const { stock } = req.body;
        
        if (stock === undefined || stock === null) {
            return res.status(400).json({ 
                success: false, 
                message: 'Stock value is required' 
            });
        }
        
        if (stock < 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Stock cannot be negative' 
            });
        }
        
        const product = await Product.findOne({ 
            _id: productId, 
            seller: sellerId 
        });
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        
        product.stock = Number(stock);
        await product.save();
        
        res.json({ 
            success: true, 
            message: 'Stock updated successfully', 
            data: product 
        });
        
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// backend/controllers/productController.js

const updateProduct = async (req, res) => {
    try {
        console.log("=== UPDATE PRODUCT CALLED ===");
        console.log("Product ID:", req.params.id);
        console.log("User ID:", req.user.id);
        console.log("Request body:", req.body);
        console.log("Files:", req.files);
        
        const sellerId = req.user.id;
        const { id } = req.params;
        
        // Find product belonging to this seller
        const product = await Product.findOne({ 
            _id: id, 
            seller: sellerId 
        });
        
        if (!product) {
            console.log("Product not found");
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        
        console.log("Product found:", product.name);
        
        // ✅ Parse form data properly (since we're using FormData)
        const name = req.body.name;
        const brand = req.body.brand;
        const category = req.body.category;
        const description = req.body.description;
        const price = Number(req.body.price);
        const originalPrice = Number(req.body.originalPrice);
        const stock = Number(req.body.stock);
        
        console.log("Parsed values:", { name, brand, category, price, originalPrice, stock });
        
        // Update basic fields
        if (name) product.name = name;
        if (brand) product.brand = brand;
        if (category) product.category = category;
        if (description) product.description = description;
        if (!isNaN(price) && price > 0) product.price = price;
        if (!isNaN(originalPrice) && originalPrice > 0) product.originalPrice = originalPrice;
        if (!isNaN(stock) && stock >= 0) product.stock = stock;
        
        // Handle specifications
        if (req.body.specifications) {
            try {
                const specifications = JSON.parse(req.body.specifications);
                product.specifications = specifications;
                console.log("Specifications updated:", specifications);
            } catch (e) {
                console.error("Error parsing specifications:", e);
            }
        }
        
        // Handle variants
        if (req.body.variants) {
            try {
                const variants = JSON.parse(req.body.variants);
                product.variants = variants;
                console.log("Variants updated:", variants);
            } catch (e) {
                console.error("Error parsing variants:", e);
            }
        }
        
        // Handle images
        let existingImages = [];
        if (req.body.existingImages) {
            try {
                existingImages = JSON.parse(req.body.existingImages);
                console.log("Existing images to keep:", existingImages);
            } catch (e) {
                console.error("Error parsing existing images:", e);
            }
        }
        
        // Handle new uploaded images
        let newImages = [];
        if (req.files && req.files.length > 0) {
            newImages = req.files.map((file) => ({
                url: file.path,
                publicId: file.filename,
            }));
            console.log("New images added:", newImages.length);
        }
        
        // Combine existing and new images
        const allImages = [...existingImages.map(img => 
            typeof img === 'string' ? { url: img, publicId: null } : img
        ), ...newImages];
        
        if (allImages.length > 0) {
            product.images = allImages;
        }
        
        // Calculate discount
        if (product.originalPrice > product.price) {
            product.discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        } else {
            product.discount = 0;
        }
        
        // Set approval status to pending for re-approval
        product.status  = 'pending';
        
        await product.save();
        
        console.log("Product updated successfully:", product._id);
        
        res.json({ 
            success: true, 
            message: 'Product update submitted for admin approval', 
            data: product 
        });
        
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get product count by category
const getProductCountByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { status: 'approved'  };
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const count = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: count,
      category: category || 'all'
    });
  } catch (error) {
    console.error('Get product count error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    deleteProduct,
    getSellerProducts,
    getProductCountByCategory,
    updateProductStock,
    updateProduct
};