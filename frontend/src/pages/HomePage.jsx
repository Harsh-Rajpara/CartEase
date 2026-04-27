import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Star, Truck, Shield, Headphones, ChevronRight, IndianRupee } from 'lucide-react';
import SkeletonLoader from '../SkeletonLoader';
import api from '../services/api';
import Footer from '../components/Footer';
import axios from 'axios';

// Category data with relevant images for each category
const categories = [
  { 
    name: 'Menswear', 
    image: 'images/men_wear.png',
    path: '/products',
    categoryParam: 'Menswear'
  },
  { 
    name: 'Womenswear', 
    image: 'images/women_wear.png',
    path: '/products',
    categoryParam: 'Womenwear'
  },
  { 
    name: 'Beauty', 
    image: 'images/beauty.png',
    path: '/products',
    categoryParam: 'Beauty'
  },
  { 
    name: 'Footwear', 
    image: 'images/footwear.png',
    path: '/products',
    categoryParam: 'Footwear'
  },
  { 
    name: 'Bags', 
    image: 'images/bag.png',
    path: '/products',
    categoryParam: 'Bags'
  },
  { 
    name: 'Watches', 
    image: 'images/watch.png',
    path: '/products',
    categoryParam: 'Watches'
  },
  { 
    name: 'Smartphones', 
    image: 'images/smartphone.png',
    path: '/products',
    categoryParam: 'Smartphones'
  },
  { 
    name: 'Electronics', 
    image: 'images/electronic.png',
    path: '/products',
    categoryParam: 'Electronics'
  },
];

// Brand data
const brands = [
  { 
    bgColor: 'bg-gray-100',
    image: '/images/puma.png',
    path: '/products',
    brandParam: 'puma'
  },
  { 
    bgColor: 'bg-purple-50',
    image: '/images/mamaearth.png',
    path: '/products',
    brandParam: 'mamaearth'
  },
  { 
    bgColor: 'bg-gray-100',
    image: 'images/titan.png',
    path: '/products',
    brandParam: 'titan'
  },
  { 
    bgColor: 'bg-purple-50',
    image: '/images/mi.png',
    path: '/products',
    brandParam: 'mi'
  },
  { 
    bgColor: 'bg-gray-100',
    image: '/images/gucci.png',
    path: '/products',
    brandParam: 'gucci'
  },
  { 
    bgColor: 'bg-purple-50',
    image: '/images/sony.png',
    path: '/products',
    brandParam: 'sony'
  },
];

// Triple the brands for seamless infinite scroll
const tripleBrands = [...brands, ...brands, ...brands];

// DealOfTheDay Component
const DealOfTheDay = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset to 12 hours when timer reaches zero
              hours = 12;
              minutes = 0;
              seconds = 0;
            }
          }
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format numbers with leading zeros
  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div className="relative text-white overflow-hidden">
      {/* Mobile Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat block sm:hidden"
        style={{ 
          backgroundImage: "url('/images/bg-offer-sm.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Desktop Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden sm:block"
        style={{ 
          backgroundImage: "url('/images/bg-offer.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-700/5 to-orange-500/70 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col items-center md:items-end justify-center text-center md:text-right">
          <div className="max-w-2xl md:mr-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-lg">
              Deal of the Day
            </h2>
            <p className="text-sm sm:text-base md:text-lg mb-4 drop-shadow-md text-gray-100">
              Limited time offer! Get up to 70% off on ethnic wear
            </p>
            <div className="flex justify-center md:justify-end">
              <div className="bg-white text-orange-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-lg flex items-center gap-2">
                <span className="font-mono tracking-wide">
                  {formatNumber(timeLeft.hours)}h : {formatNumber(timeLeft.minutes)}m : {formatNumber(timeLeft.seconds)}s
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/products"
            className="bg-white text-orange-600 px-6 sm:px-9 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center shadow-lg mt-4"
          >
            View Deals 
          </Link>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Brand carousel refs and state
  const brandCarouselRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-scroll animation
  useEffect(() => {
    let animationFrame;
    const speed = 1.7;

    const scroll = () => {
      const el = brandCarouselRef.current;

      if (el && !isHovering) {
        el.scrollLeft += speed;
        const singleWidth = el.scrollWidth / 3;
        if (el.scrollLeft >= singleWidth) {
          el.scrollLeft -= singleWidth;
        }
      }

      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [isHovering]);

  useEffect(() => {
    if (brandCarouselRef.current && !loading) {
      brandCarouselRef.current.scrollLeft = 50;
    }
  }, [loading]);

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("https://cartease-backend-rdw1.onrender.com/api/products",{
        params : {limit:50,page:1}
      })
      // const response = await api.get('api/products', {
      //   params: { limit: 50, page: 1 }
      // });
      
      if (response.data?.success && response.data.data) {
        const allProducts = response.data.data;
        
        if (allProducts.length > 0) {
          // Shuffle products for random display
          const shuffled = [...allProducts];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          
          const displayProducts = shuffled.slice(0, 12);
          
          setFeaturedProducts(displayProducts.slice(0, 4));
          setTopRated(displayProducts.slice(4, 8));
          setNewArrivals(displayProducts.slice(8, 12));
        } else {
          setFeaturedProducts([]);
          setTopRated([]);
          setNewArrivals([]);
        }
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCategoryClick = (categoryParam) => {
    sessionStorage.setItem('selectedCategory', categoryParam);
  };

  const handleBrandClick = (brandParam) => {
    sessionStorage.setItem('searchQuery', brandParam);
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section - Different images for mobile and desktop using Tailwind responsive classes */}
      <div className="relative text-white">
        {/* Mobile Background Image (shows on small screens) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat block sm:hidden"
          style={{ 
            backgroundImage: "url('/images/hero_bg_sm.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Desktop Background Image (shows on medium screens and above) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden sm:block"
          style={{ 
            backgroundImage: "url('/images/hero-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'top',
          }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-16 sm:py-20 md:py-28">
          <div className="max-w-2xl text-left">
            <div className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
              Summer Sale is Live!
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Welcome to CartEase
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 text-gray-200">
              Discover the latest trends in fashion and lifestyle with exclusive discounts up to 70% off
            </p>
            <Link
              to="/products"
              className="inline-block bg-orange-500 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section - Font decreases only below 640px */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-4">
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Truck className="h-8 w-8 text-orange-500 max-sm:h-8 max-sm:w-8" />
            <div>
              <h3 className="font-semibold text-gray-800 max-sm:text-sm">Free Shipping</h3>
              <p className="text-gray-600 max-sm:text-[10px] sm:text-xs">On orders above ₹499</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Shield className="h-8 w-8 text-orange-500 max-sm:h-8 max-sm:w-8" />
            <div>
              <h3 className="font-semibold text-gray-800 max-sm:text-sm">Secure Payment</h3>
              <p className="text-gray-600 max-sm:text-[10px] sm:text-xs">100% secure transactions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Headphones className="h-8 w-8 text-orange-500 max-sm:h-8 max-sm:w-8" />
            <div>
              <h3 className="font-semibold text-gray-800 max-sm:text-sm">24/7 Support</h3>
              <p className="text-gray-600 max-sm:text-[10px] sm:text-xs">Round the clock assistance</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <IndianRupee className="h-8 w-8 text-orange-500 max-sm:h-8 max-sm:w-8" />
            <div>
              <h3 className="font-semibold text-gray-800 max-sm:text-sm">Best Prices</h3>
              <p className="text-gray-600 max-sm:text-[10px] sm:text-xs">Price match guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 pb-8 sm:pb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={{
                pathname: category.path,
                search: `?categories=${category.categoryParam}`
              }}
              onClick={() => handleCategoryClick(category.categoryParam)}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-orange-50 to-white pt-4">
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150/cccccc/ffffff?text=Category';
                    }}
                  />
                </div>
                <div className="p-2 sm:p-3 text-center bg-white">
                  <h3 className="font-medium text-gray-800 text-xs sm:text-sm group-hover:text-orange-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Deal of the Day */}
      <DealOfTheDay />

      {/* Brands Carousel Section */}
      <div className="w-full bg-gray-800 py-8 sm:py-10 mt-10 sm:mt-14 mb-6 sm:mb-8 overflow-hidden border-y border-gray-700">
        <div className="w-full">
          <div className="relative w-full">
            <div
              ref={brandCarouselRef}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="flex items-center space-x-6 sm:space-x-10 overflow-x-auto scrollbar-hide py-8 px-8"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none', 
                cursor: 'grab',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {tripleBrands.map((brand, index) => (
                <Link
                  key={index}
                  to={{
                    pathname: brand.path,
                    search: `?search=${brand.brandParam}`
                  }}
                  onClick={() => handleBrandClick(brand.brandParam)}
                  className="flex-shrink-0 w-32 sm:w-40 h-24 sm:h-28 bg-gray-700 rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all duration-300 border border-gray-600 overflow-hidden group transform hover:-translate-y-1 hover:border-orange-500 hover:shadow-lg"
                >
                  <div className={`w-full h-full ${brand.bgColor} flex items-center justify-center p-3`}>
                    <img 
                      src={brand.image} 
                      alt={`Brand ${index + 1}`}
                      className="w-full h-full object-contain transition-all duration-300 group-hover:scale-110 brightness-90 group-hover:brightness-100"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150/cccccc/ffffff?text=Logo';
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products for You */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Products for You</h2>
          <Link to="/products" className="text-orange-600 hover:text-orange-700 flex items-center text-sm font-medium group">
            View All 
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">⚠️ {error}</div>
            <button 
              onClick={fetchProducts}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (featuredProducts.length > 0 || topRated.length > 0 || newArrivals.length > 0) ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
              {topRated.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
              {newArrivals.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <Footer />

      {/* Custom scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default HomePage;