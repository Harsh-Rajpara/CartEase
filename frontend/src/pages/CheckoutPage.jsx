import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { CreditCard, Truck, AlertCircle, Loader, Wallet, ChevronLeft, MapPin, Package, ChevronRight, Home, Phone, Check, PlusCircle } from "lucide-react";
import AddressList from "../components/AddressList";
import { clearCart } from "../store/cartSlice";
import api from "../services/api";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const reduxCartItems = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    address: true,
    items: true,
    payment: true
  });

  // Check if mobile view
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load Razorpay script
  useEffect(() => {
    if (
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      )
    ) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      setError("Payment gateway failed to load. Please use Cash on Delivery.");
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (location.state?.buyNow) {
      setIsBuyNow(true);
      setBuyNowProduct(location.state.product);
    }
  }, [location.state]);

  const handleAddressSelect = (addressId, address) => {
    setSelectedAddressId(addressId);
    setSelectedAddress(address);
  };

  const toggleSection = (section) => {
    if (isMobile) {
      setExpandedSections({
        ...expandedSections,
        [section]: !expandedSections[section]
      });
    }
  };

  const calculateTotal = () => {
    let subtotal = 0;

    if (isBuyNow && buyNowProduct) {
      subtotal = buyNowProduct.price * buyNowProduct.quantity;
    } else {
      subtotal = reduxCartItems.reduce((sum, item) => {
        return sum + (item.price || 0) * (item.quantity || 0);
      }, 0);
    }

    const shipping = subtotal > 500 ? 0 : 40;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  // Process Razorpay Payment
  const processRazorpayPayment = async () => {
    try {
      setLoading(true);
      setError("");

      if (!razorpayLoaded) {
        setError("Payment gateway is still loading. Please try again.");
        setLoading(false);
        return;
      }

      let response;
      if (isBuyNow) {
        response = await api.post("/orders/buy-now", {
          productId: buyNowProduct.productId,
          quantity: buyNowProduct.quantity,
          addressId: selectedAddressId,
          paymentMethod: "razorpay",
          variant: buyNowProduct.variant || "",
          notes: "",
        });
      } else {
        response = await api.post("/orders/checkout", {
          addressId: selectedAddressId,
          paymentMethod: "razorpay",
          notes: "",
        });
      }

      if (response.data.success && response.data.data.razorpayOrder) {
        initializeRazorpay({
          orderId: response.data.data._id,
          orderNumber: response.data.data.orderNumber,
          razorpayOrderId: response.data.data.razorpayOrder.id,
          amount: response.data.data.razorpayOrder.amount,
          currency: response.data.data.razorpayOrder.currency,
        });
      } else {
        setError(response.data.message || "Failed to create payment order");
        setLoading(false);
      }
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to initialize payment. Please try again."
      );
      setLoading(false);
    }
  };

  // Initialize Razorpay Payment
  const initializeRazorpay = (orderData) => {
    const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      setError("Payment gateway not configured. Please use Cash on Delivery.");
      setLoading(false);
      return;
    }

    const options = {
      key: razorpayKey,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "ShopEase",
      description: `Order ${orderData.orderNumber}`,
      image: "/logo192.png",
      order_id: orderData.razorpayOrderId,
      handler: async (response) => {
        try {
          const verifyResponse = await api.post("/orders/verify-payment", {
            orderId: orderData.orderId,
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });

          if (verifyResponse.data.success) {
            if (!isBuyNow) {
              dispatch(clearCart());
            }
            navigate("/order-success", {
              state: {
                orderId: orderData.orderId,
                paymentId: response.razorpay_payment_id,
              },
            });
          } else {
            setError(verifyResponse.data.message || "Payment verification failed");
            setLoading(false);
          }
        } catch (error) {
          console.error("Verification error:", error);
          setError("Payment verification failed. Please contact support.");
          setLoading(false);
        }
      },
      prefill: {
        name: user?.fullName || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      notes: {
        addressId: selectedAddressId,
        paymentMethod: "razorpay",
      },
      theme: {
        color: "#f97316",
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setError("Payment was cancelled");
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        setError(
          `Payment failed: ${response.error.description || "Please try again"}`
        );
        setLoading(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      setError("Failed to initialize payment gateway");
      setLoading(false);
    }
  };

  // Process COD Order
  const processCODOrder = async () => {
    try {
      setLoading(true);
      setError("");

      let response;
      if (isBuyNow) {
        response = await api.post("/orders/buy-now", {
          productId: buyNowProduct.productId,
          quantity: buyNowProduct.quantity,
          addressId: selectedAddressId,
          paymentMethod: "cod",
          variant: buyNowProduct.variant || "",
          notes: "",
        });
      } else {
        response = await api.post("/orders/checkout", {
          addressId: selectedAddressId,
          paymentMethod: "cod",
          notes: "",
        });
      }

      if (response.data.success) {
        if (!isBuyNow) {
          dispatch(clearCart());
        }
        navigate("/order-success", {
          state: { orderId: response.data.data._id },
        });
      } else {
        setError(response.data.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Order Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address");
      return;
    }

    if (!isBuyNow && reduxCartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (paymentMethod === "razorpay") {
      await processRazorpayPayment();
    } else if (paymentMethod === "cod") {
      await processCODOrder();
    }
  };

  const { subtotal, shipping, tax, total } = calculateTotal();

  if (!isBuyNow && reduxCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Go Back</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6 text-sm md:text-base">
              Add items to your cart before checking out.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Bottom Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-orange-600">₹{total.toLocaleString()}</p>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddressId}
              className="bg-orange-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Place Order
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-3 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors text-sm md:text-base"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Checkout</h1>
            {!isMobile && (
              <div className="text-sm text-gray-500">
                {selectedAddressId ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    Address selected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    Select address to continue
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Address Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 md:p-6 cursor-pointer md:cursor-default"
                onClick={() => toggleSection('address')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-orange-600" />
                  </div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">Delivery Address</h2>
                </div>
                {isMobile && (
                  <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.address ? 'rotate-90' : ''}`} />
                )}
                {!isMobile && selectedAddressId && (
                  <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    <Check className="h-3 w-3" />
                    Selected
                  </div>
                )}
              </div>
              
              {(!isMobile || expandedSections.address) && (
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <AddressList
                    onAddressSelect={handleAddressSelect}
                    selectedAddressId={selectedAddressId}
                  />
                  
                 
                  
                  {selectedAddress && !isMobile && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800 flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Selected Address:
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Items Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 md:p-6 cursor-pointer md:cursor-default"
                onClick={() => toggleSection('items')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-orange-600" />
                  </div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    Order Items ({isBuyNow ? 1 : reduxCartItems.length})
                  </h2>
                </div>
                {isMobile && (
                  <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.items ? 'rotate-90' : ''}`} />
                )}
              </div>
              
              {(!isMobile || expandedSections.items) && (
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <div className="space-y-3">
                    {isBuyNow && buyNowProduct ? (
                      <div className="flex gap-3 p-3 border rounded-lg">
                        <img
                          src={buyNowProduct.image}
                          alt={buyNowProduct.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm md:text-base">{buyNowProduct.name}</h3>
                          {buyNowProduct.variant && (
                            <p className="text-xs text-gray-500 mt-0.5">{buyNowProduct.variant}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-600">Quantity: {buyNowProduct.quantity}</p>
                            {/* Show total only on desktop */}
                            {!isMobile && (
                              <p className="font-bold text-orange-600 text-sm md:text-base">
                                ₹{(buyNowProduct.price * buyNowProduct.quantity).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">₹{buyNowProduct.price.toLocaleString()} each</p>
                        </div>
                      </div>
                    ) : (
                      reduxCartItems.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm md:text-base">{item.name}</h3>
                            {item.variant && (
                              <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                              {/* Show total only on desktop */}
                              {!isMobile && (
                                <p className="font-bold text-orange-600 text-sm md:text-base">
                                  ₹{(item.price * item.quantity).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">₹{item.price.toLocaleString()} each</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 md:p-6 cursor-pointer md:cursor-default"
                onClick={() => toggleSection('payment')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                  </div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">Payment Method</h2>
                </div>
                {isMobile && (
                  <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.payment ? 'rotate-90' : ''}`} />
                )}
              </div>
              
              {(!isMobile || expandedSections.payment) && (
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <div className="space-y-3">
                    <label className="flex items-center p-3 md:p-4 border rounded-lg cursor-pointer hover:border-orange-300 transition-all">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3 w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm md:text-base">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when you receive the order</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 md:p-4 border rounded-lg cursor-pointer hover:border-orange-300 transition-all">
                      <input
                        type="radio"
                        name="payment"
                        value="razorpay"
                        checked={paymentMethod === "razorpay"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Wallet className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                          <p className="font-medium text-sm md:text-base">Pay Online (Razorpay)</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Credit/Debit Card, UPI, NetBanking, Wallet
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary (Desktop Only) */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST 5%)</span>
                    <span className="font-medium">₹{tax.toLocaleString()}</span>
                  </div>
                  
                  {shipping > 0 && subtotal < 500 && (
                    <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
                      Add ₹{(500 - subtotal).toLocaleString()} more to get free shipping!
                    </div>
                  )}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-orange-600">₹{total.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddressId}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order (${paymentMethod === "razorpay" ? "Pay Online" : "Cash on Delivery"})`
                  )}
                </button>

                {!selectedAddressId && (
                  <p className="text-xs text-red-500 text-center mt-3 flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Please select a delivery address
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Summary Card */}
        {isMobile && (
          <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Price Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (GST 5%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              
              {shipping > 0 && subtotal < 500 && (
                <div className="bg-orange-50 rounded-lg p-2 text-xs text-orange-700">
                  Add ₹{(500 - subtotal).toLocaleString()} more to get free shipping!
                </div>
              )}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">₹{total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;