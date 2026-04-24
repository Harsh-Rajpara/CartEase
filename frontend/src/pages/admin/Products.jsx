// components/admin/Products.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Eye, 
  Search, 
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
  RefreshCw,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import api from '../../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/admin/products');
      
      if (response.data.success) {
        const formattedProducts = response.data.data.map(product => ({
          id: product._id,
          _id: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          status: product.status || 'pending',
          image: product.images?.[0]?.url || '',
          createdAt: product.createdAt,
          description: product.description,
          brand: product.brand,
          originalPrice: product.originalPrice,
          discount: product.discount,
          seller: product.seller
        }));
        
        setProducts(formattedProducts);
        
        const pending = formattedProducts.filter(p => p.status === 'pending').length;
        const approved = formattedProducts.filter(p => p.status === 'approved').length;
        const rejected = formattedProducts.filter(p => p.status === 'rejected').length;
        
        setStats({
          total: formattedProducts.length,
          pending,
          approved,
          rejected
        });
      } else {
        setError('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (action, product) => {
    setConfirmAction(action);
    setConfirmProduct(product);
    setShowConfirmModal(true);
    setOpenDropdownId(null);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmProduct(null);
  };

  const handleApprove = async () => {
    if (!confirmProduct) return;
    
    setUpdating(true);
    
    try {
      const response = await api.patch(`/admin/products/${confirmProduct.id}/approve`);
      
      if (response.data.success) {
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === confirmProduct.id 
              ? { ...product, status: 'approved' }
              : product
          )
        );
        
        setStats(prevStats => ({
          ...prevStats,
          pending: prevStats.pending - 1,
          approved: prevStats.approved + 1
        }));
        
        closeConfirmModal();
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error approving product:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!confirmProduct) return;
    
    setUpdating(true);
    
    try {
      const response = await api.patch(`/admin/products/${confirmProduct.id}/reject`);
      
      if (response.data.success) {
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === confirmProduct.id 
              ? { ...product, status: 'rejected' }
              : product
          )
        );
        
        setStats(prevStats => ({
          ...prevStats,
          pending: prevStats.pending - 1,
          rejected: prevStats.rejected + 1
        }));
        
        closeConfirmModal();
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleMoveToPending = async () => {
    if (!confirmProduct) return;
    
    setUpdating(true);
    
    try {
      const response = await api.patch(`/admin/products/${confirmProduct.id}/pending`);
      
      if (response.data.success) {
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === confirmProduct.id 
              ? { ...product, status: 'pending' }
              : product
          )
        );
        
        setStats(prevStats => {
          let newStats = { ...prevStats };
          if (confirmProduct.status === 'approved') {
            newStats.approved -= 1;
            newStats.pending += 1;
          } else if (confirmProduct.status === 'rejected') {
            newStats.rejected -= 1;
            newStats.pending += 1;
          }
          return newStats;
        });
        
        closeConfirmModal();
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error moving product:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
    setOpenDropdownId(null);
  };

  const copyToClipboard = async (text, e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleDropdown = (productId, e) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === productId ? null : productId);
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: <Clock className="h-3 w-3 mr-1" /> },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: <XCircle className="h-3 w-3 mr-1" /> }
    };
    return statuses[status] || statuses.pending;
  };

  const getAvailableActions = (status) => {
    const actions = [];
    switch(status) {
      case 'pending':
        actions.push({ action: 'approve', label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600 hover:bg-green-50' });
        actions.push({ action: 'reject', label: 'Reject', icon: <XCircle className="h-4 w-4" />, color: 'text-red-600 hover:bg-red-50' });
        break;
      case 'approved':
        actions.push({ action: 'reject', label: 'Reject', icon: <XCircle className="h-4 w-4" />, color: 'text-red-600 hover:bg-red-50' });
        actions.push({ action: 'pending', label: 'Move to Pending', icon: <RotateCcw className="h-4 w-4" />, color: 'text-orange-600 hover:bg-orange-50' });
        break;
      case 'rejected':
        actions.push({ action: 'approve', label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600 hover:bg-green-50' });
        actions.push({ action: 'pending', label: 'Move to Pending', icon: <RotateCcw className="h-4 w-4" />, color: 'text-orange-600 hover:bg-orange-50' });
        break;
      default:
        break;
    }
    return actions;
  };

  const handleActionClick = (action, product, e) => {
    e.stopPropagation();
    openConfirmModal(action, product);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-800">Error loading products</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-600 mt-1">Manage and approve products from sellers</p>
        </div>
        <button
          onClick={fetchProducts}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, category, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-orange-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)} 
            className=" px-4 pr-8  py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-orange-500 "
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No products found</p>
                  </td>
                 </tr>
              ) : (
                currentProducts.map((product) => {
                  const statusBadge = getStatusBadge(product.status);
                  const availableActions = getAvailableActions(product.status);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all max-w-[200px]">
                            {product.id}
                          </code>
                          <button
                            onClick={(e) => copyToClipboard(product.id, e)}
                            className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                            title="Copy ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-8 w-8 rounded-lg object-cover"
                            onError={(e) => e.target.src = ''}
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
                          {statusBadge.icon}
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewDetails(product)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            title="View Product"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          
                          {/* Dropdown for Actions */}
                          {/* <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(product.id, e)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              title="Actions"
                            >
                              Actions
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            
                            {openDropdownId === product.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  {availableActions.map((action) => (
                                    <button
                                      key={action.action}
                                      onClick={(e) => handleActionClick(action.action, product, e)}
                                      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${action.color}`}
                                    >
                                      {action.icon}
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div> */}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 border rounded-lg bg-blue-50 text-blue-600">{currentPage}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
{showDetailsModal && selectedProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ margin: 0, marginTop: 0 }}>
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
          <button
            onClick={() => setShowDetailsModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img 
            src={selectedProduct.image} 
            alt={selectedProduct.name}
            className="w-24 h-24 rounded-lg object-cover"
            onError={(e) => e.target.src = ''}
          />
          <div>
            <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
            <p className="text-sm text-gray-500 font-mono">ID: {selectedProduct.id}</p>
            <p className="text-sm text-gray-500">Category: {selectedProduct.category}</p>
            {/* Status moved here - below category */}
            <p className="text-sm text-gray-500 mt-1">
              Status:{" "}
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedProduct.status).color}`}>
                {getStatusBadge(selectedProduct.status).icon}
                {getStatusBadge(selectedProduct.status).label}
              </span>
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium">{formatCurrency(selectedProduct.price)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Original Price</p>
            <p className="font-medium">{formatCurrency(selectedProduct.originalPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Discount</p>
            <p className="font-medium">{selectedProduct.discount || 0}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Stock</p>
            <p className="font-medium">{selectedProduct.stock}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Brand</p>
            <p className="font-medium">{selectedProduct.brand || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-sm">{selectedProduct.description || 'No description available'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="text-sm">{formatDate(selectedProduct.createdAt)}</p>
          </div>
        </div>
      </div>
      
      <div className="sticky bottom-0 bg-gray-50 p-6 border-t">
        <div className="flex justify-end gap-3 flex-wrap">
          {getAvailableActions(selectedProduct.status).map((action) => (
            <button
              key={action.action}
              onClick={() => openConfirmModal(action.action, selectedProduct)}
              disabled={updating}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                action.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                action.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
          
          <button
            onClick={() => window.open(`/products/${selectedProduct.id}`, '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View on Store
          </button>
          
          <button
            onClick={() => setShowDetailsModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* Confirmation Modal */}
      {showConfirmModal && confirmProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" style={{ margin: 0, marginTop: 0 }}>
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {confirmAction === 'approve' && <CheckCircle className="h-8 w-8 text-green-500" />}
                {confirmAction === 'reject' && <XCircle className="h-8 w-8 text-red-500" />}
                {confirmAction === 'pending' && <RotateCcw className="h-8 w-8 text-orange-500" />}
                <h3 className="text-lg font-semibold text-gray-800">
                  {confirmAction === 'approve' && 'Approve Product'}
                  {confirmAction === 'reject' && 'Reject Product'}
                  {confirmAction === 'pending' && 'Move to Pending'}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                {confirmAction === 'approve' && `Are you sure you want to approve "${confirmProduct.name}"?`}
                {confirmAction === 'reject' && `Are you sure you want to reject "${confirmProduct.name}"?`}
                {confirmAction === 'pending' && `Are you sure you want to move "${confirmProduct.name}" back to pending?`}
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeConfirmModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmAction === 'approve') handleApprove();
                    else if (confirmAction === 'reject') handleReject();
                    else if (confirmAction === 'pending') handleMoveToPending();
                  }}
                  disabled={updating}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white ${
                    confirmAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    confirmAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-orange-600 hover:bg-orange-700'
                  } disabled:opacity-50`}
                >
                  {updating ? <Loader className="h-4 w-4 animate-spin" /> : (
                    confirmAction === 'approve' ? <CheckCircle className="h-4 w-4" /> :
                    confirmAction === 'reject' ? <XCircle className="h-4 w-4" /> :
                    <RotateCcw className="h-4 w-4" />
                  )}
                  {confirmAction === 'approve' && 'Yes, Approve'}
                  {confirmAction === 'reject' && 'Yes, Reject'}
                  {confirmAction === 'pending' && 'Yes, Move'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;