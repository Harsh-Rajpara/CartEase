import api from './api';

const addressService = {
    // Add new address
    addAddress: async (addressData) => {
        try {
            const response = await api.post('/address/add', addressData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get all addresses
    getMyAddresses: async () => {
        try {
            const response = await api.get('/address/my-addresses');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update address
    updateAddress: async (addressId, addressData) => {
        try {
            const response = await api.put(`/address/${addressId}`, addressData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Delete address
    deleteAddress: async (addressId) => {
        try {
            const response = await api.delete(`/address/${addressId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Set default address
    setDefaultAddress: async (addressId) => {
        try {
            const response = await api.put(`/address/${addressId}/default`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default addressService;