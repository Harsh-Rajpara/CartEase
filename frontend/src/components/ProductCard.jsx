// components/ProductCard.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  // Get the correct image URL from the images array
  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      if (firstImage.url) {
        return firstImage.url;
      }
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  // Calculate discount
  const discount = product.discount || 
    (product.originalPrice && product.originalPrice > product.price 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
      : 0);

  const imageUrl = getImageUrl();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to cart logic
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Wishlist logic
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const getStockStatus = () => {
    const stock = product.stock || product.inventory || 0;
    if (stock === 0) {
      return { text: 'Out of Stock', className: 'text-red-600' };
    }
    if (stock < 10) {
      return { text: `Only ${stock} left!`, className: 'text-orange-600' };
    }
    return null;
  };

  const stockStatus = getStockStatus();

  return (
    <div 
      className="bg-white rounded-lg shadow hover:shadow-lg transition duration-300 group cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative">
        <img
          src={imageError ? 'https://via.placeholder.com/300x200?text=No+Image' : imageUrl}
          alt={product.name}
          className="w-full h-32 sm:h-48 object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded z-10">
            {discount}% OFF
          </span>
        )}
        
       
        
        {product.stock === 0 && (
          <span className="absolute bottom-2 left-2 bg-gray-800 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded z-10">
            Out of Stock
          </span>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-2 sm:p-4">
        {/* Brand/Category */}
        {product.brand && (
          <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 line-clamp-1">
            {product.brand}
          </p>
        )}
        
        {/* Product Name */}
        <h3 className="font-semibold text-xs sm:text-base text-gray-800 mb-0.5 sm:mb-1 line-clamp-2 hover:text-orange-600 transition">
          {product.name}
        </h3>
        
       
        
        {/* Price */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <span className="text-sm sm:text-xl font-bold text-gray-900">
            ₹{(product.price || 0).toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[10px] sm:text-sm text-gray-400 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
{/* FREE Delivery with 3-day gap */}
{/* <div className="mt-1 sm:mt-2">
  <p className="text-[10px] sm:text-xs text-gray-900">
    FREE Delivery{' '}
    <span className="font-bold text-gray-800">
      {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })}
    </span>
  </p>
</div> */}

        {/* Stock Status - Mobile only */}
        {stockStatus && (
          <p className={`text-[10px] mt-0.5 sm:hidden ${stockStatus.className}`}>
            {stockStatus.text}
          </p>
        )}
        
        
      </div>
      
      
      
      
    </div>
  );
};

export default ProductCard;