// pages/seller/AddProduct.jsx - Simplified Specifications Section

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import {
  Package,
  Upload,
  X,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader,
  Layers,
  Image as ImageIcon,
  Settings,
  DollarSign,
} from "lucide-react";

// Validation schema
const productSchema = yup.object({
  name: yup
    .string()
    .min(5, "Product name must be at least 5 characters")
    .max(100, "Product name too long")
    .required("Product name is required"),
  brand: yup.string().required("Brand name is required"),
  category: yup.string().required("Category is required"),
  description: yup
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description too long")
    .required("Description is required"),
  price: yup
    .number()
    .positive("Price must be positive")
    .required("Price is required"),
  originalPrice: yup
    .number()
    .positive("Original price must be positive")
    .required("Original price is required")
    .test(
      'is-greater-than-price',
      'Original price must be greater than or equal to selling price',
      function(value) {
        const { price } = this.parent;
        if (!value || !price) return true;
        return value >= price;
      }
    ),
  stock: yup
    .number()
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .required("Stock is required"),
});

const AddProduct = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageError, setImageError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Specifications state - SIMPLIFIED
  const [specifications, setSpecifications] = useState([]);
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  
  // Variants state
  const [variants, setVariants] = useState([]);
  const [newVariantType, setNewVariantType] = useState("");
  const [newVariantOptions, setNewVariantOptions] = useState([{ value: "", stock: "" }]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(`${API_URL}/categories`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        setError("Failed to load categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories. Please refresh the page.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      brand: "",
      category: "",
      description: "",
      price: "",
      originalPrice: "",
      stock: "",
    },
    validationSchema: productSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  // Specification functions - SIMPLIFIED (just add and remove)
  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecifications([
        ...specifications,
        { key: newSpecKey.trim(), value: newSpecValue.trim() }
      ]);
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // Variant functions
  const addVariantOption = () => {
    setNewVariantOptions([...newVariantOptions, { value: "", stock: "" }]);
  };

  const updateVariantOption = (index, field, value) => {
    const updated = [...newVariantOptions];
    updated[index][field] = value;
    setNewVariantOptions(updated);
  };

  const removeVariantOption = (index) => {
    setNewVariantOptions(newVariantOptions.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    if (newVariantType.trim() && newVariantOptions.some(opt => opt.value.trim())) {
      const validOptions = newVariantOptions
        .filter(opt => opt.value.trim())
        .map(opt => ({
          value: opt.value.trim(),
          stock: Number(opt.stock) || 0
        }));
      
      if (validOptions.length > 0) {
        setVariants([
          ...variants,
          {
            variantType: newVariantType.trim(),
            options: validOptions
          }
        ]);
        setNewVariantType("");
        setNewVariantOptions([{ value: "", stock: "" }]);
      }
    }
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    setImageError("");
    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      setImageError("You can upload maximum 5 images");
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} is larger than 5MB`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        invalidFiles.push(`${file.name} is not an image file`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      setImageError(invalidFiles.join(". "));
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);

      setImages((prev) => [...prev, file]);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageError("");
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");
    setImageError("");

    try {
      if (!values.originalPrice) {
        setError("Original price is required");
        setLoading(false);
        return;
      }

      if (images.length === 0) {
        setImageError("Please upload at least one product image");
        setLoading(false);
        return;
      }

      const specsObj = {};
      specifications.forEach((spec) => {
        if (spec.key && spec.value) {
          specsObj[spec.key] = spec.value;
        }
      });

      const variantsForApi = variants.map((v) => ({
        variantType: v.variantType,
        options: v.options.map((o) => ({
          value: o.value,
          stock: Number(o.stock) || 0,
        })),
      }));

      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("brand", values.brand.trim());
      formData.append("category", values.category);
      formData.append("description", values.description.trim());
      formData.append("price", Number(values.price));
      formData.append("originalPrice", Number(values.originalPrice));
      formData.append("stock", Number(values.stock));

      if (Object.keys(specsObj).length > 0) {
        formData.append("specifications", JSON.stringify(specsObj));
      }

      if (variantsForApi.length > 0) {
        formData.append("variants", JSON.stringify(variantsForApi));
      }

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await axios.post(
        `${API_URL}/products/add-product`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccess("Product added successfully!");
        formik.resetForm();
        setImages([]);
        setImagePreviews([]);
        setVariants([]);
        setSpecifications([]);
        
        setTimeout(() => {
          navigate("/seller/products");
        }, 2000);
      }
    } catch (err) {
      console.error("Error adding product:", err);
      
      if (err.response) {
        const errorMessage = err.response.data.message;
        if (err.response.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError(errorMessage || "Failed to add product. Please try again.");
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/seller/dashboard")}
              className="mr-4 p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-orange-500" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., iPhone 15 Pro Max"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.name && formik.errors.name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formik.values.brand}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., Apple"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formik.touched.brand && formik.errors.brand
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formik.touched.brand && formik.errors.brand && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.brand}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={categoriesLoading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formik.touched.category && formik.errors.category
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">
                      {categoriesLoading ? "Loading..." : "Select a category"}
                    </option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.category && formik.errors.category && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.category}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows="4"
                  placeholder="Describe your product in detail..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.description && formik.errors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-orange-500" />
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="89999"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.price && formik.errors.price
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.price && formik.errors.price && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formik.values.originalPrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="99999"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.originalPrice && formik.errors.originalPrice
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.originalPrice && formik.errors.originalPrice && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.originalPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formik.values.stock}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="100"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.stock && formik.errors.stock
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.stock && formik.errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.stock}</p>
                )}
              </div>
            </div>

            {formik.values.originalPrice && formik.values.price && 
             Number(formik.values.originalPrice) > Number(formik.values.price) && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  Discount: {Math.round(((Number(formik.values.originalPrice) - Number(formik.values.price)) / Number(formik.values.originalPrice)) * 100)}% off
                </p>
              </div>
            )}
          </div>

          {/* Product Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-orange-500" />
              Product Images
            </h2>
            
            <p className="text-sm text-gray-500 mb-3">
              Upload up to 5 images (JPG, PNG, max 5MB each)
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Product ${index + 1}`}
                    className="w-full h-28 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg h-28 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition group">
                  <Upload className="h-6 w-6 text-gray-400 group-hover:text-orange-500" />
                  <span className="text-xs text-gray-500 mt-1 group-hover:text-orange-500">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {imageError && (
              <div className="mt-3 flex items-center text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4 mr-1" />
                <p className="text-xs">{imageError}</p>
              </div>
            )}

            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {images.length} of 5 images uploaded
              </p>
              {images.length === 0 && !imageError && (
                <p className="text-xs text-red-500">* At least one image is required</p>
              )}
            </div>
          </div>

          {/* Specifications - SIMPLIFIED like Variants */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-orange-500" />
              Specifications <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
            </h2>

            <div className="space-y-3">
              {/* Display existing specifications */}
              {specifications.length > 0 && (
                <div className="space-y-2 mb-3">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="font-medium text-sm min-w-[120px]">{spec.key}:</span>
                      <span className="flex-1 text-sm text-gray-600">{spec.value}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new specification - Same style as variants */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Specification name (e.g., Processor)"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., Intel Core i7)"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                  className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 text-sm flex items-center gap-1"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500">Example: Processor, RAM, Storage, Camera, etc.</p>
            </div>
          </div>

          {/* Variants (Optional) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-orange-500" />
              Product Variants <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
            </h2>

            <div className="space-y-4">
              {variants.length > 0 && (
                <div className="space-y-3 mb-4">
                  {variants.map((variant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{variant.variantType}</h3>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {variant.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex justify-between text-sm">
                            <span className="text-gray-600">{opt.value}</span>
                            <span className="text-gray-500">Stock: {opt.stock}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Color, Size, Material"
                    value={newVariantType}
                    onChange={(e) => setNewVariantType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options
                  </label>
                  <div className="space-y-2">
                    {newVariantOptions.map((opt, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Option value (e.g., Red, XL)"
                          value={opt.value}
                          onChange={(e) => updateVariantOption(index, "value", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={opt.stock}
                          onChange={(e) => updateVariantOption(index, "stock", e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeVariantOption(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addVariantOption}
                    className="text-orange-600 text-sm flex items-center hover:text-orange-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </button>
                  <button
                    type="button"
                    onClick={addVariant}
                    disabled={!newVariantType.trim() || !newVariantOptions.some(opt => opt.value.trim())}
                    className="ml-auto px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 text-sm"
                  >
                    Add Variant
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/seller/dashboard")}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;