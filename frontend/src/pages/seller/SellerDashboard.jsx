// pages/seller/SellerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Star,
  Clock,
  Loader
} from 'lucide-react';
import {
  LineChart as ReLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import sellerService from '../../services/seller.service';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    avgRating: 0,
    lowStock: 0,
    revenueGrowth: 0,
    orderGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [salesChartPeriod, setSalesChartPeriod] = useState('monthly');
  const [revenueChartPeriod, setRevenueChartPeriod] = useState('monthly');
  const [error, setError] = useState('');

  // Fetch initial dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch sales data when sales period changes
  useEffect(() => {
    if (!loading) {
      fetchSalesData();
    }
  }, [salesChartPeriod]);

  // Fetch revenue data when revenue period changes
  useEffect(() => {
    if (!loading) {
      fetchRevenueData();
    }
  }, [revenueChartPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.allSettled([
        sellerService.getDashboardStats(),
        sellerService.getSellerOrders(),
        sellerService.getSellerProducts()
      ]);

      // Handle stats
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data);
      } else {
        console.warn('Failed to fetch stats');
      }

      // Handle orders
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success && ordersRes.value.data) {
        const formattedOrders = ordersRes.value.data.slice(0, 5).map(order => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customer?.fullName || order.customerName || 'Guest',
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt
        }));
        setRecentOrders(formattedOrders);
      }

      // Handle products
      if (productsRes.status === 'fulfilled' && productsRes.value?.success && productsRes.value.data) {
        const sortedProducts = [...productsRes.value.data]
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 5)
          .map(product => ({
            _id: product._id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            sold: product.sold || 0,
            isActive: product.isActive
          }));
        setTopProducts(sortedProducts);
      }

      // Fetch initial chart data
      await Promise.all([
        fetchSalesData(),
        fetchRevenueData()
      ]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    setLoadingSales(true);
    try {
      const res = await sellerService.getSalesChartData(salesChartPeriod);
      if (res && res.success) {
        setSalesData(res.data);
      } else {
        setSalesData([]);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSalesData([]);
    } finally {
      setLoadingSales(false);
    }
  };

  const fetchRevenueData = async () => {
    setLoadingRevenue(true);
    try {
      const res = await sellerService.getRevenueChartData(revenueChartPeriod);
      if (res && res.success) {
        setRevenueData(res.data);
      } else {
        setRevenueData([]);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setRevenueData([]);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      ordered: 'bg-yellow-100 text-yellow-800',
      packed: 'bg-blue-100 text-blue-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      processing: 'bg-blue-100 text-blue-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
          <h1 className="text-2xl font-bold text-gray-800">Seller Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.fullName || 'Seller'}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <RefreshCw className="h-4 w-4" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalCustomers.toLocaleString()}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>



      {/* Charts Section - Independent Period Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold text-gray-800">Product Sales</h2>
    <select
      value={salesChartPeriod}
      onChange={(e) => setSalesChartPeriod(e.target.value)}
      className="px-3 py-1 pr-8 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
    </select>
  </div>
  {loadingSales ? (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ) : salesData.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={salesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [value, 'Units Sold']} />
        <Legend />
        <Bar dataKey="sales" fill="#8884d8" name="Units Sold" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <div className="flex items-center justify-center h-64 text-gray-500">
      No sales data available for this period
    </div>
  )}
</div>

{/* Revenue Chart */}
<div className="bg-white rounded-lg shadow-sm p-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold text-gray-800">Revenue Trend</h2>
    <select
      value={revenueChartPeriod}
      onChange={(e) => setRevenueChartPeriod(e.target.value)}
      className="px-3 py-1 pr-8 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
    </select>
  </div>
  {loadingRevenue ? (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ) : revenueData.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <ReLineChart data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `₹${value/1000}K`} />
        <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#82ca9d" 
          name="Revenue" 
          strokeWidth={2}
          dot={{ fill: '#82ca9d', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  ) : (
    <div className="flex items-center justify-center h-64 text-gray-500">
      No revenue data available for this period
    </div>
  )}
</div>
      </div>



      {/* Recent Orders Table */}
<div className="bg-white rounded-lg shadow-sm overflow-hidden">
  <div className="px-6 py-4 border-b">
    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
      <Clock className="h-5 w-5 mr-2 text-blue-600" />
      Recent Orders
    </h2>
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
            <tr key={order._id} className="bg-white">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {order.orderNumber || order._id.slice(-6)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {order.customerName}
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
  
</div>

      
    </div>
  );
};

export default SellerDashboard;