

// frontend/src/components/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
  FolderTree,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Import your admin components
import AdminDashboard from './AdminDashboard';
import CategoriesManager from './CategoriesManager';
import Products from './Products.jsx';
import Orders from './Orders.jsx';
import Sellers from './Sellers.jsx';
import AdminUsers from './Users.jsx';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Get current active tab from URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/admin/categories')) return 'categories';
    if (path.includes('/admin/products')) return 'products';
    if (path.includes('/admin/orders')) return 'orders';
    if (path.includes('/admin/sellers')) return 'sellers';
    if (path.includes('/admin/users')) return 'users';
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
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', component: AdminDashboard },
    { id: 'categories', name: 'Categories', icon: FolderTree, path: '/admin/categories', component: CategoriesManager },
    { id: 'products', name: 'Products', icon: Package, path: '/admin/products', component: Products },
    { id: 'orders', name: 'Orders', icon: ShoppingBag, path: '/admin/orders', component: Orders },
    { id: 'sellers', name: 'Sellers', icon: Store, path: '/admin/sellers', component: Sellers },
    { id: 'users', name: 'Users', icon: Users, path: '/admin/users', component: AdminUsers },
  ];

  const handleLogout = async () => {
    try {
      // Call logout API if needed
      // await api.post('/auth/logout');
      // dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get active tab name for header
  const activeTabName = navigation.find(item => item.id === activeTab)?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header Bar */}
      <div className="fixed top-0 right-0 left-0 z-30 bg-white shadow-sm transition-all duration-300" 
           style={{ left: sidebarOpen && !isMobile ? '16rem' : !isMobile && !sidebarOpen ? '5rem' : '0' }}>
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Desktop toggle button */}
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
                <p className="font-medium text-gray-700">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
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
                  Admin Panel
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
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/categories" element={<CategoriesManager />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/sellers" element={<Sellers />} />
            <Route path="/users" element={<AdminUsers />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;