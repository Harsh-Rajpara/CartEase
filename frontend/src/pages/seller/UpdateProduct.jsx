import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  ImageIcon,
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

const UpdateProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageError, setImageError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Specifications state
  const [specifications, setSpecifications] = useState([]);
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  
  // Variants state
  const [variants, setVariants] = useState([]);
  const [newVariantType, setNewVariantType] = useState("");
  const [newVariantOptions, setNewVariantOptions] = useState([{ value: "", stock: "" }]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  axios.defaults.withCredentials = true;

  // Fetch product data on load
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchProductData();
      fetchCategories();
    }
  }, [isAuthenticated, id]);

  const fetchProductData = async () => {
    try {
      setFetchingProduct(true);
      const response = await axios.get(`${API_URL}/products/${id}`, {
        withCredentials: true,
      });
      
      console.log("Fetched product:", response.data);
      
      if (response.data.success) {
        const product = response.data.data;
        
        // Set form values
        formik.setValues({
          name: product.name || "",
          brand: product.brand || "",
          category: product.category || "",
          description: product.description || "",
          price: product.price || "",
          originalPrice: product.originalPrice || "",
          stock: product.stock || "",
        });
        
        // Set existing images
        if (product.images && product.images.length > 0) {
          setExistingImages(product.images);
          setImagePreviews(product.images.map(img => img.url || img));
        }
        
        // Set specifications - Convert object to array
        if (product.specifications && typeof product.specifications === 'object') {
          const specsArray = Object.entries(product.specifications).map(([key, value]) => ({
            key,
            value
          }));
          setSpecifications(specsArray);
          console.log("Specifications loaded:", specsArray);
        }
        
        // Set variants
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          setVariants(product.variants);
          console.log("Variants loaded:", product.variants);
        }
      } else {
        setError("Failed to load product data");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.response?.data?.message || "Failed to load product data");
    } finally {
      setFetchingProduct(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(`${API_URL}/categories`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
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

  // Specification functions
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

    if (images.length + existingImages.length + files.length > 5) {
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

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    const newImageIndex = index - existingImages.length;
    setImages((prev) => prev.filter((_, i) => i !== newImageIndex));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      removeExistingImage(index);
    } else {
      removeNewImage(index);
    }
  };

  const handleSubmit = async (values) => {
    console.log("=== SUBMIT STARTED ===");
    console.log("Product ID:", id);
    console.log("Form Values:", values);
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (images.length === 0 && existingImages.length === 0) {
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

      // Add existing image URLs to keep
      if (existingImages.length > 0) {
        const existingImageUrls = existingImages.map(img => img.url || img);
        formData.append("existingImages", JSON.stringify(existingImageUrls));
      }

      // Add new images
      images.forEach((image) => {
        formData.append("images", image);
      });

      console.log("Sending PUT request to:", `${API_URL}/products/${id}`);
      
      const response = await axios.put(
        `${API_URL}/products/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response:", response.data);

      if (response.data.success) {
        setSuccess("Product updated successfully! Waiting for admin approval.");
        // Clear form and redirect after 2 seconds
        setTimeout(() => {
          navigate("/seller/products");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to update product");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error updating product:", err);
      console.error("Error response:", err.response);
      
      if (err.response) {
        const errorMessage = err.response.data.message;
        if (err.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response.status === 404) {
          setError("Product not found. It may have been deleted.");
        } else {
          setError(errorMessage || "Failed to update product. Please try again.");
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/seller/products")}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              disabled={loading}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-500 mt-1">
                Product ID: {id}
              </p>
            </div>
          </div>
          <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg">
            ⚠️ Note: After editing, your product will need admin approval again
          </p>
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
                disabled={loading}
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

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
            <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-gray-700 font-medium">Updating product...</p>
              <p className="text-gray-500 text-sm mt-1">Please wait</p>
            </div>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className={`bg-white rounded-lg shadow p-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.name && formik.errors.name
                      ? "border-red-500"
                      : "border-gray-300"
                  } ${loading ? 'bg-gray-100' : ''}`}
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
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formik.touched.brand && formik.errors.brand
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${loading ? 'bg-gray-100' : ''}`}
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
                    disabled={loading || categoriesLoading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formik.touched.category && formik.errors.category
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${loading ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">Select a category</option>
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
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.description && formik.errors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  } ${loading ? 'bg-gray-100' : ''}`}
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className={`bg-white rounded-lg shadow p-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.price && formik.errors.price
                      ? "border-red-500"
                      : "border-gray-300"
                  } ${loading ? 'bg-gray-100' : ''}`}
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
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.originalPrice && formik.errors.originalPrice
                      ? "border-red-500"
                      : "border-gray-300"
                  } ${loading ? 'bg-gray-100' : ''}`}
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
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.stock && formik.errors.stock
                      ? "border-red-500"
                      : "border-gray-300"
                  } ${loading ? 'bg-gray-100' : ''}`}
                />
                {formik.touched.stock && formik.errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.stock}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className={`bg-white rounded-lg shadow p-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                    disabled={loading}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {images.length + existingImages.length < 5 && (
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
                    disabled={loading}
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
          </div>

          {/* Specifications Section */}
          <div className={`bg-white rounded-lg shadow p-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-orange-500" />
              Specifications <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
            </h2>

            <div className="space-y-3">
              {specifications.length > 0 && (
                <div className="space-y-2 mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Current Specifications:</h3>
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="font-medium text-sm min-w-[120px]">{spec.key}:</span>
                      <span className="flex-1 text-sm text-gray-600">{spec.value}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Specification:</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Specification name (e.g., Processor)"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm disabled:bg-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., Intel Core i7)"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={addSpecification}
                    disabled={!newSpecKey.trim() || !newSpecValue.trim() || loading}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 text-sm flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Example: Processor, RAM, Storage, Camera, etc.</p>
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className={`bg-white rounded-lg shadow p-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-orange-500" />
              Product Variants <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
            </h2>

            <div className="space-y-4">
              {variants.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Current Variants:</h3>
                  {variants.map((variant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{variant.variantType}</h3>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
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
                <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Variant:</h3>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Color, Size, Material"
                    value={newVariantType}
                    onChange={(e) => setNewVariantType(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm disabled:bg-gray-100"
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
                          disabled={loading}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm disabled:bg-gray-100"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={opt.stock}
                          onChange={(e) => updateVariantOption(index, "stock", e.target.value)}
                          disabled={loading}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm disabled:bg-gray-100"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeVariantOption(index)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
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
                    disabled={loading}
                    className="text-orange-600 text-sm flex items-center hover:text-orange-700 disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </button>
                  <button
                    type="button"
                    onClick={addVariant}
                    disabled={!newVariantType.trim() || !newVariantOptions.some(opt => opt.value.trim()) || loading}
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
              onClick={() => navigate("/seller/products")}
              disabled={loading}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;