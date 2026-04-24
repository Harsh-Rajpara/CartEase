import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Eye, 
  AlertCircle, 
  Plus, 
  Search, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  X,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { useSelector } from 'react-redux';
import sellerService from '../../services/seller.service';

const SellerProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [updatingProduct, setUpdatingProduct] = useState(null);
  
  // Stock update modal state
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  });
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await sellerService.getSellerProducts();
      console.log('WHAT IS RESPONSE?', response);
      console.log('RESPONSE TYPE:', typeof response);
      console.log('RESPONSE.SUCCESS?', response?.success);
      if (response.success) {
        const enhancedProducts = response.data.map(product => ({
          ...product,
          approvalStatus: product.status || 'pending',
          status: product.stock === 0 ? 'inactive' : (product.stock < 10 ? 'low-stock' : 'active'),
          sold: product.sold || 0
        }));
        setProducts(enhancedProducts);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setNewStockValue(product.stock.toString());
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setSelectedProduct(null);
    setNewStockValue('');
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct) return;
    
    const newStock = parseInt(newStockValue);
    if (isNaN(newStock) || newStock < 0) {
      showToast('Please enter a valid stock quantity', 'error');
      return;
    }

    setUpdatingStock(true);
    try {
      const response = await sellerService.updateProductStock(selectedProduct._id, { stock: newStock });
      if (response.success) {
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === selectedProduct._id 
              ? { ...p, stock: newStock }
              : p
          )
        );
        showToast('Stock updated successfully!', 'success');
        closeStockModal();
      }
    } catch (err) {
      console.error('Error updating stock:', err);
      showToast(err.message || 'Failed to update stock', 'error');
    } finally {
      setUpdatingStock(false);
    }
  };

  // Open delete confirmation popup
  const openDeleteConfirmation = (productId, productName) => {
    setDeleteConfirmation({
      isOpen: true,
      productId: productId,
      productName: productName
    });
  };

  // Close delete confirmation popup
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      productId: null,
      productName: ''
    });
  };

  // Confirm delete product
  const confirmDelete = async () => {
    try {
      const response = await sellerService.deleteProduct(deleteConfirmation.productId);
      if (response.success) {
        setProducts(products.filter(p => p._id !== deleteConfirmation.productId));
        showToast('Product deleted successfully!', 'success');
        closeDeleteConfirmation();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const getApprovalStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending Approval' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, text: 'Draft' };
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'low-stock') return matchesSearch && product.stock < 10 && product.stock > 0;
    if (filter === 'approved') return matchesSearch && product.approvalStatus === 'approved';
    if (filter === 'pending') return matchesSearch && product.approvalStatus === 'pending';
    if (filter === 'rejected') return matchesSearch && product.approvalStatus === 'rejected';
    return matchesSearch;
  });

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

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/seller/add-product"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
          >
            Add Product
          </Link>
          <button
            onClick={fetchProducts}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-orange-800">
          <strong>Note:</strong> New products and product updates (except stock) require admin approval before appearing on the store. 
          Stock updates are immediate and don't need approval.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-2 flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All ({products.length})
            </button>
            <button 
              onClick={() => setFilter('approved')} 
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'approved' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Approved ({products.filter(p => p.approvalStatus === 'approved').length})
            </button>
            <button 
              onClick={() => setFilter('pending')} 
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'pending' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Pending ({products.filter(p => p.approvalStatus === 'pending').length})
            </button>
            <button 
              onClick={() => setFilter('rejected')} 
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'rejected' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Rejected ({products.filter(p => p.approvalStatus === 'rejected').length})
            </button>
            <button 
              onClick={() => setFilter('low-stock')} 
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'low-stock' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Low Stock ({products.filter(p => p.stock < 10 && p.stock > 0).length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => {
                const ApprovalBadge = getApprovalStatusBadge(product.approvalStatus);
                const IconComponent = ApprovalBadge.icon;
                const isApproved = product.approvalStatus === 'approved';
                
                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-lg object-cover" 
                            src={product.images?.[0]?.url || ''} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{product.price?.toLocaleString()}</div>
                      {product.originalPrice > product.price && (
                        <div className="text-xs text-gray-500 line-through">₹{product.originalPrice?.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openStockModal(product)}
                        className={`px-3 py-1 text-sm rounded-lg transition ${
                          product.stock < 10 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {product.stock} units
                      </button>
                    </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${ApprovalBadge.color}`}>
                        <IconComponent className="h-3 w-3" />
                        {ApprovalBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/products/${product._id}`} 
                          className="text-blue-600 hover:text-blue-900"
                          title="View Product"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link 
                          to={`/seller/update-product/${product._id}`} 
                          className={`${isApproved ? 'text-green-600 hover:text-green-900' : 'text-gray-400 cursor-not-allowed pointer-events-none'}`}
                          title={isApproved ? "Update Product" : "Product pending approval - cannot edit until approved"}
                          onClick={(e) => {
                            if (!isApproved) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => openDeleteConfirmation(product._id, product.name)} 
                          className="text-red-600 hover:text-red-900"
                          title="Delete Product"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ margin: 0, marginTop: 0 }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Update Stock</h2>
              <button
                onClick={closeStockModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Product:</p>
                <p className="font-medium text-gray-800">{selectedProduct.name}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Stock:</p>
                <p className="font-medium text-gray-800">{selectedProduct.stock} units</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Stock Quantity
                </label>
                <input
                  type="number"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new stock quantity"
                  min="0"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={closeStockModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStockUpdate}
                  disabled={updatingStock}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStock ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Stock'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ margin: 0, marginTop: 0 }}>
          <div className="bg-white rounded-lg w-full max-w-md mx-4 transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                Confirm Delete
              </h3>
              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete this product?
              </p>
              <p className="font-semibold text-red-600 text-center mb-6">
                "{deleteConfirmation.productName}"
              </p>
             
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={closeDeleteConfirmation}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;