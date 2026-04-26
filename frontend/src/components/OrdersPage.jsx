// frontend/src/pages/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    Package, ChevronRight, Truck, CheckCircle, Clock, 
    XCircle, Calendar, MapPin, CreditCard, X
} from 'lucide-react';
import api from '../services/api';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        delivered: 0,
        processing: 0,
        cancelled: 0
    });

    // Fetch orders function
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            if (sortBy === 'newest') params.sort = '-createdAt';
            if (sortBy === 'oldest') params.sort = 'createdAt';
            
            const response = await api.get('/orders/my-orders', { params });
            
            if (response.data.success) {
                setOrders(response.data.data);
                calculateStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterStatus, sortBy]);

    // Fetch orders when component mounts and when filters/sort changes
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const calculateStats = (ordersData) => {
        const total = ordersData.length;
        const delivered = ordersData.filter(o => o.orderStatus === 'delivered').length;
        const processing = ordersData.filter(o => ['ordered', 'packed', 'shipped', 'out_for_delivery', 'out_of_delivery'].includes(o.orderStatus)).length;
        const cancelled = ordersData.filter(o => o.orderStatus === 'cancelled').length;
        
        setStats({ total, delivered, processing, cancelled });
    };

    // const handleManualRefresh = async () => {
    //     setIsRefreshing(true);
    //     await fetchOrders();
    // };

    // Updated status badge to match your schema
    const getStatusBadge = (orderStatus) => {
        const statusConfig = {
            ordered: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Ordered' },
            packed: { color: 'bg-purple-100 text-purple-800', icon: Package, text: 'Packed' },
            shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck, text: 'Shipped' },
            out_for_delivery: { color: 'bg-orange-100 text-orange-800', icon: Truck, text: 'Out for Delivery' },
            out_of_delivery: { color: 'bg-orange-100 text-orange-800', icon: Truck, text: 'Out for Delivery' },
            delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelled' }
        };
        const config = statusConfig[orderStatus] || statusConfig.ordered;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3" />
                {config.text}
            </span>
        );
    };

    // Fixed progress steps with correct percentage calculation
    const getProgressSteps = (orderStatus) => {
        const steps = ['Ordered', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
        const statusMap = {
            ordered: 0,
            packed: 1,
            shipped: 2,
            out_for_delivery: 3,
            out_of_delivery: 3,
            delivered: 4,
            cancelled: -1
        };
        
        let currentStep = statusMap[orderStatus] !== undefined ? statusMap[orderStatus] : 0;
        
        // If order is cancelled, show all steps as incomplete
        if (orderStatus === 'cancelled') {
            currentStep = -1;
        }
        
        return steps.map((step, index) => ({
            name: step,
            completed: currentStep >= index,
            active: index === currentStep,
            isCancelled: orderStatus === 'cancelled'
        }));
    };

    // Calculate progress width
    const getProgressWidth = (orderStatus) => {
        if (orderStatus === 'cancelled') return 0;
        const statusMap = {
            ordered: 0,
            packed: 25,
            shipped: 50,
            out_for_delivery: 75,
            out_of_delivery: 75,
            delivered: 100
        };
        return statusMap[orderStatus] || 0;
    };

    const filteredOrders = orders.filter(order => 
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && !isRefreshing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Track and manage your orders</p>
                        </div>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
                        <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {searchTerm ? 'No orders match your search criteria.' : 'You haven\'t placed any orders yet.'}
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition text-sm"
                        >
                            Start Shopping
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* Order Header - Order ID & Date on LEFT, Status on RIGHT */}
                                <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500">Order #{order.orderNumber?.slice(-8) || order._id?.slice(-8)}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                Items: {order.items?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        {getStatusBadge(order.orderStatus)}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-4 sm:p-6">
                                    <div className="space-y-3">
                                        {order.items?.slice(0, 2).map((item, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <img
                                                    src={item.image || '/api/placeholder/80/80'}
                                                    alt={item.name}
                                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">{item.name}</h4>
                                                    {item.variant && (
                                                        <p className="text-xs text-gray-500">{item.variant}</p>
                                                    )}
                                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs sm:text-sm text-gray-500">Total</p>
                                                    <p className="font-semibold text-sm sm:text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {order.items?.length > 2 && (
                                            <p className="text-xs sm:text-sm text-gray-500 text-center pt-2">
                                                +{order.items.length - 2} more items
                                            </p>
                                        )}
                                    </div>

                                    {/* Total Amount on LEFT, View Details on RIGHT for mobile */}
                                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Amount</p>
                                            <p className="text-lg sm:text-xl font-bold text-orange-600">₹{order.totalAmount?.toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
                                        >
                                            <span>View Details</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Details Modal - Responsive */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedOrder(null)}></div>
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Order Details</h2>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">Order #{selectedOrder.orderNumber?.slice(-8) || selectedOrder._id?.slice(-8)}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600 ml-2"
                            >
                                <X className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6">
                            {/* Order Status Timeline */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Order Status</h3>
                                {selectedOrder.orderStatus === 'cancelled' ? (
                                    <div className="bg-red-50 rounded-lg p-4 text-center">
                                        <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                        <p className="text-red-600 font-medium">This order has been cancelled</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Progress Bar Background */}
                                        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full -mt-0.5"></div>
                                        {/* Progress Bar Fill */}
                                        <div 
                                            className="absolute top-4 left-0 h-1 bg-green-500 rounded-full transition-all duration-500 -mt-0.5"
                                            style={{ width: `${getProgressWidth(selectedOrder.orderStatus)}%` }}
                                        ></div>
                                        
                                        {/* Steps */}
                                        <div className="relative flex justify-between">
                                            {getProgressSteps(selectedOrder.orderStatus).map((step, idx) => (
                                                <div key={idx} className="flex-1 text-center">
                                                    <div className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center transition-all ${
                                                        step.completed 
                                                            ? 'bg-green-500 text-white' 
                                                            : step.active 
                                                                ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                                                                : 'bg-gray-200 text-gray-400'
                                                    }`}>
                                                        {step.completed ? (
                                                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        ) : (
                                                            <span className="text-xs sm:text-sm">{idx + 1}</span>
                                                        )}
                                                    </div>
                                                    <p className={`text-[10px] sm:text-xs mt-1 sm:mt-2 ${step.active ? 'font-semibold text-orange-600' : 'text-gray-500'}`}>
                                                        {step.name}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 p-3 border rounded-lg">
                                            <img
                                                src={item.image || '/api/placeholder/80/80'}
                                                alt={item.name}
                                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">{item.name}</h4>
                                                {item.variant && (
                                                    <p className="text-xs text-gray-500">{item.variant}</p>
                                                )}
                                                <p className="text-xs sm:text-sm text-gray-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs sm:text-sm text-gray-500">Total</p>
                                                <p className="font-semibold text-sm sm:text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <MapPin className="h-4 w-4" />
                                    Delivery Address
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs sm:text-sm text-gray-600 break-words">{selectedOrder.shippingAddress}</p>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Phone: {selectedOrder.phone}</p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <CreditCard className="h-4 w-4" />
                                    Payment Information
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs sm:text-sm">
                                        <span className="font-medium">Method:</span> {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : selectedOrder.paymentMethod}
                                    </p>
                                    <p className="text-xs sm:text-sm mt-1">
                                        <span className="font-medium">Status:</span>{' '}
                                        <span className={selectedOrder.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                                            {selectedOrder.paymentStatus || 'Pending'}
                                        </span>
                                    </p>
                                    {selectedOrder.paymentId && (
                                        <p className="text-xs sm:text-sm mt-1 break-all">
                                            <span className="font-medium">Transaction ID:</span> {selectedOrder.paymentId}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Price Summary</h3>
                                <div className="space-y-2 border-t pt-3">
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span>{selectedOrder.shippingCharge === 0 ? 'Free' : `₹${selectedOrder.shippingCharge}`}</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">Tax (GST)</span>
                                        <span>₹{selectedOrder.tax?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t">
                                        <span>Total</span>
                                        <span className="text-orange-600">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;