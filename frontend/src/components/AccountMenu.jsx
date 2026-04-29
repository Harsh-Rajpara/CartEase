// frontend/src/components/AccountMenu.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    User, ShoppingBag, MapPin, LogOut, ChevronRight,
    Loader2
} from 'lucide-react';
import ProfileModal from './ProfileModal';

const AccountMenu = ({ user, onClose, onLogout }) => {
    const menuRef = useRef(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleProfileClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Profile clicked - opening modal');
        setShowProfileModal(true);
        // Don't close the menu immediately, let modal open first
        // onClose(); 
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsLoggingOut(true);
        
        try {
            // Call the logout function from parent
            await onLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };


    const menuItems = [
        { icon: User, label: 'My Profile', onClick: handleProfileClick, color: 'text-blue-600' },
        { icon: ShoppingBag, label: 'My Orders', path: '/orders', color: 'text-green-600' },
        { icon: MapPin, label: 'Saved Addresses', path: '/addresses', color: 'text-red-600' },
    ];

    const displayName = user?.fullName || 'User';
    const displayEmail = user?.email || user?.phone || '';

    return (
        <>
            <div 
                ref={menuRef}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
            >
                {/* User Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
                    <div className="flex items-center">
                        <div className="bg-white rounded-full p-2 shadow-md">
                            <User className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="ml-3 text-white">
                            <p className="font-semibold text-lg">{displayName.split(' ')[0]}</p>
                            <p className="text-xs text-orange-100 mt-0.5 truncate max-w-[180px]">{displayEmail}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                        <span className="text-xs bg-orange-500 px-2 py-0.5 rounded-full">
                            {user?.role === 'seller' ? 'Seller Account' : 'User Account'}
                        </span>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                    {menuItems.map((item, index) => (
                        item.path ? (
                            <Link
                                key={index}
                                to={item.path}
                                onClick={onClose}
                                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center">
                                    <div className={`${item.color} p-1 rounded-md group-hover:scale-110 transition-transform`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{item.label}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                            </Link>
                        ) : (
                            <button
                                key={index}
                                onClick={item.onClick}
                                className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors group text-left"
                            >
                                <div className="flex items-center">
                                    <div className={`${item.color} p-1 rounded-md group-hover:scale-110 transition-transform`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{item.label}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                            </button>
                        )
                    ))}
                </div>

                {/* Logout Button */}
                <div className="border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center w-full px-6 py-3 hover:bg-red-50 transition-colors group "
                    >
                        {isLoggingOut ? (
                            <>
                                <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
                                <span className="ml-3 text-sm text-red-600 font-medium">Logging out...</span>
                            </>
                        ) : (
                            <>
                                <LogOut className="h-5 w-5 text-red-500 group-hover:text-red-600" />
                                <span className="ml-3 text-sm text-red-600 font-medium group-hover:text-red-700">Logout</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

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

export default AccountMenu;