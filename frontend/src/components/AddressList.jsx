import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import addressService from '../services/address.service';

const AddressList = ({ onAddressSelect, selectedAddressId }) => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await addressService.getMyAddresses();
            setAddresses(response.data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    // const handleDeleteAddress = async (addressId) => {
    //     if (window.confirm('Are you sure you want to delete this address?')) {
    //         try {
    //             const response = await addressService.deleteAddress(addressId);
    //             if (response.success) {
    //                 await fetchAddresses();
    //                 if (selectedAddressId === addressId) {
    //                     onAddressSelect?.(null);
    //                 }
    //             }
    //         } catch (error) {
    //             console.error('Error deleting address:', error);
    //             alert('Failed to delete address');
    //         }
    //     }
    // };

    const handleManageAddresses = () => {
        navigate('/addresses');
    };

    // const handleAddNewAddress = () => {
    //     navigate('/addresses/new');
    // };

    return (
        <div className="space-y-4">
            {/* Header - Hidden on mobile, visible on desktop */}
            <div className="hidden sm:flex justify-between items-center">
                <h3 className="text-lg font-semibold">Saved Addresses</h3>
                <button
                    onClick={handleManageAddresses}
                    className="bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 text-sm flex items-center gap-1"
                >
                    Manage Address
                </button>
            </div>

            {/* Mobile header - Just the title */}
            <div className="sm:hidden">
                <h3 className="text-base font-semibold">Saved Addresses</h3>
            </div>

            {loading ? (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No address found</p>
                    <button
                        onClick={handleManageAddresses}
                        className="mt-2 text-orange-600 hover:text-orange-700"
                    >
                        Add your first address
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {addresses.map((address) => (
                            <div
                                key={address._id}
                                className={`border rounded-lg p-4 cursor-pointer transition ${
                                    selectedAddressId === address._id
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-orange-300'
                                }`}
                                onClick={() => onAddressSelect?.(address._id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700">{address.fullAddress}</p>
                                       
                                    </div>
                                 
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Manage Address Button - Below addresses on mobile, hidden on desktop */}
                    <div className="sm:hidden pt-2">
                        <button
                            onClick={handleManageAddresses}
                            className="w-full bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 text-sm flex items-center justify-center gap-2"
                        >
                            <MapPin className="h-4 w-4" />
                            Manage Addresses
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AddressList;