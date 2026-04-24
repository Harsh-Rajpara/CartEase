// frontend/src/components/SkeletonLoader.jsx
import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <div className="relative bg-gray-800 overflow-hidden" style={{ minHeight: '400px' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 animate-pulse"></div>
        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-16 sm:py-20 md:py-28">
          <div className="max-w-2xl text-left">
            <div className="h-6 w-32 bg-white/30 rounded-full mb-4 animate-pulse"></div>
            <div className="h-10 sm:h-12 md:h-14 lg:h-16 w-48 sm:w-64 md:w-80 bg-white/30 rounded-lg mb-4 animate-pulse"></div>
            <div className="h-5 w-full max-w-md bg-white/30 rounded-lg mb-6 animate-pulse"></div>
            <div className="h-12 w-32 bg-white/30 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Features Section Skeleton - 2x2 on mobile, 4 in a row on desktop */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 sm:h-5 bg-gray-200 rounded w-20 sm:w-24 mb-1 animate-pulse"></div>
                <div className="h-3 w-16 sm:w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section Skeleton */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 pb-8 sm:pb-12">
        <div className="h-6 sm:h-8 w-36 sm:w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-2 sm:p-3">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-14 sm:w-20 mx-auto animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deal of the Day Skeleton */}
      <div className="relative overflow-hidden" style={{ minHeight: '280px' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 animate-pulse"></div>
        {/* Gradient overlay skeleton */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-600/30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="flex flex-col items-center md:items-end justify-center text-center md:text-right">
            <div className="max-w-2xl md:mr-0">
              <div className="h-6 sm:h-8 md:h-10 lg:h-12 w-40 sm:w-56 md:w-72 bg-white/30 rounded-lg mb-2 sm:mb-4 animate-pulse mx-auto md:mx-0"></div>
              <div className="h-4 sm:h-5 md:h-6 w-56 sm:w-72 md:w-96 bg-white/30 rounded-lg mb-4 animate-pulse mx-auto md:mx-0"></div>
              <div className="flex justify-center md:justify-end">
                <div className="h-10 sm:h-12 w-40 sm:w-48 bg-white/30 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="h-10 sm:h-12 w-32 sm:w-36 bg-white/30 rounded-lg mt-4 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Brands Carousel Section Skeleton */}
      <div className="w-full bg-gray-800 py-8 sm:py-10 mt-10 sm:mt-14 mb-6 sm:mb-8 overflow-hidden border-y border-gray-700">
        <div className="w-full">
          <div className="relative w-full">
            <div className="flex items-center space-x-6 sm:space-x-10 overflow-x-auto py-8 px-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32 sm:w-40 h-24 sm:h-28 bg-gray-700 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products for You Section Skeleton */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="h-6 sm:h-8 w-36 sm:w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Row 1 - 4 products */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-2 sm:p-4">
                <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
                {/* Rating skeleton - desktop only */}
                <div className="hidden sm:flex items-center mb-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded ml-2 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                {/* Rating skeleton - mobile only */}
                <div className="flex items-center mt-1 sm:hidden">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 w-8 bg-gray-200 rounded ml-1 animate-pulse"></div>
                </div>
                {/* Button skeleton */}
                <div className="mt-2 sm:mt-3">
                  <div className="h-8 sm:h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Row 2 - 4 products */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i + 4} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-2 sm:p-4">
                <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="hidden sm:flex items-center mb-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded ml-2 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center mt-1 sm:hidden">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 w-8 bg-gray-200 rounded ml-1 animate-pulse"></div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <div className="h-8 sm:h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Row 3 - 4 products */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i + 8} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-2 sm:p-4">
                <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="hidden sm:flex items-center mb-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded ml-2 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center mt-1 sm:hidden">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 w-8 bg-gray-200 rounded ml-1 animate-pulse"></div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <div className="h-8 sm:h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Banner Skeleton */}
      <div className="bg-orange-50 py-8 sm:py-12 mt-8 sm:mt-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-300 rounded-full mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 sm:h-5 w-24 sm:w-28 bg-gray-300 rounded mx-auto mb-1 animate-pulse"></div>
                <div className="h-3 sm:h-4 w-32 sm:w-40 bg-gray-300 rounded mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;