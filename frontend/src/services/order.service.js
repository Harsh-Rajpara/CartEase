import api from './api';

const orderService = {
    // Create new order from cart
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/orders/create', orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    
    // Get my orders (for user)
    getMyOrders: async () => {
        try {
            const response = await api.get('/orders/my-orders');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    
    // Get single order by ID
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    
    // Cancel order (user)
    cancelOrder: async (orderId, reason) => {
        try {
            const response = await api.put(`/orders/${orderId}/cancel`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    
    // Get seller orders (seller only)
    getSellerOrders: async () => {
        try {
            const response = await api.get('/orders/seller/orders');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    
    // Update order status (seller/admin)
    updateOrderStatus: async (orderId, status, comment) => {
        try {
            const response = await api.put(`/orders/${orderId}/status`, { status, comment });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    
    // Get all orders (admin only)
    getAllOrders: async (page = 1, status = '') => {
        try {
            const response = await api.get(`/orders/admin/all-orders?page=${page}&status=${status}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    
    // Get order statistics (admin only)
    getOrderStats: async () => {
        try {
            const response = await api.get('/orders/admin/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default orderService;