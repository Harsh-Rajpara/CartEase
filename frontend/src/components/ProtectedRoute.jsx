// frontend/src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRole, redirectTo = '/login' }) => {
    const { user, isAuthenticated, loading } = useSelector(state => state.auth);
    const location = useLocation();

    useEffect(() => {
  console.log("Current Route:", location.pathname);
}, [location]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to={"/login"} replace />;
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;