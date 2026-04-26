// frontend/src/components/NotFoundPage.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md mx-auto">
        {/* Animated 404 Icon */}
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-gray-200">404</div>
        
        </div>
        
        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-2">
          The page <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{path}</span> doesn't exist or has been moved.
        </p>
        
        <p className="text-gray-500 mb-8">
          Sorry for the inconvenience. Let's get you back on track.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {/* <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button> */}
          
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
        
   
      </div>
    </div>
  );
};

export default NotFoundPage;