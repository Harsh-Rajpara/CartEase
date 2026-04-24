import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CheckCircle, 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Download, 
  ShoppingBag,
  ArrowRight,
  Home,
  Truck,
  Clock,
  Phone,
  Printer,
  Share2,
  AlertCircle,
  Receipt,
  IndianRupee,
  Loader
} from 'lucide-react';
import { clearCart } from '../store/cartSlice';
import api from '../services/api';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [downloading, setDownloading] = useState(false);

  // Get order ID from URL params or location state
  const orderId = new URLSearchParams(location.search).get('orderId') || 
                  location.state?.orderId;

  useEffect(() => {
    if (!orderId) {
      setError('No order ID found');
      setLoading(false);
      return;
    }

    fetchOrderDetails();
    
    // Clear cart from Redux after successful order
    dispatch(clearCart());
  }, [orderId]);

  useEffect(() => {
    // Redirect countdown
    if (countdown > 0 && error) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && error) {
      navigate('/');
    }
  }, [countdown, error, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      
      console.log('Full API Response:', response);
      console.log('Order Data:', response.data.data);
      console.log('Shipping Address:', response.data.data.shippingAddress);
      console.log('Phone:', response.data.data.shippingAddress?.phone);
      
      if (response.data.success) {
        setOrder(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${orderId.slice(-8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  const getEstimatedDelivery = () => {
    if (!order?.createdAt) return 'N/A';
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 3);
    return deliveryDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-50',
      'confirmed': 'text-blue-600 bg-blue-50',
      'processing': 'text-purple-600 bg-purple-50',
      'shipped': 'text-orange-600 bg-orange-50',
      'delivered': 'text-green-600 bg-green-50',
      'cancelled': 'text-red-600 bg-red-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            {error || "We couldn't find your order details."}
          </p>
          <div className="text-xs sm:text-sm text-gray-500 mb-6">
            Redirecting to home in {countdown} seconds...
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm sm:text-base w-full sm:w-auto"
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Safe data extraction with fallbacks
  const orderItems = order.items || [];
  const subtotal = order.subtotal || 0;
  const shipping = order.shipping !== undefined ? order.shipping : (subtotal > 500 ? 0 : 40);
  const tax = order.tax || (subtotal * 0.05);
  const total = order.total || (subtotal + shipping + tax);
  const shippingAddress = order.shippingAddress || {};
  const paymentMethod = order.paymentMethod || 'N/A';
  const paymentStatus = order.paymentStatus || 'pending';
  const orderStatus = order.orderStatus || 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 py-6 px-3 sm:py-8 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8 animate-bounce-in">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full mb-3 sm:mb-4 shadow-lg">
            <CheckCircle className="h-11 w-11 sm:h-14 sm:w-14 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 px-2">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
            Thank you for your purchase, {user?.name || 'Customer'}!
          </p>
        </div>

        {/* Main Order Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-4 sm:px-6 sm:py-5 text-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs sm:text-sm opacity-90 mb-1">Order ID</p>
                <p className="font-mono text-sm sm:text-base md:text-lg font-semibold break-all">
                  {order._id?.slice(-12).toUpperCase() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm opacity-90 mb-1">Order Date</p>
                <p className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm opacity-90 mb-1">Estimated Delivery</p>
                <p className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
                  {getEstimatedDelivery()}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm opacity-90 mb-1">Order Status</p>
                <span className={`inline-flex px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(orderStatus)}`}>
                  {orderStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items - Mobile Optimized (Total amount removed on mobile) */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              Order Items ({orderItems.length})
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-2 sm:p-3 rounded-lg">
                  {/* Product Image - Left side */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || '/api/placeholder/100/100'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/100/100';
                      }}
                    />
                  </div>
                  
                  {/* Product Details - Right side */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                      {item.name || 'Product'}
                    </h4>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          ₹{(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                      {/* Total amount - Hidden on mobile, visible on desktop */}
                      <p className="hidden sm:block font-bold text-orange-600 text-sm sm:text-base">
                        ₹{(item.total || (item.price * item.quantity) || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary - Redesigned like Delivery Address & Payment Info */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg">
              <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
              Price Summary
            </h3>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Charges</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST 5%)</span>
                  <span className="font-medium">₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-sm sm:text-base">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-orange-600">₹{total.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    Inclusive of all taxes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address & Payment Info */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                Delivery Address
              </h3>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                {shippingAddress && Object.keys(shippingAddress).length > 0 ? (
                  <>
                    <p className="text-gray-700 text-xs sm:text-sm font-normal break-words leading-relaxed">
                      {typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress)}
                    </p>
                    <p className="text-gray-600 mt-2 flex items-center gap-2 text-xs sm:text-sm">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                      {order.phone || 'N/A'}
                    </p>
                  </>
                ) : (
                  <div className="text-red-500 text-xs sm:text-sm">
                    <p>No shipping address found</p>
                    <p className="text-xs mt-2 break-all">Order ID: {order._id}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Payment Information
              </h3>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between flex-col sm:flex-row gap-1 sm:gap-0">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between flex-col sm:flex-row gap-1 sm:gap-0">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-medium ${paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {paymentStatus === 'paid' ? 'Paid ✓' : paymentStatus}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between flex-col sm:flex-row gap-1 sm:gap-0">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs break-all">{order.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="flex justify-between flex-col sm:flex-row gap-1 sm:gap-0 pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-bold text-green-600 text-sm sm:text-base">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-semibold shadow-lg text-sm sm:text-base w-full sm:w-auto"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        @media (max-width: 640px) {
          .animate-bounce-in {
            animation: bounce-in 0.4s ease-out;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessPage;