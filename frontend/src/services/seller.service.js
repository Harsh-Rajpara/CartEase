
import api from './api';

const sellerService = {
    // Get dashboard stats
    getDashboardStats: async () => {
        try {
            const response = await api.get('/seller/dashboard-stats');
            console.log('Dashboard stats response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Dashboard stats error:', error);
            return { 
                success: false, 
                data: {
                    totalProducts: 0,
                    totalOrders: 0,
                    totalRevenue: 0,
                    totalCustomers: 0,
                    avgRating: 0,
                    lowStock: 0,
                    revenueGrowth: 0,
                    orderGrowth: 0
                }
            };
        }
    },

    // Get seller orders
    getSellerOrders: async () => {
        try {
            const response = await api.get('/seller/orders');
            console.log('Seller orders response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Seller orders error:', error);
            return { success: false, data: [] };
        }
    },

    // Get sales chart data
    getSalesChartData: async (period = 'monthly') => {
        try {
            const response = await api.get(`/seller/sales-chart`, {
                params: { period }
            });
            
            if (response.data && response.data.success) {
                const transformedData = response.data.data.map(item => ({
                    month: item.month || item.label || item.name,
                    sales: item.sales || item.units || item.count || 0,
                    revenue: item.revenue || item.amount || 0
                }));
                return { ...response.data, data: transformedData };
            }
            return response.data;
        } catch (error) {
            console.error('Sales chart data error:', error);
            return { success: false, data: [], message: error.message };
        }
    },

    // Get revenue chart data
    getRevenueChartData: async (period = 'monthly') => {
        try {
            const response = await api.get(`/seller/revenue-chart`, {
                params: { period }
            });
            
            if (response.data && response.data.success) {
                const transformedData = response.data.data.map(item => ({
                    month: item.month || item.label || item.name,
                    revenue: item.revenue || item.amount || 0
                }));
                return { ...response.data, data: transformedData };
            }
            return response.data;
        } catch (error) {
            console.error('Revenue chart data error:', error);
            return { success: false, data: [], message: error.message };
        }
    },

    // Get combined chart data
    getChartData: async (period = 'monthly') => {
        try {
            const response = await api.get(`/seller/chart-data`, {
                params: { period }
            });
            return response.data;
        } catch (error) {
            console.error('Chart data error:', error);
            return { success: false, sales: [], revenue: [] };
        }
    },

    // ✅ Get seller products - CORRECT PATH
    getSellerProducts: async () => {
        try {
            // From productRoutes.js: router.get('/seller/products', ...)
            const response = await api.get('/products/seller/products');
            console.log('Seller products response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Seller products error:', error);
            return { success: false, data: [] };
        }
    },

    // ✅ Update only stock - CORRECT PATH
    updateProductStock: async (productId, stockData) => {
        try {
            // From productRoutes.js: router.patch('/:productId/stock', ...)
            const response = await api.patch(`/products/${productId}/stock`, stockData);
            return response.data;
        } catch (error) {
            console.error('Update stock error:', error);
            throw error;
        }
    },

    // ✅ Update full product - CORRECT PATH
    updateProduct: async (productId, productData) => {
        try {
            // From productRoutes.js: router.put('/:id', ...)
            const response = await api.put(`/products/${productId}`, productData);
            return response.data;
        } catch (error) {
            console.error('Update product error:', error);
            throw error;
        }
    },

    // ✅ Delete product - CORRECT PATH
    deleteProduct: async (productId) => {
        try {
            // From productRoutes.js: router.delete('/:id', ...)
            const response = await api.delete(`/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Delete product error:', error);
            throw error;
        }
    }
};

export default sellerService;