import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
  AlertCircle,
  RefreshCw,
  MapPin,
  User,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  X,
} from "lucide-react";
import api from "../../services/api";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // pages/seller/SellerOrders.jsx - Update fetchOrders function

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/seller/orders");

      console.log("API Response:", response.data);

      if (response.data.success) {
        const formattedOrders = response.data.data.map((order) => ({
          id: order._id,
          orderId: order.orderNumber,
          customer: order.customer?.fullName || "Guest",
          email: order.customer?.email || "N/A",
          phone: order.customer?.phone || "N/A",
          total: order.totalAmount,
          status: order.orderStatus,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          items: order.itemsCount,
          date: order.createdAt,
          address: order.shippingAddress,
          itemsList: order.items,
        }));

        setOrders(formattedOrders);

        // Display stats in console
        console.log("Seller Stats:", response.data.stats);
      } else {
        setError("Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "ordered":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-purple-500" />;
      case "packed":
        return <Package className="h-4 w-4 text-indigo-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "out_for_delivery":
        return <MapPin className="h-4 w-4 text-orange-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      ordered: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      packed: "bg-indigo-100 text-indigo-800",
      shipped: "bg-blue-100 text-blue-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statuses[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      ordered: "Ordered",
      confirmed: "Confirmed",
      processing: "Processing",
      packed: "Packed",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[status?.toLowerCase()] || status || "Ordered";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      order.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const stats = {
    total: orders.length,
    ordered: orders.filter((o) => o.status?.toLowerCase() === "ordered").length,
    confirmed: orders.filter((o) => o.status?.toLowerCase() === "confirmed")
      .length,
    processing: orders.filter((o) => o.status?.toLowerCase() === "processing")
      .length,
    packed: orders.filter((o) => o.status?.toLowerCase() === "packed").length,
    shipped: orders.filter((o) => o.status?.toLowerCase() === "shipped").length,
    out_for_delivery: orders.filter(
      (o) => o.status?.toLowerCase() === "out_for_delivery",
    ).length,
    delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered")
      .length,
    cancelled: orders.filter((o) => o.status?.toLowerCase() === "cancelled")
      .length,
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
        <h3 className="text-lg font-medium text-red-800">
          Error loading orders
        </h3>
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
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-600 mt-1">
            View and track your customer orders
          </p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <p className="text-xs text-gray-500">Ordered</p>
          <p className="text-lg font-bold text-yellow-600">{stats.ordered}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <p className="text-xs text-gray-500">Confirmed</p>
          <p className="text-lg font-bold text-blue-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <p className="text-xs text-gray-500">Processing</p>
          <p className="text-lg font-bold text-purple-600">
            {stats.processing}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <p className="text-xs text-gray-500">Packed</p>
          <p className="text-lg font-bold text-indigo-600">{stats.packed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <p className="text-xs text-gray-500">Shipped</p>
          <p className="text-lg font-bold text-blue-600">{stats.shipped}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <p className="text-xs text-gray-500">Delivered</p>
          <p className="text-lg font-bold text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <p className="text-xs text-gray-500">Cancelled</p>
          <p className="text-lg font-bold text-red-600">{stats.cancelled}</p>
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="ordered">Ordered</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No orders found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-2 text-orange-600 hover:text-orange-700"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer}
                      </div>
                      <div className="text-xs text-gray-500">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.items}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          console.log("Selected Order Details:", order);
                          setSelectedOrder(order);
                        }}
                        className="text-orange-600 hover:text-orange-800 flex items-center gap-1"
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
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 border rounded-lg bg-orange-50 text-orange-600">
                {currentPage}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Order #{selectedOrder.orderId}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {formatDate(selectedOrder.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      selectedOrder.paymentStatus === "completed" ||
                      selectedOrder.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedOrder.paymentStatus || "Pending"}
                  </p>
                </div>
              </div>

              {/* Order Status Display */}
              <div className="border-t pt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">
                  Order Status
                </h3>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100">
                  {getStatusIcon(selectedOrder.status)}
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(selectedOrder.status)}`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Status updates are managed by the administrator
                </p>
              </div>

              {/* Customer Information */}
              <div className="border-t pt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrder.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">
                      {selectedOrder.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.address && (
                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">
                    Shipping Address
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4">
                    {/* ✅ FULL ADDRESS */}
                    <p className="text-sm text-gray-600">
                      {selectedOrder.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="border-t pt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">
                  Order Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.itemsList &&
                      selectedOrder.itemsList.length > 0 ? (
                        selectedOrder.itemsList.map((item, idx) => {
                          console.log(`Modal - Item ${idx + 1}:`, item);
                          return (
                            <tr key={idx}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {item.name || "Product Name"}
                                    </p>
                                    {item.variant && (
                                      <p className="text-xs text-gray-500">
                                        Variant: {item.variant}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400">
  Product ID:{" "}
  {item.productDetails?._id || item.productId || "N/A"}
</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {formatCurrency(item.price)}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-semibold text-gray-800">
                                  {item.quantity || 0}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {formatCurrency(
                                  (item.price || 0) * (item.quantity || 0),
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No items found in this order
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-3 text-right font-semibold"
                        >
                          Total:
                        </td>
                        <td className="px-4 py-3 font-bold text-orange-600">
                          {formatCurrency(selectedOrder.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 p-6 border-t flex justify-end gap-3">
        
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
