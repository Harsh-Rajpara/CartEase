import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, X, Loader, SlidersHorizontal, ChevronUp } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [visibleCount, setVisibleCount] = useState(16);
  const [showFilters, setShowFilters] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  
  // Separate state for price range inputs
  const [tempMinPrice, setTempMinPrice] = useState(searchParams.get('minPrice') || '');
  const [tempMaxPrice, setTempMaxPrice] = useState(searchParams.get('maxPrice') || '');
  
  // Get search from URL (supports both 'search' and 'q')
  const urlSearchQuery = searchParams.get('search') || searchParams.get('q') || '';
  
  // Multiple categories as array
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const categoriesParam = searchParams.get('categories');
    return categoriesParam ? categoriesParam.split(',') : [];
  });
  
  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    search: urlSearchQuery
  });

  // Configure axios to send cookies
  axios.defaults.withCredentials = true;

  // Sync filters with URL changes
  useEffect(() => {
    const newSearchQuery = searchParams.get('search') || searchParams.get('q') || '';
    setFilters(prev => ({
      ...prev,
      search: newSearchQuery,
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'newest'
    }));
  }, [searchParams]);

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setVisibleCount(16);
    setHasMore(true);
    fetchProducts(true);
  }, [selectedCategories, filters.minPrice, filters.maxPrice, filters.sort, filters.search]);

  const fetchCategories = async () => {
    try {
      setCategoryError('');
      const response = await axios.get(`${API_URL}/categories`);
      
      let categoriesData = [];
      if (response.data.success) {
        categoriesData = response.data.data || [];
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data.categories) {
        categoriesData = response.data.categories;
      } else {
        categoriesData = [];
      }
      
      // Sort categories by productCount (highest first) and take top 20
      const sortedCategories = categoriesData
        .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
        .slice(0, 20);
      
      setCategories(sortedCategories);
    } catch (error) {
      // Silent fail - no console
      setCategoryError(error.response?.data?.message || error.message || 'Could not connect to server');
    }
  };

  const fetchProducts = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setProducts([]);
      } else {
        setLoadingMore(true);
      }
      setError('');

      const params = new URLSearchParams();
      
      // Multiple categories support
      if (selectedCategories.length > 0) {
        params.append('categories', selectedCategories.join(','));
      }
      
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      
      // Send search term to backend
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      
      params.append('limit', '100');
      
      // Sort options
      let sortValue = '';
      switch (filters.sort) {
        case 'price-low':
          sortValue = 'price-low';
          break;
        case 'price-high':
          sortValue = 'price-high';
          break;
        case 'rating':
          sortValue = 'rating';
          break;
        case 'newest':
        default:
          sortValue = 'newest';
          break;
      }
      params.append('sort', sortValue);

      const response = await axios.get(`${API_URL}/products?${params.toString()}`);
      
      if (response.data.success) {
        let allProducts = response.data.data;
        setTotalProducts(response.data.pagination?.total || allProducts.length);
        
        if (reset) {
          setProducts(allProducts);
        } else {
          setProducts(prev => [...prev, ...allProducts]);
        }
        
        const currentPage = response.data.pagination?.page || 1;
        const totalPages = response.data.pagination?.totalPages || 1;
        setHasMore(currentPage < totalPages);
        
      } else {
        setError(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      // Silent fail - no console
      setError(error.response?.data?.message || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSortChange = (value) => {
    setFilters(prev => ({ ...prev, sort: value }));
    searchParams.set('sort', value);
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (categoryName, isChecked) => {
    let newCategories;
    if (isChecked) {
      newCategories = [...selectedCategories, categoryName];
    } else {
      newCategories = selectedCategories.filter(c => c !== categoryName);
    }
    
    setSelectedCategories(newCategories);
    
    // Update URL params
    if (newCategories.length > 0) {
      searchParams.set('categories', newCategories.join(','));
    } else {
      searchParams.delete('categories');
    }
    setSearchParams(searchParams);
  };

  const applyPriceRange = () => {
    setFilters(prev => ({ 
      ...prev, 
      minPrice: tempMinPrice,
      maxPrice: tempMaxPrice 
    }));
    
    if (tempMinPrice) {
      searchParams.set('minPrice', tempMinPrice);
    } else {
      searchParams.delete('minPrice');
    }
    
    if (tempMaxPrice) {
      searchParams.set('maxPrice', tempMaxPrice);
    } else {
      searchParams.delete('maxPrice');
    }
    setSearchParams(searchParams);
  };

  const clearPriceRange = () => {
    setTempMinPrice('');
    setTempMaxPrice('');
    setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }));
    searchParams.delete('minPrice');
    searchParams.delete('maxPrice');
    setSearchParams(searchParams);
  };

  // FIXED: Clear all filters including search
  const clearFilters = () => {
    setSelectedCategories([]);
    setFilters({
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      search: ''  // Clear search
    });
    setTempMinPrice('');
    setTempMaxPrice('');
    
    // Clear ALL search params - create completely new empty URLSearchParams
    const newParams = new URLSearchParams();
    // Optionally preserve sort as 'newest'
    // newParams.set('sort', 'newest');
    setSearchParams(newParams);
  };

  // FIXED: Remove category filter and update URL properly
  const removeCategoryFilter = (category) => {
    const newCategories = selectedCategories.filter(c => c !== category);
    setSelectedCategories(newCategories);
    
    if (newCategories.length > 0) {
      searchParams.set('categories', newCategories.join(','));
    } else {
      searchParams.delete('categories');
    }
    setSearchParams(searchParams);
  };

  // FIXED: Clear search only
  const clearSearchFilter = () => {
    setFilters(prev => ({ ...prev, search: '' }));
    searchParams.delete('search');
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  const loadMoreProducts = () => {
    const newCount = visibleCount + 16;
    setVisibleCount(newCount);
    if (newCount >= products.length) {
      setHasMore(false);
    }
  };

  const getVisibleProducts = () => {
    return products.slice(0, visibleCount);
  };

  if (loading && products.length === 0) {
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

  const visibleProducts = getVisibleProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Products</h1>
            {filters.search && (
              <div className="mt-2">
                <p className="text-gray-600">
                  Search results for: <span className="font-medium text-orange-600">"{filters.search}"</span>
                </p>
              </div>
            )}
            {selectedCategories.length > 0 && (
              <p className="text-gray-600 mt-1">
                Categories: <span className="font-medium text-orange-600">{selectedCategories.length} selected</span>
              </p>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-orange-300 transition-colors"
          >
            <Filter className="h-5 w-5 text-orange-600" />
            <span className="text-gray-700">Filters</span>
          </button>
        </div>

        {/* Category Error Message */}
        {categoryError && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ Categories: {categoryError}
            </p>
            <button
              onClick={fetchCategories}
              className="mt-1 text-xs text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Retry loading categories
            </button>
          </div>
        )}

        {/* Product Error Message */}
        {error && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800">{error}</p>
            <button
              onClick={() => fetchProducts(true)}
              className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>
                <button 
                  onClick={clearFilters} 
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Active Filters Section */}
              {(selectedCategories.length > 0 || filters.minPrice || filters.maxPrice || filters.search) && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 text-base">Active Filters</h3>
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center">
                        Search: {filters.search}
                        <button onClick={clearSearchFilter} className="ml-1 hover:text-orange-900">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedCategories.map(category => (
                      <span key={category} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center">
                        {category}
                        <button onClick={() => removeCategoryFilter(category)} className="ml-1 hover:text-orange-900">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {(filters.minPrice || filters.maxPrice) && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center">
                        ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                        <button onClick={clearPriceRange} className="ml-1 hover:text-orange-900">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Sort Section */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-base">Sort By</h3>
                <select
                  value={filters.sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white text-sm cursor-pointer hover:border-orange-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* Categories - Expandable with Multi-select */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <button
                  onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                  className="flex justify-between items-center w-full group"
                >
                  <h3 className="font-semibold text-gray-900 text-base">
                    Categories 
                    {selectedCategories.length > 0 && (
                      <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        {selectedCategories.length}
                      </span>
                    )}
                  </h3>
                  {isCategoryExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  )}
                </button>
                
                {isCategoryExpanded && (
                  <div className="mt-3">
                    {categories.length === 0 && !categoryError ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader className="animate-spin h-5 w-5 text-orange-600" />
                        <span className="ml-2 text-sm text-gray-500">Loading categories...</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {categories.map(cat => (
                          <label key={cat._id} className="flex items-center cursor-pointer group hover:bg-orange-50 p-2 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat.name)}
                              onChange={(e) => handleCategoryChange(cat.name, e.target.checked)}
                              className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700 flex-1 group-hover:text-orange-600 transition-colors">
                              {cat.name}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">({cat.productCount || 0})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Range with Apply Button */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-base">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Min Price (₹)</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={tempMinPrice}
                      onChange={(e) => setTempMinPrice(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && applyPriceRange()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max Price (₹)</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={tempMaxPrice}
                      onChange={(e) => setTempMaxPrice(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && applyPriceRange()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={applyPriceRange}
                      className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-all duration-200 text-sm"
                    >
                      Apply
                    </button>
                    {(filters.minPrice || filters.maxPrice) && (
                      <button
                        onClick={clearPriceRange}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 text-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {visibleProducts.length === 0 && !loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <p className="text-gray-500 mb-4">No products found</p>
                <button
                  onClick={clearFilters}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {visibleProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {loadingMore && (
                  <div className="flex justify-center mt-8">
                    <Loader className="animate-spin h-8 w-8 text-orange-600" />
                  </div>
                )}

                {hasMore && visibleProducts.length < products.length && !loadingMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={loadMoreProducts}
                      className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      View More Products
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;