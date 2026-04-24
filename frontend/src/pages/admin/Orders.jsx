// components/admin/Orders.jsx
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Eye, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Loader,
  AlertCircle,
  RefreshCw,
  MapPin,
  Copy,
  User,
  Phone,
  Mail,
  Map,
  XCircle
} from 'lucide-react';
import api from '../../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/orders/admin/all-orders');
      
      if (response.data.success) {
        const formattedOrders = response.data.data.map(order => ({
          id: order._id,
          orderId: order.orderNumber || order._id,
          customer: order.userId?.fullName || 'Guest',
          email: order.userId?.email || 'N/A',
          total: order.totalAmount,
          status: order.orderStatus || 'ordered',
          paymentStatus: order.paymentStatus,
          items: order.items?.length || 0,
          date: order.createdAt,
          address: order.shippingAddress,
          phone: order.phone,
          itemsList: order.items,
          statusHistory: order.statusHistory || []
        }));
        setOrders(formattedOrders);
      } else {
        setError('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (action, order) => {
    setConfirmAction(action);
    setConfirmOrder(order);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmOrder(null);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      
      if (response.data.success) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        closeConfirmModal();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = async (text, e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'ordered':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'packed':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'out_of_delivery':
        return <MapPin className="h-4 w-4 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      ordered: 'bg-yellow-100 text-yellow-800',
      packed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      out_of_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return statuses[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ordered: 'Ordered',
      packed: 'Packed',
      shipped: 'Shipped',
      out_of_delivery: 'Out Of Delivery',
      delivered: 'Delivered'
    };
    return labels[status?.toLowerCase()] || status?.toUpperCase() || 'ORDERED';
  };

  const getAvailableActions = (currentStatus) => {
    const actions = [];
    switch(currentStatus?.toLowerCase()) {
      case 'ordered':
        actions.push({ action: 'packed', label: 'Mark as Packed', icon: <Package className="h-4 w-4" />, color: 'bg-blue-600 hover:bg-blue-700' });
        break;
      case 'packed':
        actions.push({ action: 'shipped', label: 'Mark as Shipped', icon: <Truck className="h-4 w-4" />, color: 'bg-purple-600 hover:bg-purple-700' });
        break;
      case 'shipped':
        actions.push({ action: 'out_of_delivery', label: 'Mark as Out of Delivery', icon: <MapPin className="h-4 w-4" />, color: 'bg-orange-600 hover:bg-orange-700' });
        break;
      case 'out_of_delivery':
        actions.push({ action: 'delivered', label: 'Mark as Delivered', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-600 hover:bg-green-700' });
        break;
      case 'delivered':
        break;
      default:
        break;
    }
    return actions;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const stats = {
    total: orders.length,
    ordered: orders.filter(o => o.status?.toLowerCase() === 'ordered').length,
    packed: orders.filter(o => o.status?.toLowerCase() === 'packed').length,
    shipped: orders.filter(o => o.status?.toLowerCase() === 'shipped').length,
    out_of_delivery: orders.filter(o => o.status?.toLowerCase() === 'out_of_delivery').length,
    delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-800">Error loading orders</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Ordered</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.ordered}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Packed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.packed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Out of Delivery</p>
          <p className="text-2xl font-bold text-orange-600">{stats.out_of_delivery}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-orange-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="ordered">Ordered</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="out_of_delivery">Out of Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {order.orderId.slice(-12)}
                        </code>
                        <button
                          onClick={(e) => copyToClipboard(order.orderId, e)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Copy ID"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                      <div className="text-xs text-gray-500">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.items} items</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 border rounded-lg bg-blue-50 text-blue-600">{currentPage}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
{/* Order Details Modal */}
{selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ margin: 0, marginTop: 0 }}>
    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Order Summary - 5 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium font-mono text-sm break-all">{selectedOrder.orderId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{formatDate(selectedOrder.date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(selectedOrder.total)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <p className={`inline-block px-2 py-1 text-xs rounded-full ${
              selectedOrder.paymentStatus === 'completed' || selectedOrder.paymentStatus === 'paid'
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {selectedOrder.paymentStatus || 'Pending'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <span className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedOrder.status)}`}>
              {getStatusIcon(selectedOrder.status)}
              {getStatusLabel(selectedOrder.status)}
            </span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="border-t pt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedOrder.customer}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedOrder.email}</p>
              </div>
            </div>
            {selectedOrder.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 col-span-2">
              <Map className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Shipping Address</p>
                <p className="font-medium">{selectedOrder.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t pt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedOrder.itemsList?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.variant && (
                            <p className="text-xs text-gray-500">Variant: {item.variant}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-sm">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right font-semibold">Total:</td>
                  <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(selectedOrder.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      
      {/* Sticky Footer with Action Buttons - Similar to Product Modal */}
      <div className="sticky bottom-0 bg-gray-50 p-6 border-t">
        <div className="flex justify-end gap-3 flex-wrap">
          {getAvailableActions(selectedOrder.status).map((action) => (
            <button
              key={action.action}
              onClick={() => openConfirmModal(action.action, selectedOrder)}
              disabled={updating}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-all disabled:opacity-50 ${
                action.action === 'confirm' || action.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                action.action === 'cancel' || action.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                action.action === 'delivered' ? 'bg-blue-600 hover:bg-blue-700' :
                action.action === 'shipped' ? 'bg-purple-600 hover:bg-purple-700' :
                'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
          
         
          
          <button
            onClick={() => setSelectedOrder(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" style={{ margin: 0, marginTop: 0 }}>
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {confirmAction === 'packed' && <Package className="h-8 w-8 text-blue-500" />}
                {confirmAction === 'shipped' && <Truck className="h-8 w-8 text-purple-500" />}
                {confirmAction === 'out_of_delivery' && <MapPin className="h-8 w-8 text-orange-500" />}
                {confirmAction === 'delivered' && <CheckCircle className="h-8 w-8 text-green-500" />}
                <h3 className="text-lg font-semibold text-gray-800">
                  {confirmAction === 'packed' && 'Mark as Packed'}
                  {confirmAction === 'shipped' && 'Mark as Shipped'}
                  {confirmAction === 'out_of_delivery' && 'Mark as Out of Delivery'}
                  {confirmAction === 'delivered' && 'Mark as Delivered'}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                {confirmAction === 'packed' && `Are you sure you want to mark order "${confirmOrder.orderId}" as Packed?`}
                {confirmAction === 'shipped' && `Are you sure you want to mark order "${confirmOrder.orderId}" as Shipped?`}
                {confirmAction === 'out_of_delivery' && `Are you sure you want to mark order "${confirmOrder.orderId}" as Out Of Delivery?`}
                {confirmAction === 'delivered' && `Are you sure you want to mark order "${confirmOrder.orderId}" as Delivered?`}
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeConfirmModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateOrderStatus(confirmOrder.id, confirmAction)}
                  disabled={updating}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white ${
                    confirmAction === 'packed' ? 'bg-blue-600 hover:bg-blue-700' :
                    confirmAction === 'shipped' ? 'bg-purple-600 hover:bg-purple-700' :
                    confirmAction === 'out_of_delivery' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-green-600 hover:bg-green-700'
                  } disabled:opacity-50`}
                >
                  {updating ? <Loader className="h-4 w-4 animate-spin" /> : (
                    confirmAction === 'packed' ? <Package className="h-4 w-4" /> :
                    confirmAction === 'shipped' ? <Truck className="h-4 w-4" /> :
                    confirmAction === 'out_of_delivery' ? <MapPin className="h-4 w-4" /> :
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {confirmAction === 'packed' && 'Yes, Mark as Packed'}
                  {confirmAction === 'shipped' && 'Yes, Mark as Shipped'}
                  {confirmAction === 'out_of_delivery' && 'Yes, Mark as Out of Delivery'}
                  {confirmAction === 'delivered' && 'Yes, Mark as Delivered'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;