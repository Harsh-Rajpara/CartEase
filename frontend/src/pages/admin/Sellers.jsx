// components/admin/Sellers.jsx
import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building,
  Package,
  Eye,
  Loader,
  AlertCircle,
  RefreshCw,
  CreditCard,
  MapPin,
  User,
  Calendar,
  DollarSign,
  X,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterApproval, setFilterApproval] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  // Confirmation popup state
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    sellerId: null,
    newStatus: '',
    statusName: ''
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/sellers');
      
      if (response.data.success) {
        const formattedSellers = response.data.data.map(seller => ({
          id: seller._id,
          storeName: seller.businessName || seller.storeName,
          ownerName: seller.fullName,
          email: seller.email,
          phone: seller.phone,
          status: seller.isActive ? 'active' : 'inactive',
          approvalStatus: seller.verificationStatus || 'pending',
          joinDate: seller.createdAt,
          totalProducts: seller.totalProducts || 0,
          totalSales: seller.totalOrders || 0,
          revenue: seller.totalRevenue || 0,
          address: `${seller.businessAddress || ''}, ${seller.city || ''}, ${seller.state || ''} - ${seller.pincode || ''}`,
          businessType: seller.businessType,
          gstin: seller.gstin,
          panNumber: seller.panNumber,
          bankDetails: seller.bankDetails,
          storeDescription: seller.storeDescription,
          website: seller.website
        }));
        setSellers(formattedSellers);
      } else {
        setError('Failed to load sellers');
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setError(error.response?.data?.message || 'Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const updateApprovalStatus = async (sellerId, newStatus) => {
    const statusNames = {
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending'
    };
    
    setUpdating(true);
    try {
      const response = await api.put(`/admin/sellers/${sellerId}/verify`, { status: newStatus });
      
      if (response.data.success) {
        setSellers(sellers.map(seller => 
          seller.id === sellerId ? { ...seller, approvalStatus: newStatus } : seller
        ));
        if (selectedSeller && selectedSeller.id === sellerId) {
          setSelectedSeller({ ...selectedSeller, approvalStatus: newStatus });
        }
        
      }
    } catch (error) {
      console.error('Error updating seller:', error);
    } finally {
      setUpdating(false);
      setConfirmationPopup({ isOpen: false, sellerId: null, newStatus: '', statusName: '' });
    }
  };

  const openConfirmationPopup = (sellerId, newStatus) => {
    const statusNames = {
      approved: 'APPROVED',
      rejected: 'REJECTED',
      pending: 'PENDING'
    };
    setConfirmationPopup({
      isOpen: true,
      sellerId: sellerId,
      newStatus: newStatus,
      statusName: statusNames[newStatus]
    });
  };

  const getApprovalBadge = (status) => {
    const statuses = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return statuses[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getApprovalIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getApprovalLabel = (status) => {
    const labels = {
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected'
    };
    return labels[status?.toLowerCase()] || status || 'Pending';
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

  // Filter sellers
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterApproval === 'all' || seller.approvalStatus?.toLowerCase() === filterApproval.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSellers = filteredSellers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);

  // Calculate stats
  const stats = {
    total: sellers.length,
    approved: sellers.filter(s => s.approvalStatus?.toLowerCase() === 'approved').length,
    pending: sellers.filter(s => s.approvalStatus?.toLowerCase() === 'pending').length,
    rejected: sellers.filter(s => s.approvalStatus?.toLowerCase() === 'rejected').length,
    totalProducts: sellers.reduce((sum, s) => sum + (s.totalProducts || 0), 0),
    totalRevenue: sellers.reduce((sum, s) => sum + (s.revenue || 0), 0)
  };

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
        <h3 className="text-lg font-medium text-red-800">Error loading sellers</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button onClick={fetchSellers} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
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
          <h1 className="text-2xl font-bold text-gray-800">Sellers Management</h1>
          <p className="text-gray-600 mt-1">Manage seller accounts and approvals</p>
        </div>
        <button
          onClick={fetchSellers}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>
    
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total Sellers</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by store name, owner name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-orange-500"
            />
          </div>
          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
            className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:border-transparent focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSellers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Store className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No sellers found</p>
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="mt-2 text-orange-600 hover:text-orange-700">
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Store className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{seller.storeName}</div>
                          <div className="text-xs text-gray-500">ID: {seller.id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{seller.ownerName}</div>
                      <div className="text-xs text-gray-500">{seller.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1 text-gray-400" />
                        {seller.totalProducts}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(seller.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getApprovalBadge(seller.approvalStatus)}`}>
                        {getApprovalIcon(seller.approvalStatus)}
                        {getApprovalLabel(seller.approvalStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(seller.joinDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => setSelectedSeller(seller)} 
                        className="text-orange-600 hover:text-orange-800 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSellers.length)} of {filteredSellers.length} sellers
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 border rounded-lg bg-orange-50 text-orange-600">{currentPage}</span>
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

      {/* Seller Details Modal */}
{selectedSeller && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ margin: 0, marginTop: 0 }}>
    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Store className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{selectedSeller.storeName}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Seller ID: {selectedSeller.id}</p>
              {/* Status directly below Seller ID */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className={`inline-flex items-center gap-2 px-2.5 py-1 text-sm font-semibold rounded-full ${
                  selectedSeller.approvalStatus === 'approved' 
                    ? 'bg-green-100' 
                    : selectedSeller.approvalStatus === 'rejected'
                    ? 'bg-red-100'
                    : 'bg-yellow-100'
                }`}>
                  {getApprovalIcon(selectedSeller.approvalStatus)}
                  {getApprovalLabel(selectedSeller.approvalStatus)}
                </span>

              </div>
              
              {/* Optional date information */}
              {selectedSeller.approvalStatus === 'approved' && selectedSeller.approvedDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Approved on: {formatDate(selectedSeller.approvedDate)}
                </p>
              )}
              {selectedSeller.approvalStatus === 'rejected' && selectedSeller.rejectedDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Rejected on: {formatDate(selectedSeller.rejectedDate)}
                </p>
              )}
              {selectedSeller.approvalStatus === 'pending' && selectedSeller.requestedDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Requested on: {formatDate(selectedSeller.requestedDate)}
                </p>
              )}
            </div>
          </div>
          <button onClick={() => setSelectedSeller(null)} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Store Information */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Store Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Store Name</p>
              <p className="font-medium">{selectedSeller.storeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Type</p>
              <p className="font-medium">{selectedSeller.businessType || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Store Description</p>
              <p className="font-medium">{selectedSeller.storeDescription || 'No description'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <p className="font-medium">{selectedSeller.website || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="border-t pt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <User className="h-5 w-5" />
            Owner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Owner Name</p>
              <p className="font-medium">{selectedSeller.ownerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium flex items-center gap-1">
                <Mail className="h-4 w-4 text-gray-400" />
                {selectedSeller.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium flex items-center gap-1">
                <Phone className="h-4 w-4 text-gray-400" />
                {selectedSeller.phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Joined Date</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatDate(selectedSeller.joinDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="border-t pt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">GSTIN</p>
              <p className="font-medium">{selectedSeller.gstin || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">PAN Number</p>
              <p className="font-medium">{selectedSeller.panNumber || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium flex items-start gap-1">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                {selectedSeller.address || 'No address provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        {selectedSeller.bankDetails && (
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Account Holder Name</p>
                <p className="font-medium">{selectedSeller.bankDetails.accountHolderName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank Name</p>
                <p className="font-medium">{selectedSeller.bankDetails.bankName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-medium">{selectedSeller.bankDetails.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IFSC Code</p>
                <p className="font-medium">{selectedSeller.bankDetails.ifscCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="border-t pt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Seller Stats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-xl font-bold text-blue-600">{selectedSeller.totalProducts}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-xl font-bold text-green-600">{selectedSeller.totalSales}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(selectedSeller.revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Bottom */}
      <div className="sticky bottom-0 bg-gray-50 p-6 border-t">
        <div className="flex justify-end gap-3 flex-wrap">
          {/* Approve Button - Hide if already approved */}
          {selectedSeller.approvalStatus !== 'approved' && (
            <button
              onClick={() => openConfirmationPopup(selectedSeller.id, 'approved')}
              disabled={updating}
              className="px-4 py-2 rounded-lg flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
          )}
          
          {/* Reject Button - Hide if already rejected */}
          {selectedSeller.approvalStatus !== 'rejected' && (
            <button
              onClick={() => openConfirmationPopup(selectedSeller.id, 'rejected')}
              disabled={updating}
              className="px-4 py-2 rounded-lg flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 transition-all"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          )}
          
          {/* Pending Button - Hide if already pending */}
          {selectedSeller.approvalStatus !== 'pending' && (
            <button
              onClick={() => openConfirmationPopup(selectedSeller.id, 'pending')}
              disabled={updating}
              className="px-4 py-2 rounded-lg flex items-center gap-2 bg-yellow-600 text-white hover:bg-yellow-700 transition-all"
            >
              <Clock className="h-4 w-4" />
              Mark Pending
            </button>
          )}
          
          <button
            onClick={() => setSelectedSeller(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Custom Confirmation Popup */}
      {confirmationPopup.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ margin: 0, marginTop: 0 }}>
          <div className="bg-white rounded-lg w-full max-w-md mx-4 transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                Confirm Status Change
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to change the seller status to{' '}
                <span className="font-bold text-orange-600">
                  {confirmationPopup.statusName}
                </span>
                ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    updateApprovalStatus(confirmationPopup.sellerId, confirmationPopup.newStatus);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Yes, Confirm
                </button>
                <button
                  onClick={() => setConfirmationPopup({ isOpen: false, sellerId: null, newStatus: '', statusName: '' })}
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

export default Sellers;