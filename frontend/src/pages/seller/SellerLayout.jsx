import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../../services/api';
import { logout } from '../../store/authSlice';

// Import your seller components
import SellerDashboard from '../../pages/seller/SellerDashboard';
import SellerProducts from '../../pages/seller/SellerProducts';
import SellerOrders from '../../pages/seller/SellerOrders';

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get user from Redux store
  const { user } = useSelector((state) => state.auth);

  // Get current active tab from URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/seller/products')) return 'products';
    if (path.includes('/seller/orders')) return 'orders';
    return 'dashboard';
  };

  const activeTab = getActiveTabFromPath();

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/seller/dashboard', component: SellerDashboard },
    { id: 'products', name: 'My Products', icon: Package, path: '/seller/products', component: SellerProducts },
    { id: 'orders', name: 'Orders', icon: ShoppingBag, path: '/seller/orders', component: SellerOrders },
  ];

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const activeTabName = navigation.find(item => item.id === activeTab)?.name || 'Dashboard';

  // Get verification status
  const verificationStatus = user?.verificationStatus || user?.seller?.verificationStatus || 'pending';

  // Show pending approval message
  if (verificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Pending</h2>
          <p className="text-gray-600 mb-4">
            Your seller account is currently pending verification. 
            Please wait for admin approval before you can access the seller dashboard.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Status:</strong> Your application is under review
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              We will notify you once your account is verified
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Show rejected message
  if (verificationStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Rejected</h2>
          <p className="text-gray-600 mb-4">
            Your seller account verification has been rejected. Please contact support for more information.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>Reason:</strong> {user?.rejectionReason || 'Your application did not meet our requirements'}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Please contact support to resolve this issue
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/contact-support')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Contact Support
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show approved - full dashboard
  if (verificationStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Top Header Bar */}
        <div 
          className="fixed top-0 right-0 left-0 z-30 bg-white shadow-sm transition-all duration-300" 
          style={{ left: sidebarOpen && !isMobile ? '16rem' : !isMobile && !sidebarOpen ? '5rem' : '0' }}
        >
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              <h1 className="text-lg font-semibold text-gray-800">
                {activeTabName}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="text-sm text-right hidden sm:block">
                  <p className="font-medium text-gray-700">{user?.fullName || 'Seller'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'seller@example.com'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Overlay for mobile */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 z-40 h-full bg-white shadow-xl transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${!isMobile && sidebarOpen ? 'w-64' : 'w-64'} lg:translate-x-0`}
          style={{ width: !isMobile && sidebarOpen ? '16rem' : !isMobile && !sidebarOpen ? '5rem' : '16rem' }}
        >
          {/* Sidebar Header */}
          <div className={`flex items-center h-16 px-6 border-b transition-all duration-300 ${
            !isMobile && !sidebarOpen ? 'justify-center px-2' : 'justify-between'
          }`}>
            {(!isMobile && sidebarOpen) || isMobile ? (
              <>
                <div className="flex items-center">
                  <Store className="h-8 w-8 text-blue-600" />
                  <span className={`ml-2 text-xl font-bold text-gray-900 transition-opacity duration-300 ${
                    !isMobile && !sidebarOpen ? 'hidden' : 'block'
                  }`}>
                    Seller Panel
                  </span>
                </div>
                {isMobile && (
                  <button onClick={toggleSidebar} className="text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </>
            ) : (
              <Store className="h-8 w-8 text-blue-600" />
            )}
          </div>

          {/* Navigation - Using Link for proper routing */}
          <nav className="mt-6 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${!isMobile && !sidebarOpen ? 'justify-center' : ''}`}
                  title={!isMobile && !sidebarOpen ? item.name : ''}
                >
                  <item.icon className={`h-5 w-5 transition-all duration-200 ${
                    isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'
                  } ${!isMobile && !sidebarOpen ? 'mr-0' : 'mr-3'}`} />
                  <span className={`transition-opacity duration-200 ${
                    !isMobile && !sidebarOpen ? 'hidden' : 'inline'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

        
        </div>

        {/* Main content - Using Routes */}
        <div
          className={`transition-all duration-300 ${
            !isMobile && sidebarOpen ? 'lg:ml-64' : !isMobile && !sidebarOpen ? 'lg:ml-20' : ''
          }`}
        >
          <main className="pt-10 p-6">
            <Routes>
              <Route path="/dashboard" element={<SellerDashboard />} />
              <Route path="/products" element={<SellerProducts />} />
              <Route path="/orders" element={<SellerOrders />} />
              <Route path="/update-product/:id" element={<SellerProducts />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // Default fallback
  return null;
};

export default SellerLayout;