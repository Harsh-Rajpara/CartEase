// frontend/src/redux/slices/admin/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunks
export const fetchCategories = createAsyncThunk(
  'admin/categories/fetchAll',
  async ({ page = 1, limit = 10, search = '', parentCategory, isActive } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (parentCategory !== undefined && parentCategory !== '') params.append('parentCategory', parentCategory);
      if (isActive !== undefined && isActive !== '') params.append('isActive', isActive);
      
      const response = await api.get(`/admin/categories?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryHierarchy = createAsyncThunk(
  'admin/categories/fetchHierarchy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/categories/hierarchy');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hierarchy');
    }
  }
);

export const createCategory = createAsyncThunk(
  'admin/categories/create',
  async (categoryData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(categoryData).forEach(key => {
        if (categoryData[key] !== undefined && categoryData[key] !== null && categoryData[key] !== '') {
          formData.append(key, categoryData[key]);
        }
      });
      
      const response = await api.post('/admin/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'admin/categories/update',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(categoryData).forEach(key => {
        if (categoryData[key] !== undefined && categoryData[key] !== null && categoryData[key] !== '') {
          formData.append(key, categoryData[key]);
        }
      });
      
      const response = await api.put(`/admin/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'admin/categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

export const bulkDeleteCategories = createAsyncThunk(
  'admin/categories/bulkDelete',
  async (categoryIds, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/categories/bulk-delete', { categoryIds });
      return { ids: categoryIds, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete categories');
    }
  }
);

const categorySlice = createSlice({
  name: 'adminCategories',
  initialState: {
    categories: [],
    hierarchy: [],
    loading: false,
    error: null,
    success: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Hierarchy
      .addCase(fetchCategoryHierarchy.fulfilled, (state, action) => {
        state.hierarchy = action.payload.data;
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.success = action.payload.message;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Bulk Delete
      .addCase(bulkDeleteCategories.fulfilled, (state, action) => {
        state.success = action.payload.message;
      })
      .addCase(bulkDeleteCategories.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess } = categorySlice.actions;
export default categorySlice.reducer;