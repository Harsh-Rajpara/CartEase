import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X, MapPin, AlertCircle, Home, Briefcase } from 'lucide-react';

// Validation Schema
const addressValidationSchema = Yup.object({
    flatHouseNo: Yup.string()
        .required('Flat/House No. is required')
        .min(2, 'Must be at least 2 characters'),
    areaStreet: Yup.string()
        .required('Area/Street is required')
        .min(3, 'Must be at least 3 characters'),
    landmark: Yup.string(),
    city: Yup.string()
        .required('City is required')
        .min(2, 'Must be at least 2 characters'),
    state: Yup.string()
        .required('State is required')
        .min(2, 'Must be at least 2 characters'),
    pincode: Yup.string()
        .required('Pincode is required')
        .matches(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),
    country: Yup.string()
        .required('Country is required')
        .default('India'),
    isDefault: Yup.boolean()
});

const AddressForm = ({ isOpen, onClose, onSubmit, initialValues = null, loading = false }) => {
    const [error, setError] = useState('');

    const formik = useFormik({
        initialValues: {
            flatHouseNo: initialValues?.flatHouseNo || '',
            areaStreet: initialValues?.areaStreet || '',
            landmark: initialValues?.landmark || '',
            city: initialValues?.city || '',
            state: initialValues?.state || '',
            pincode: initialValues?.pincode || '',
            country: initialValues?.country || 'India',
            phone: initialValues?.phone || '',
            isDefault: initialValues?.isDefault || false
        },
        validationSchema: addressValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { resetForm }) => {
            setError('');
            try {
                await onSubmit(values);
                resetForm();
                onClose();
            } catch (err) {
                setError(err.message || 'Failed to save address');
            }
        }
    });

    // Reset form when modal closes
    const handleClose = () => {
        formik.resetForm();
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                        {initialValues?.flatHouseNo ? 'Edit Address' : 'Add New Address'}
                    </h2>
                    <button 
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-600">
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="9876543210"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                formik.touched.phone && formik.errors.phone
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                            disabled={loading}
                        />
                        {formik.touched.phone && formik.errors.phone && (
                            <p className="mt-1 text-xs text-red-600">{formik.errors.phone}</p>
                        )}
                    </div>

                    {/* Flat/House No */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Flat / House no. / Building / Apartment <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="flatHouseNo"
                            value={formik.values.flatHouseNo}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="e.g., D/2, 105, Sai Residency"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                formik.touched.flatHouseNo && formik.errors.flatHouseNo
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                            disabled={loading}
                        />
                        {formik.touched.flatHouseNo && formik.errors.flatHouseNo && (
                            <p className="mt-1 text-xs text-red-600">{formik.errors.flatHouseNo}</p>
                        )}
                    </div>

                    {/* Area/Street */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Area / Street / Sector / Village <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="areaStreet"
                            value={formik.values.areaStreet}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="e.g., Andheri East, Sector 15"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                formik.touched.areaStreet && formik.errors.areaStreet
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                            disabled={loading}
                        />
                        {formik.touched.areaStreet && formik.errors.areaStreet && (
                            <p className="mt-1 text-xs text-red-600">{formik.errors.areaStreet}</p>
                        )}
                    </div>

                    {/* Landmark */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Landmark (Optional)
                        </label>
                        <input
                            type="text"
                            name="landmark"
                            value={formik.values.landmark}
                            onChange={formik.handleChange}
                            placeholder="e.g., Near City Mall, Opposite Police Station"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                        />
                    </div>

                    {/* City and State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Town/City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formik.values.city}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="e.g., Mumbai"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    formik.touched.city && formik.errors.city
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                }`}
                                disabled={loading}
                            />
                            {formik.touched.city && formik.errors.city && (
                                <p className="mt-1 text-xs text-red-600">{formik.errors.city}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formik.values.state}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="e.g., Maharashtra"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    formik.touched.state && formik.errors.state
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                }`}
                                disabled={loading}
                            />
                            {formik.touched.state && formik.errors.state && (
                                <p className="mt-1 text-xs text-red-600">{formik.errors.state}</p>
                            )}
                        </div>
                    </div>

                    {/* Pincode and Country */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pincode <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                value={formik.values.pincode}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="6-digit pincode"
                                maxLength="6"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    formik.touched.pincode && formik.errors.pincode
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                }`}
                                disabled={loading}
                            />
                            {formik.touched.pincode && formik.errors.pincode && (
                                <p className="mt-1 text-xs text-red-600">{formik.errors.pincode}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="country"
                                value={formik.values.country}
                                onChange={formik.handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={loading}
                            >
                                <option value="India">India</option>
                                <option value="USA">USA</option>
                                <option value="UK">UK</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                            </select>
                        </div>
                    </div>

                    {/* Default Address Checkbox */}
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={formik.values.isDefault}
                            onChange={formik.handleChange}
                            className="mr-2 w-4 h-4"
                            disabled={loading}
                        />
                        <span className="text-sm text-gray-700">Set as default address</span>
                    </label>

                    {/* Address Preview */}
                    {formik.values.flatHouseNo && formik.values.areaStreet && formik.values.city && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Address Preview:</p>
                            <p className="text-sm text-gray-700">
                                {formik.values.flatHouseNo}, {formik.values.areaStreet}
                                {formik.values.landmark && `, ${formik.values.landmark}`}
                                , {formik.values.city}, {formik.values.state} - {formik.values.pincode}
                                , {formik.values.country}
                            </p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save Address'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressForm;