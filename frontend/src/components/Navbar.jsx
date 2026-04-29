// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Search, Menu, X, ChevronDown, User, ShoppingBag, MapPin, Heart, LogOut, Package } from 'lucide-react';
import { logout } from '../store/authSlice';
import api from '../services/api';
import AccountMenu from './AccountMenu';
import ProfileModal from './ProfileModal'; // Import ProfileModal

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false); // Add this state
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Get cart items from Redux store
    const cartItems = useSelector((state) => state.cart.items);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    
    // Show number of unique items (not total quantity)
    const numberOfItems = cartItems.length;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?search=${encodeURIComponent(searchTerm)}`);
            setIsOpen(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) {
            searchInput.focus();
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            dispatch(logout());
            navigate('/');
        } catch (error) {
            dispatch(logout());
            navigate('/');
        }
        setShowAccountMenu(false);
    };

    const handleProfileClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Profile clicked - opening modal');
        setShowProfileModal(true);
        // Close mobile menu if open
        setIsOpen(false);
        // Close account menu if open
        setShowAccountMenu(false);
    };

    const userName = user?.fullName?.split(' ')[0] || 'Account';
    const firstLetter = userName.charAt(0).toUpperCase();

    return (
        <>
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center">
                            <span className="text-orange-600 text-2xl font-bold">CartEase</span>
                        </Link>

                        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                            <form onSubmit={handleSearch} className="w-full">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search for products, brands and more..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 pr-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm ? (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="absolute right-3 top-2.5 group"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-5 w-5 text-gray-400 hover:text-orange-600 transition-colors" />
                                        </button>
                                    ) : (
                                        <button type="submit" className="absolute right-3 top-2.5">
                                            <Search className="h-5 w-5 text-gray-400 hover:text-orange-600 transition-colors" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="hidden md:flex items-center space-x-6">
                            {isAuthenticated ? (
                                <>
                                    {user?.role === 'seller' && (
                                        <Link to="/seller/dashboard" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                                            Seller Hub
                                        </Link>
                                    )}
                                    {user?.role === 'admin' && (
                                        <Link to="/admin/dashboard" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                                            Admin Hub
                                        </Link>
                                    )}
                                    
                                    {/* Cart Icon - Only show when logged in */}
                                    <Link to="/cart" className="text-gray-700 hover:text-orange-600 relative transition-colors group">
                                        <ShoppingCart className="h-6 w-6" />
                                        {numberOfItems > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center text-xs font-medium">
                                                {numberOfItems > 99 ? '99+' : numberOfItems}
                                            </span>
                                        )}
                                    </Link>
                                    
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowAccountMenu(!showAccountMenu)}
                                            className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 focus:outline-none transition-colors"
                                        >
                                            <div className="bg-orange-100 rounded-full w-8 h-8 flex items-center justify-center">
                                                <span className="text-orange-600 font-semibold text-sm">{firstLetter}</span>
                                            </div>
                                            <span className="text-sm font-medium">{userName}</span>
                                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAccountMenu ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {showAccountMenu && (
                                            <AccountMenu 
                                                user={user} 
                                                onClose={() => setShowAccountMenu(false)} 
                                                onLogout={handleLogout}
                                                onProfileClick={handleProfileClick} // Pass this prop
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-200 font-semibold"
                                >
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Icons - Cart only shows when logged in */}
                        <div className="md:hidden flex items-center space-x-4">
                            {/* Cart Icon - Only show when logged in */}
                            {isAuthenticated && (
                                <Link to="/cart" className="text-gray-700 relative hover:text-orange-600 transition-colors">
                                    <ShoppingCart className="h-6 w-6" />
                                    {numberOfItems > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center text-xs font-medium">
                                            {numberOfItems > 99 ? '99+' : numberOfItems}
                                        </span>
                                    )}
                                </Link>
                            )}
                            
                            {!isAuthenticated && (
                                <Link to="/login" className="text-orange-600 text-base font-semibold">
                                    Login
                                </Link>
                            )}
                            
                            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-orange-600 transition-colors">
                                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>

                    <div className="md:hidden pb-3">
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 pr-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm ? (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-2.5 group"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-5 w-5 text-gray-400 hover:text-orange-600 transition-colors" />
                                    </button>
                                ) : (
                                    <button type="submit" className="absolute right-3 top-2.5">
                                        <Search className="h-5 w-5 text-gray-400 hover:text-orange-600 transition-colors" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Mobile Menu - Fixed with all menu items */}
                    {isOpen && (
                        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto">
                            <div className="flex flex-col py-4">
                                {isAuthenticated ? (
                                    <>
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 flex items-center space-x-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                                            <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                                                <span className="text-white font-bold text-xl">{firstLetter}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-base">{user?.fullName}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{user?.email || user?.phone}</p>
                                                {user?.role === 'seller' && (
                                                    <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                                        Seller Account
                                                    </span>
                                                )}
                                                {user?.role === 'admin' && (
                                                    <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                        Admin Account
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            {/* My Profile - Fixed: Changed from 'to' to button with onClick */}
                                            <button
                                                onClick={handleProfileClick}
                                                className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                                            >
                                                <User className="h-5 w-5 text-blue-600" />
                                                <span className="ml-3 text-sm font-medium">My Profile</span>
                                            </button>

                                            {/* My Orders */}
                                            <Link 
                                                to="/orders" 
                                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <ShoppingBag className="h-5 w-5 text-green-600" />
                                                <span className="ml-3 text-sm font-medium">My Orders</span>
                                            </Link>

                                            {/* Saved Addresses */}
                                            <Link 
                                                to="/addresses" 
                                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <MapPin className="h-5 w-5 text-red-600" />
                                                <span className="ml-3 text-sm font-medium">Saved Addresses</span>
                                            </Link>

                                            {/* Wishlist */}
                                            <Link 
                                                to="/wishlist" 
                                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Heart className="h-5 w-5 text-pink-600" />
                                                <span className="ml-3 text-sm font-medium">Wishlist</span>
                                            </Link>

                                            {/* Seller Dashboard (if seller) */}
                                            {user?.role === 'seller' && (
                                                <Link 
                                                    to="/seller/dashboard" 
                                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span className="ml-3 text-sm font-medium">Seller Dashboard</span>
                                                </Link>
                                            )}

                                            {/* My Products (if seller) */}
                                            {user?.role === 'seller' && (
                                                <Link 
                                                    to="/seller/products" 
                                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <Package className="h-5 w-5 text-indigo-600" />
                                                    <span className="ml-3 text-sm font-medium">My Products</span>
                                                </Link>
                                            )}

                                            {/* Admin Dashboard (if admin) */}
                                            {user?.role === 'admin' && (
                                                <Link 
                                                    to="/admin/dashboard" 
                                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="ml-3 text-sm font-medium">Admin Dashboard</span>
                                                </Link>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-gray-100 my-2"></div>

                                        {/* Logout Button */}
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            <span className="ml-3 text-sm font-medium">Logout</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="px-4 py-8 text-center">
                                        <Link 
                                            to="/login" 
                                            className="block w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-all duration-200 font-semibold"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Login / Sign Up
                                        </Link>
                                        <p className="text-xs text-gray-500 mt-3">
                                            New customer? Create an account to get started
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Profile Modal - Render conditionally */}
            {showProfileModal && (
                <ProfileModal 
                    isOpen={showProfileModal} 
                    onClose={() => {
                        console.log('Closing modal');
                        setShowProfileModal(false);
                    }} 
                />
            )}
        </>
    );
};

export default Navbar;