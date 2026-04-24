// frontend/src/components/ProfileModal.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Phone, Calendar, X } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user } = useSelector((state) => state.auth);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md my-8 md:my-0 mx-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: 'calc(100vh - 4rem)' }}
            >
                {/* Header - Sticky */}
                <div className="sticky top-0 bg-white rounded-t-lg">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">My Profile</h2>
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            aria-label="Close modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
                    <div className="p-4 sm:p-6">
                        {/* Avatar */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full p-3 shadow-md">
                                <User className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="space-y-4 sm:space-y-3">
                            <div className="flex items-start sm:items-center">
                                <User className="h-4 w-4 text-gray-400 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <div className="ml-3">
                                    <p className="text-xs text-gray-500">Full Name</p>
                                    <p className="text-sm sm:text-base font-medium text-gray-900 break-words">{user?.fullName || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start sm:items-center">
                                <Mail className="h-4 w-4 text-gray-400 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <div className="ml-3">
                                    <p className="text-xs text-gray-500">Email Address</p>
                                    <p className="text-sm sm:text-base font-medium text-gray-900 break-words">{user?.email || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start sm:items-center">
                                <Phone className="h-4 w-4 text-gray-400 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <div className="ml-3">
                                    <p className="text-xs text-gray-500">Phone Number</p>
                                    <p className="text-sm sm:text-base font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start sm:items-center">
                                <User className="h-4 w-4 text-gray-400 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <div className="ml-3">
                                    <p className="text-xs text-gray-500">Gender</p>
                                    <p className="text-sm sm:text-base font-medium text-gray-900 capitalize">{user?.gender || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-start sm:items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <div className="ml-3">
                                    <p className="text-xs text-gray-500">Date of Birth</p>
                                    <p className="text-sm sm:text-base font-medium text-gray-900">
                                        {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not specified'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Account Type */}
                        <div className="mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Account Type</p>
                            <p className="text-sm sm:text-base font-medium text-gray-900">
                                {user?.role === 'seller' ? 'Seller Account' : 'Customer Account'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer - Sticky */}
                {/* <div className="sticky bottom-0 bg-white rounded-b-lg">
                    <div className="p-4 border-t">
                        <button 
                            onClick={onClose} 
                            className="w-full px-4 py-2.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm sm:text-base"
                        >
                            Close
                        </button>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default ProfileModal;