import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Check,
  X,
  AlertCircle,
  Loader,

} from "lucide-react";
import api from "../services/api";

const AddressesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // const { user } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  // const [showLimitModal, setShowLimitModal] = useState(false);
  const [formData, setFormData] = useState({
    flatHouseNo: "",
    areaStreet: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Handle edit from navigation state (coming from checkout)
  useEffect(() => {
    if (location.state?.editAddress) {
      const addressToEdit = location.state.editAddress;
      // Small delay to ensure addresses are loaded or form is ready
      setTimeout(() => {
        handleOpenEditForm(addressToEdit);
      }, 100);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/address/my-addresses");
      if (response.data.success) {
        setAddresses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showNotification("Failed to load addresses", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000,
    );
  };

  const handleOpenAddForm = () => {
    // Check if user already has 2 addresses
    if (addresses.length >= 2 && !editingAddress) {
      setShowLimitModal(true);
      return;
    }
    setEditingAddress(null);
    setFormData({
      flatHouseNo: "",
      areaStreet: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    });
    setShowAddressForm(true);
  };

  const handleOpenEditForm = (address) => {
    setEditingAddress(address);
    setFormData({
      flatHouseNo: address.flatHouseNo || "",
      areaStreet: address.areaStreet || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
    });
    setShowAddressForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Function to generate complete address preview
  const getCompleteAddressPreview = () => {
    const parts = [];

    if (formData.flatHouseNo) parts.push(formData.flatHouseNo);
    if (formData.areaStreet) parts.push(formData.areaStreet);
    if (formData.landmark) parts.push(formData.landmark);
    if (formData.city) parts.push(formData.city);
    if (formData.state) parts.push(formData.state);
    if (formData.pincode) parts.push(`- ${formData.pincode}`);
    if (formData.country) parts.push(formData.country);

    return parts.join(", ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Check limit again before submitting (for add, not edit)
    if (!editingAddress && addresses.length >= 2) {
      showNotification("You can only add up to 2 addresses", "error");
      setSubmitting(false);
      setShowAddressForm(false);
      setShowLimitModal(true);
      return;
    }

    // Validation
    if (
      !formData.flatHouseNo ||
      !formData.areaStreet ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      showNotification("Please fill all required fields", "error");
      setSubmitting(false);
      return;
    }

    // Pincode validation
    if (!/^\d{6}$/.test(formData.pincode)) {
      showNotification("Please enter a valid 6-digit pincode", "error");
      setSubmitting(false);
      return;
    }

    try {
      let response;
      if (editingAddress) {
        response = await api.put(`/address/${editingAddress._id}`, formData);
      } else {
        response = await api.post("/address/add", formData);
      }

      if (response.data.success) {
        showNotification(
          editingAddress
            ? "Address updated successfully!"
            : "Address added successfully!",
        );
        setShowAddressForm(false);
        await fetchAddresses();

        // If coming from checkout, navigate back after a short delay
        if (
          location.state?.fromCheckout ||
          sessionStorage.getItem("fromCheckout")
        ) {
          sessionStorage.removeItem("fromCheckout");
          setTimeout(() => {
            navigate("/checkout");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showNotification(
        error.response?.data?.message || "Failed to save address",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      const response = await api.delete(`/address/${addressId}`);
      if (response.data.success) {
        showNotification("Address deleted successfully!");
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      showNotification("Failed to delete address", "error");
    }
  };

  const getFullAddress = (address) => {
    let fullAddress = `${address.flatHouseNo}, ${address.areaStreet}`;
    if (address.landmark) fullAddress += `, ${address.landmark}`;
    fullAddress += `, ${address.city}, ${address.state} - ${address.pincode}, ${address.country || "India"}`;
    return fullAddress;
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

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* Notification Toast - Responsive */}
        {notification.show && (
          <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in">
            <div
              className={`px-4 sm:px-5 py-3 rounded-lg shadow-lg flex items-center justify-between gap-2 text-sm ${
                notification.type === "success" ? "bg-green-500" : "bg-red-500"
              } text-white`}
            >
              <div className="flex items-center gap-2">
                {notification.type === "success" ? (
                  <Check className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="break-words">{notification.message}</span>
              </div>
              <button
                onClick={() =>
                  setNotification({ show: false, message: "", type: "" })
                }
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header - Responsive */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl text-center sm:text-left font-bold text-gray-900">
                Saved Address
              </h1>
              <p className="text-xs sm:text-sm text-center sm:text-left text-gray-500 mt-1">
                Only two address can be added.
              </p>
            </div>
            <button
              onClick={handleOpenAddForm}
              disabled={addresses.length >= 2}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-sm sm:text-base ${
                addresses.length >= 2
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              Add New Address
            </button>
          </div>
        </div>

        {/* Addresses Grid - Responsive */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No addresses saved
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Add your first delivery address to get started.
            </p>
            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-5 sm:px-6 py-2 rounded-lg hover:bg-orange-700 transition text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border-2 border-gray-100 transition-all hover:shadow-md"
              >
                {/* Header - Responsive */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-gray-900">
                      Delivery Address
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditForm(address)}
                      className="text-gray-400 hover:text-orange-600 transition p-1"
                    >
                      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="text-gray-400 hover:text-red-600 transition p-1"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                    </button>
                  </div>
                </div>

                {/* Address Details - Responsive */}
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-600 break-words">
                    {address.flatHouseNo}, {address.areaStreet},
                  </p>
                  {address.landmark && (
                    <p className="text-xs sm:text-sm text-gray-500 break-words">
                      {address.landmark},
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-gray-600 break-words">
                    {address.city}, {address.state}.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Pincode: {address.pincode}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">
                    {address.country || "India"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Form Modal - Responsive */}
      {showAddressForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAddressForm(false)}
          ></div>
          <div
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md my-8 mx-auto"
            style={{ maxHeight: "calc(100vh - 4rem)" }}
          >
            {/* Header - Sticky */}
            <div className="sticky top-0 bg-white rounded-t-xl border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                onClick={() => setShowAddressForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form - Scrollable */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto p-4 sm:p-6 space-y-4"
              style={{ maxHeight: "calc(100vh - 8rem)" }}
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Flat/House No. *
                </label>
                <input
                  type="text"
                  name="flatHouseNo"
                  value={formData.flatHouseNo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter flat/house number"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Area/Street *
                </label>
                <input
                  type="text"
                  name="areaStreet"
                  value={formData.areaStreet}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter area/street name"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Nearby landmark"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{6}"
                    maxLength="6"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="6-digit pincode"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Address Preview Section - Responsive */}
              {(formData.flatHouseNo ||
                formData.areaStreet ||
                formData.city ||
                formData.state ||
                formData.pincode) && (
                <div className="mt-4 p-3 sm:p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs sm:text-sm font-semibold text-orange-800">
                      Address Preview
                    </label>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
                    {getCompleteAddressPreview() ||
                      "Fill in the details to see preview"}
                  </div>
                </div>
              )}

              {/* Form Actions - Responsive */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
                >
                  {submitting
                    ? "Saving..."
                    : editingAddress
                      ? "Update Address"
                      : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddressesPage;
