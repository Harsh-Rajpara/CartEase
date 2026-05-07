
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Not authenticated' });
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;