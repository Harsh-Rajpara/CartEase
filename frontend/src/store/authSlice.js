// // frontend/src/store/authSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   user: JSON.parse(localStorage.getItem('user')) || null,
//   token: localStorage.getItem('token') || null,
//   isAuthenticated: !!localStorage.getItem('token'),
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setCredentials: (state, action) => {
//       const { user, token } = action.payload;
//       state.user = user;
//       state.token = token;
//       state.isAuthenticated = true;
//       localStorage.setItem('user', JSON.stringify(user));
//       localStorage.setItem('token', token);
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem('user');
//       localStorage.removeItem('token');
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../services/api';

// // ✅ fetch user from backend (cookie auto sent)
// export const fetchUser = createAsyncThunk(
//   'auth/fetchUser',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await api.get('/auth/me');
//       return res.data.data;
//     } catch (err) {
//       return rejectWithValue(null);
//     }
//   }
// );

// // ✅ logout
// export const logoutUser = createAsyncThunk(
//   'auth/logoutUser',
//   async () => {
//     await api.post('/auth/logout');
//   }
// );

// const initialState = {
//   user: null,
//   isAuthenticated: false,
//   loading: true,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // 🔥 used after login/register
//     setUser: (state, action) => {
//       state.user = action.payload;
//       state.isAuthenticated = true;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // fetch user
//       .addCase(fetchUser.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchUser.fulfilled, (state, action) => {
//         state.user = action.payload;
//         state.isAuthenticated = true;
//         state.loading = false;
//       })
//       .addCase(fetchUser.rejected, (state) => {
//         state.user = null;
//         state.isAuthenticated = false;
//         state.loading = false;
//       })

//       // logout
//       .addCase(logoutUser.fulfilled, (state) => {
//         state.user = null;
//         state.isAuthenticated = false;
//       });
//   },
// });

// export const { setUser } = authSlice.actions;
// export default authSlice.reducer;

// frontend/src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

// Fetch current user
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