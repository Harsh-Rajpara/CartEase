import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertCircle, X, ShoppingCart, ChevronLeft, CreditCard, Truck, Shield } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart as clearCartAction } from '../store/cartSlice';
import api from '../services/api';

const CartPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [clearingCart, setClearingCart] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 40;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;

    const showNotificationMessage = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const updateQuantityHandler = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
        
        try {
            await api.put(`/cart/update/${itemId}`, { quantity: newQuantity });
        } catch (error) {
            console.error('Error updating quantity:', error);
            showNotificationMessage('Failed to update quantity', 'error');
        }
    };

    const removeItemHandler = async (itemId, itemName) => {
        if (!window.confirm(`Remove "${itemName}" from cart?`)) return;
        
        dispatch(removeFromCart(itemId));
        showNotificationMessage(`${itemName} removed from cart`, 'success');
        
        try {
            await api.delete(`/cart/remove/${itemId}`);
        } catch (error) {
            console.error('Error removing item:', error);
            showNotificationMessage('Failed to remove item', 'error');
        }
    };

    const clearCartHandler = async () => {
        setClearingCart(true);
        try {
            await api.delete('/cart/clear');
            dispatch(clearCartAction());
            showNotificationMessage('Cart cleared successfully', 'success');
            setShowClearConfirm(false);
        } catch (error) {
            console.error('Error clearing cart:', error);
            showNotificationMessage('Failed to clear cart', 'error');
        } finally {
            setClearingCart(false);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 md:mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="text-sm md:text-base">Back</span>
                    </button>

                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center transform transition-all duration-300 hover:shadow-2xl">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="h-10 w-10 md:h-12 md:w-12 text-orange-600" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6 text-sm md:text-base">Looks like you haven't added any items to your cart yet.</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                            <span>Start Shopping</span>
                        </button>
                    </div>

              
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 md:py-8">
            {/* Notification Toast - Responsive */}
            {notification.show && (
                <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 z-50 animate-slide-in">
                    <div className={`px-4 md:px-5 py-3 rounded-lg shadow-lg flex items-center justify-between gap-2 text-sm ${
                        notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white max-w-md mx-auto md:mx-0`}>
                        <div className="flex items-center gap-2">
                            {notification.type === 'success' ? (
                                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="text-xs md:text-sm">{notification.message}</span>
                        </div>
                        <button onClick={() => setNotification({ show: false, message: '', type: '' })} className="flex-shrink-0">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Clear Cart Confirmation Modal - Responsive */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowClearConfirm(false)}></div>
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-4 md:p-6 animate-fade-in mx-4">
                        <div className="text-center">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="h-7 w-7 md:h-8 md:w-8 text-red-600" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Clear Entire Cart?</h3>
                            <p className="text-sm md:text-base text-gray-500 mb-6">
                                Are you sure you want to remove all {cartItems.length} items from your cart? This action cannot be undone.
                            </p>
                            <div className="flex flex-col-reverse sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={clearCartHandler}
                                    disabled={clearingCart}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                                >
                                    {clearingCart ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        'Yes, Clear Cart'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
                {/* Header with Back Button */}
                <div className="mb-4 md:mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-3 md:mb-4 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors text-sm md:text-base"
                    >
                        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                        <span>Back</span>
                    </button>
                    
                    {/* Desktop Header - Original Layout */}
                    <div className="hidden md:flex md:flex-col md:items-start md:justify-start">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                            <div>
                                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Shopping Cart</h1>
                                <p className="text-xs md:text-sm text-gray-500 mt-1">
                                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                                </p>
                            </div>
                            {cartItems.length > 0 && (
                                <button
                                    onClick={() => setShowClearConfirm(true)}
                                    className="flex items-center justify-center gap-2 px-3 md:px-4 py-1.5 md:py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300 text-sm md:text-base"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Clear Cart</span>
                                    <span className="sm:hidden">Clear</span>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Mobile Header - Clear Cart button on right side of title */}
                    <div className="md:hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
                                <p className="text-xs text-gray-500 mt-1">
                                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                                </p>
                            </div>
                            {cartItems.length > 0 && (
                                <button
                                    onClick={() => setShowClearConfirm(true)}
                                    className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300 text-xs"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-3 md:space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                {/* Mobile Layout */}
                                {isMobile ? (
                                    <div className="p-3 space-y-3">
                                        <div className="flex gap-3">
                                            {/* Image */}
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.image || '/api/placeholder/100/100'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            
                                            {/* Details */}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                                                {item.variant && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>
                                                )}
                                                <p className="text-base font-bold text-orange-600 mt-1">
                                                    ₹{item.price?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Quantity and Total */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <div className="flex items-center border rounded-lg">
                                                <button
                                                    onClick={() => updateQuantityHandler(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="px-3 py-1.5 hover:bg-gray-100 transition disabled:opacity-50 rounded-l-lg"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantityHandler(item.id, item.quantity + 1)}
                                                    className="px-3 py-1.5 hover:bg-gray-100 transition rounded-r-lg"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Total</p>
                                                <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Dustbin Button - Full Width at Bottom */}
                                        <button
                                            onClick={() => removeItemHandler(item.id, item.name)}
                                            className="w-full mt-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="text-sm font-medium">Remove Item</span>
                                        </button>
                                    </div>
                                ) : (
                                    /* Desktop Layout - Original */
                                    <div className="p-4">
                                        <div className="flex gap-4">
                                            {/* Image */}
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.image || '/api/placeholder/100/100'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                                                        {item.variant && (
                                                            <p className="text-sm text-gray-500 mt-1">{item.variant}</p>
                                                        )}
                                                        <p className="text-xl font-bold text-orange-600 mt-2">
                                                            ₹{item.price?.toLocaleString()}
                                                        </p>
                                                    </div>

                                                    {/* Quantity and Actions - Right side on desktop */}
                                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                                                        <div className="flex items-center border rounded-lg">
                                                            <button
                                                                onClick={() => updateQuantityHandler(item.id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="px-3 py-2 hover:bg-gray-100 transition disabled:opacity-50 rounded-l-lg"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantityHandler(item.id, item.quantity + 1)}
                                                                className="px-3 py-2 hover:bg-gray-100 transition rounded-r-lg"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => removeItemHandler(item.id, item.name)}
                                                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Total Price - New row below */}
                                                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        Total: ₹{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:sticky lg:top-4">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                            
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm md:text-base">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm md:text-base">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                                </div>
                                <div className="flex justify-between text-sm md:text-base">
                                    <span className="text-gray-600">Tax (GST 5%)</span>
                                    <span className="font-medium">₹{tax.toLocaleString()}</span>
                                </div>
                                
                                {shipping > 0 && subtotal < 500 && (
                                    <div className="bg-orange-50 rounded-lg p-3 text-xs md:text-sm text-orange-700">
                                        <Truck className="h-3 w-3 md:h-4 md:w-4 inline mr-1" />
                                        Add ₹{(500 - subtotal).toLocaleString()} more to get free shipping!
                                    </div>
                                )}
                                
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between font-bold text-base md:text-lg">
                                        <span>Total</span>
                                        <span className="text-orange-600">₹{total.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg hidden md:block">
                                <div className="flex justify-around text-xs text-gray-600">
                                    <div className="flex flex-col items-center gap-1">
                                        <Shield className="h-4 w-4 text-green-600" />
                                        <span>Secure Payment</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <Truck className="h-4 w-4 text-blue-600" />
                                        <span>Fast Delivery</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <CreditCard className="h-4 w-4 text-purple-600" />
                                        <span>COD Available</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2.5 md:py-3 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm md:text-base shadow-md hover:shadow-lg"
                            >
                                Proceed to Checkout
                                <ArrowRight className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => navigate('/products')}
                                className="w-full mt-3 text-gray-600 text-xm md:text-sm py-2 hover:text-orange-600 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>

               
            </div>
        </div>
    );
};

export default CartPage;