import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  Star,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Loader,
  Check,
  AlertCircle,
  Package,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Settings,
  ChevronRight,
  X,
} from "lucide-react";
import AddressForm from "../components/AddressForm";
import addressService from "../services/address.service";
import api from "../services/api";
import { addToCart, setCart } from "../store/cartSlice";
import ProductCard from "../components/ProductCard";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedVariantPrice, setSelectedVariantPrice] = useState(null);
  const [selectedVariantStock, setSelectedVariantStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("specifications");
  const [showDetails, setShowDetails] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Address related states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [checkingAddress, setCheckingAddress] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchProductDetails();
    fetchProductReviews();
    if (isAuthenticated) {
      fetchUserAddresses();
    }
    window.scrollTo(0, 0);
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (product && product.category) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/products/${id}`);

      if (response.data.success) {
        const productData = response.data.data;

        if (productData.status !== "approved") {
          setError("This product is not available for purchase");
          setProduct(null);
          setLoading(false);
          return;
        }

        setProduct(productData);

        if (productData.variants && productData.variants.length > 0) {
          setVariants(productData.variants);
          const initialSelected = {};
          productData.variants.forEach((variant) => {
            if (variant.options && variant.options.length > 0) {
              initialSelected[variant.variantType] = variant.options[0].value;
            }
          });
          setSelectedVariants(initialSelected);
          updateVariantPriceAndStock(productData, initialSelected);
        } else {
          setSelectedVariantPrice(productData.price);
          setSelectedVariantStock(productData.stock);
        }
      } else {
        setError(response.data.message || "Failed to fetch product details");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(
        error.response?.data?.message || "Failed to load product details.",
      );
      if (error.response?.status === 404) {
        setTimeout(() => navigate("/products"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    if (!product) return;

    setRelatedLoading(true);
    try {
      const response = await api.get("/products", {
        params: {
          category: product.category,
          limit: 10,
          page: 1,
        },
      });

      if (response.data && response.data.success) {
        let products = response.data.data;
        products = products.filter(
          (p) => p._id !== product._id && p.status === "approved",
        );

        if (products.length >= 4) {
          setRelatedProducts(products.slice(0, 4));
        } else if (products.length > 0 && products.length < 4) {
          setRelatedProducts(products);
          fetchRandomProducts(4 - products.length);
        } else {
          fetchRandomProducts(4);
        }
      } else {
        fetchRandomProducts(4);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
      fetchRandomProducts(4);
    } finally {
      setRelatedLoading(false);
    }
  };

  const fetchRandomProducts = async (count) => {
    try {
      const response = await api.get("/products", {
        params: {
          limit: count + 5,
          page: 1,
        },
      });

      if (response.data && response.data.success) {
        let products = response.data.data;
        products = products.filter(
          (p) => p._id !== product._id && p.status === "approved",
        );
        const shuffled = [...products];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const randomProducts = shuffled.slice(0, count);

        setRelatedProducts((prev) => {
          const combined = [...prev, ...randomProducts];
          const unique = combined.filter(
            (v, i, a) => a.findIndex((t) => t._id === v._id) === i,
          );
          return unique.slice(0, 4);
        });
      }
    } catch (error) {
      console.error("Error fetching random products:", error);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      const response = await addressService.getMyAddresses();
      setUserAddresses(response.data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setUserAddresses([]);
    }
  };

  const updateVariantPriceAndStock = (productData, selected) => {
    setSelectedVariantPrice(productData.price);
    setSelectedVariantStock(productData.stock);
  };

  const handleVariantChange = (variantType, value) => {
    const newSelected = { ...selectedVariants, [variantType]: value };
    setSelectedVariants(newSelected);
    updateVariantPriceAndStock(product, newSelected);
  };

  const fetchProductReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews/product/${id}`);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }

    if (!selectedVariantStock || selectedVariantStock === 0) return;

    setAddingToCart(true);

    try {
      await api.post("/cart/add", {
        productId: product._id,
        quantity: quantity,
        selectedVariants: selectedVariants,
      });

      const res = await api.get("/cart");

      const formattedItems = res.data.data.items.map((item) => ({
        id: item._id,
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0]?.url || "",
        selectedVariants: selectedVariants,
      }));

      dispatch(setCart(formattedItems));

      setNotificationMessage("Item added to cart successfully!");
      setShowNotification(true);
    } catch (error) {
      console.error("Cart error:", error);
      setNotificationMessage("Failed to add to cart");
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 3000);
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
  if (!isAuthenticated) {
    navigate("/login", { state: { from: `/product/${id}` } });
    return;
  }

  if (!selectedVariantStock || selectedVariantStock === 0) return;

  const buyNowProduct = {
    productId: product._id,
    name: product.name,
    price: selectedVariantPrice || product.price,
    quantity: quantity,
    image: product.images?.[0]?.url || "/api/placeholder/300/300",
    variant: Object.entries(selectedVariants)
      .map(([type, value]) => `${type}: ${value}`)
      .join(", "),
  };

  navigate("/checkout", {
    state: {
      buyNow: true,
      product: buyNowProduct,
    },
  });
};

  const handleAddressSubmit = async (addressData) => {
    try {
      await addressService.addAddress(addressData);
      setShowAddressForm(false);

      const buyNowProduct = {
        productId: product._id,
        name: product.name,
        price: selectedVariantPrice || product.price,
        quantity: quantity,
        image: product.images?.[0]?.url || "/api/placeholder/300/300",
        variant: Object.entries(selectedVariants)
          .map(([type, value]) => `${type}: ${value}`)
          .join(", "),
      };

      navigate("/checkout", {
        state: {
          buyNow: true,
          product: buyNowProduct,
        },
      });
    } catch (error) {
      console.error("Error saving address:", error);
      setNotificationMessage("Failed to save address. Please try again.");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    setAddedToWishlist(!addedToWishlist);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const hasSpecifications = () => {
    return (
      product?.specifications && Object.keys(product.specifications).length > 0
    );
  };

  const hasVariants = () => {
    return variants && variants.length > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Oops!
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition w-full sm:w-auto"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const averageRating = calculateAverageRating();
  const totalReviews = reviews.length;
  const ratingDistribution = getRatingDistribution();
  const currentStock =
    selectedVariantStock !== null ? selectedVariantStock : product.stock;
  const currentPrice =
    selectedVariantPrice !== null ? selectedVariantPrice : product.price;
  const discount =
    product.originalPrice && product.originalPrice > currentPrice
      ? Math.round(
          ((product.originalPrice - currentPrice) / product.originalPrice) *
            100,
        )
      : 0;

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:min-w-[300px] z-50 animate-slide-in">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm ${
              notificationMessage.includes("success") ||
              notificationMessage.includes("added")
                ? "bg-orange-600"
                : "bg-red-500"
            } text-white`}
          >
            <Check className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{notificationMessage}</span>
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb - Responsive */}
        <nav className="mb-4 sm:mb-6 overflow-x-auto">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm whitespace-nowrap">
            <li>
              <button
                onClick={() => navigate("/")}
                className="text-gray-500 hover:text-orange-600 transition"
              >
                Home
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <button
                onClick={() => navigate("/products")}
                className="text-gray-500 hover:text-orange-600 transition"
              >
                Products
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-800 font-semibold truncate max-w-[150px] sm:max-w-xs">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Main Section - Responsive Grid */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
            {/* Left - Image Gallery - Mobile Optimized */}
            <div>
              <div
                className=" rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setShowImageModal(true)}
              >
                <img
                  src={
                    product.images?.[activeImage]?.url ||
                    product.images?.[activeImage] ||
                    "https://via.placeholder.com/500"
                  }
                  alt={product.name}
                  className="w-full h-64 sm:h-80 lg:h-96 object-contain"
                />
              </div>

              {/* Thumbnails - Horizontal Scroll on Mobile */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 mt-3 sm:mt-4 overflow-x-auto pb-2 scrollbar-thin">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition ${
                        activeImage === index
                          ? "border-orange-600"
                          : "border-gray-200 hover:border-orange-400"
                      }`}
                    >
                      <img
                        src={typeof img === "string" ? img : img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Delivery Info Card - Responsive Grid */}
              <div className="mt-4 sm:mt-6 bg-gray-50 rounded-xl p-3 sm:p-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div>
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-orange-600" />
                    <p className="text-xs font-medium">Free Delivery</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Above ₹499
                    </p>
                  </div>
                  <div>
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-orange-600" />
                    <p className="text-xs font-medium">Warranty</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Brand warranty
                    </p>
                  </div>
                  <div>
                    <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-orange-600" />
                    <p className="text-xs font-medium">Returns</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Easy returns
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Product Info - Responsive Typography */}
            <div className="space-y-4 sm:space-y-5">
              <div>
                {product.brand && (
                  <p className="text-orange-600 text-xs sm:text-sm font-semibold mb-1">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {totalReviews > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-900">
                        {averageRating}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${
                              i < Math.floor(averageRating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {totalReviews} reviews
                    </span>
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="border-t border-gray-100 pt-3 sm:pt-4">
                <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    ₹{currentPrice?.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-xs sm:text-sm text-gray-400 line-through">
                        ₹{product.originalPrice?.toLocaleString()}
                      </span>
                      <span className="bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-green-600 mt-1">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Variants - Responsive */}
              {hasVariants() && (
                <div className="space-y-3">
                  {variants.map((variant) => (
                    <div key={variant._id}>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-2">
                        {variant.variantType}:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((option) => (
                          <button
                            key={option._id}
                            onClick={() =>
                              handleVariantChange(
                                variant.variantType,
                                option.value,
                              )
                            }
                            disabled={option.stock === 0}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border transition ${
                              selectedVariants[variant.variantType] ===
                              option.value
                                ? "border-orange-600 bg-orange-50 text-orange-700"
                                : option.stock === 0
                                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                  : "border-gray-300 hover:border-orange-400 text-gray-700"
                            }`}
                          >
                            {option.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Section - Responsive */}
              {currentStock > 0 && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-2">
                    Quantity:
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center border rounded-lg w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-50 transition rounded-l-lg"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <span className="w-12 text-center font-medium text-sm sm:text-base">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(currentStock, quantity + 1))
                        }
                        className="px-3 py-2 hover:bg-gray-50 transition rounded-r-lg"
                        disabled={quantity >= currentStock}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm sm:text-base font-semibold text-gray-900">
                        Total: ₹{(currentPrice * quantity).toLocaleString()}
                      </span>
                      {/* <span className="text-[10px] sm:text-xs text-gray-500">
                        {currentStock} items left in stock
                      </span> */}
                    </div>
                  </div>
                </div>
              )}

              {currentStock === 0 && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-red-600 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Out of Stock
                  </p>
                </div>
              )}

              {/* Action Buttons - Responsive (Stack on mobile) */}
              {currentStock > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 text-sm sm:text-base"
                  >
                    {addingToCart ? (
                      <Loader className="animate-spin h-5 w-5 mx-auto" />
                    ) : (
                      "Add to Cart"
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    // disabled={checkingAddress}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
                  >
                   
                      "Buy Now"
                   
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-2 mt-2  text-xs text-gray-500">
                <span className="flex items-center gap-1 justify-center sm:justify-start">
                  <Clock className="h-3 w-3" /> Delivery in 2-3 days
                </span>
              </div>

              {/* All Details Section */}
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-8">
                              <div className="border-b px-6 py-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                      All details
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Specifications, description and more
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                                  >
                                    <ChevronDown
                                      className={`h-5 w-5 transition-transform ${
                                        showDetails ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
              
                              <div
                                className={`transition-all duration-300 overflow-hidden ${
                                  showDetails ? "max-h-[2000px]" : "max-h-0"
                                }`}
                              >
                                <div className="flex gap-3 px-6 pt-4">
                                  <button
                                    onClick={() => setActiveInfoTab("specifications")}
                                    className={`px-4 py-2 text-sm rounded-lg border transition ${
                                      activeInfoTab === "specifications"
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                  >
                                    Specifications
                                  </button>
                                  <button
                                    onClick={() => setActiveInfoTab("description")}
                                    className={`px-4 py-2 text-sm rounded-lg border transition ${
                                      activeInfoTab === "description"
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                  >
                                    Description
                                  </button>
                                </div>
              
                                <div className="p-6">
                                  {activeInfoTab === "specifications" && (
                                    <div>
                                      {hasSpecifications() ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          {Object.entries(product.specifications).map(
                                            ([key, value]) => (
                                              <div
                                                key={key}
                                                className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-all duration-200"
                                              >
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                                  {key}
                                                </p>
                                                <p className="text-base font-semibold text-gray-900">
                                                  {value || "NA"}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                          <p className="text-gray-500">
                                            No specifications available
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
              
                                  {activeInfoTab === "description" && (
                                    <div className="text-sm text-gray-700 leading-relaxed">
                                      {product.description ? (
                                        <p>{product.description}</p>
                                      ) : (
                                        <div className="text-center py-8">
                                          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                          <p className="text-gray-500">
                                            No description available
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
            </div>
          </div>
        </div>

        {/* Related Products Section - Responsive Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Related Products
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  You might also like these products
                </p>
              </div>
              <Link
                to={`/products?category=${product.category}`}
                className="text-orange-600 hover:text-orange-700 flex items-center gap-1 text-xs sm:text-sm font-medium group"
              >
                View All
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {relatedLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-lg h-60 sm:h-80 animate-pulse"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal for Mobile */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={
                product.images?.[activeImage]?.url ||
                product.images?.[activeImage] ||
                "https://via.placeholder.com/500"
              }
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain"
            />
            {/* Thumbnails in modal */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage(index);
                    }}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 ${
                      activeImage === index
                        ? "border-orange-500"
                        : "border-white/50"
                    }`}
                  >
                    <img
                      src={typeof img === "string" ? img : img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

     

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
