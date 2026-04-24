// frontend/src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Users,
  Store,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  RefreshCw,
  AlertCircle,
  IndianRupee,
  Loader
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalSellers: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    orderGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all data in parallel
      const [statsRes, ordersRes, productsRes, usersRes, sellersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-orders?limit=5'),
        api.get('/admin/recent-products?limit=5'),
        api.get('/admin/users/count'),
        api.get('/admin/sellers/count')
      ]);

      // Update stats
      if (statsRes.data.success) {
        const data = statsRes.data.data;
        setStats({
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalUsers: usersRes.data?.count || 0,
          totalSellers: sellersRes.data?.count || 0,
          totalRevenue: data.totalRevenue || 0,
          revenueGrowth: data.revenueGrowth || 0,
          orderGrowth: data.orderGrowth || 0
        });
      }

      // Update recent orders
      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.data || []);
      }

      // Update recent products
      if (productsRes.data.success) {
        setRecentProducts(productsRes.data.data || []);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      
      // Fallback demo data
      setStats({
        totalProducts: 1250,
        totalOrders: 342,
        totalUsers: 2450,
        totalSellers: 45,
        totalRevenue: 125000,
        revenueGrowth: 23.5,
        orderGrowth: 12.8
      });
      
      setRecentOrders([
        { _id: '1', orderNumber: '#ORD-001', userId: { fullName: 'John Doe' }, totalAmount: 299.99, orderStatus: 'pending', createdAt: '2024-03-20' },
        { _id: '2', orderNumber: '#ORD-002', userId: { fullName: 'Jane Smith' }, totalAmount: 149.50, orderStatus: 'completed', createdAt: '2024-03-20' },
        { _id: '3', orderNumber: '#ORD-003', userId: { fullName: 'Bob Johnson' }, totalAmount: 599.99, orderStatus: 'shipped', createdAt: '2024-03-19' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.fullName || 'Admin'}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center text-gray-700 gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-600">{error}</p>
          <button onClick={fetchDashboardData} className="ml-auto text-red-600 hover:text-red-800 text-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts.toLocaleString()}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders.toLocaleString()}</p>
              {stats.orderGrowth !== 0 && (
                <div className="flex items-center mt-2">
                  {stats.orderGrowth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs ml-1 ${stats.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats.orderGrowth)}%
                  </span>
                </div>
              )}
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sellers</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalSellers.toLocaleString()}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalRevenue)}</p>
              {stats.revenueGrowth !== 0 && (
                <div className="flex items-center mt-2">
                  {stats.revenueGrowth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs ml-1 ${stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats.revenueGrowth)}%
                  </span>
                </div>
              )}
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <IndianRupee className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table - No clickable and no view all button */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber || order._id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.userId?.fullName || 'Guest'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Removed View All Orders button */}
        </div>

        {/* Recent Products Table - No clickable and no view all button */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Recent Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  recentProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={product.stock < 10 ? 'text-red-600 font-semibold' : ''}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Removed View All Products button */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;