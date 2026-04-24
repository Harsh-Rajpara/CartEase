// components/admin/Users.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Mail,
  Phone,
  Calendar,
  Loader,
  AlertCircle,
  RefreshCw,
  UserCog,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmUser, setConfirmUser] = useState(null);
const [confirmAction, setConfirmAction] = useState(null); // 'admin' or 'user'
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/users');
      
      if (response.data.success) {
        const formattedUsers = response.data.data.map(user => ({
          id: user._id,
          name: user.fullName,
          email: user.email,
          phone: user.phone || 'N/A',
          role: user.role,
          joinDate: user.createdAt,
          orders: user.ordersCount || 0,
          totalSpent: user.totalSpent || 0,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified
        }));
        setUsers(formattedUsers);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    setUpdating(true);
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      
      if (response.data.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-green-100 text-green-800'
    };
    return roles[role] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Calculate stats
  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    user: users.filter(u => u.role === 'user').length
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
        <h3 className="text-lg font-medium text-red-800">Error loading users</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchUsers}
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
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-600 mt-1">Manage all registered users</p>
        </div>
        <button
          onClick={fetchUsers}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Admin</p>
          <p className="text-2xl font-bold text-purple-600">{stats.admin}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Customers</p>
          <p className="text-2xl font-bold text-green-600">{stats.user}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-orange-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-orange-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No users found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Clear search
                      </button>
                    )}
                   </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{user.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">ID: {user.id?.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.orders} orders
                      {user.totalSpent > 0 && (
                        <div className="text-xs text-gray-500">{formatCurrency(user.totalSpent)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <UserCog className="h-4 w-4" />
                        Manage Role
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
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
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

      {/* User Details Modal - Role Update */}
{selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ margin: 0, marginTop: 0 }}>
    <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">User Details</h2>
          <button
            onClick={() => setSelectedUser(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* User Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl text-blue-600 font-medium">{selectedUser.name?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
            <p className="text-sm text-gray-500 font-mono">ID: {selectedUser.id}</p>
            <p className="text-sm text-gray-500">
              Role: <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(selectedUser.role)}`}>
                {selectedUser.role?.charAt(0).toUpperCase() + selectedUser.role?.slice(1)}
              </span>
            </p>
          </div>
        </div>

        {/* Contact Information Grid */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Contact Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-sm break-all">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{selectedUser.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Joined Date</p>
              <p className="font-medium">{formatDate(selectedUser.joinDate)}</p>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Verification Status</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email Verification</p>
              <div className="flex items-center gap-2 mt-1">
                {selectedUser.isEmailVerified ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-600">Not Verified</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Verification</p>
              <div className="flex items-center gap-2 mt-1">
                {selectedUser.isPhoneVerified ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-600">Not Verified</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Order Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{selectedUser.orders}</p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedUser.totalSpent)}</p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with Action Buttons */}
      <div className="sticky bottom-0 bg-gray-50 p-6 border-t">
        <div className="flex justify-end gap-3 flex-wrap">
          {/* Role Update Buttons */}
          {selectedUser.role !== 'user' && (
            <button
              onClick={() => {
                setConfirmUser(selectedUser);
                setConfirmAction('user');
                setShowConfirmModal(true);
              }}
              disabled={updating}
              className="px-4 py-2 rounded-lg flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <Shield className="h-4 w-4" />
              Make User
            </button>
          )}
          
          {selectedUser.role !== 'admin' && (
            <button
              onClick={() => {
                setConfirmUser(selectedUser);
                setConfirmAction('admin');
                setShowConfirmModal(true);
              }}
              disabled={updating}
              className="px-4 py-2 rounded-lg flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              <Shield className="h-4 w-4" />
              Make Admin
            </button>
          )}
          
          {/* Close Button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* User Role Confirmation Modal */}
{showConfirmModal && confirmUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" style={{ margin: 0, marginTop: 0 }}>
    <div className="bg-white rounded-lg w-full max-w-md">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {confirmAction === 'admin' && <Shield className="h-8 w-8 text-purple-500" />}
          {confirmAction === 'user' && <Shield className="h-8 w-8 text-green-500" />}
          <h3 className="text-lg font-semibold text-gray-800">
            {confirmAction === 'admin' && 'Make Admin'}
            {confirmAction === 'user' && 'Make Regular User'}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          {confirmAction === 'admin' && `Are you sure you want to make "${confirmUser.name}" an Admin?`}
          {confirmAction === 'user' && `Are you sure you want to make "${confirmUser.name}" a regular User?`}
        </p>
        
       
        
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setShowConfirmModal(false);
              setConfirmUser(null);
              setConfirmAction(null);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (confirmAction === 'admin') {
                updateUserRole(confirmUser.id, 'admin');
              } else if (confirmAction === 'user') {
                updateUserRole(confirmUser.id, 'user');
              }
              setShowConfirmModal(false);
              setConfirmUser(null);
              setConfirmAction(null);
            }}
            disabled={updating}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white ${
              confirmAction === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'
            } disabled:opacity-50`}
          >
            {updating && <Loader className="h-4 w-4 animate-spin" />}
            {!updating && (confirmAction === 'admin' ? <Shield className="h-4 w-4" /> : <Shield className="h-4 w-4" />)}
            {confirmAction === 'admin' && 'Yes, Make Admin'}
            {confirmAction === 'user' && 'Yes, Make User'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminUsers;