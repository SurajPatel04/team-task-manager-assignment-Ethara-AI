import { createSlice } from '@reduxjs/toolkit';
import { scheduleTokenRefresh, clearTokenRefresh } from '../../utils/tokenRefresh.js';

const initialState = {
    isAuthenticated: false,
    user: null,       // { id, name, email }
    loading: true,    // Start with loading true for initial auth check
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // ── Loading ──
        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        // ── Error ──
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },

        // ── Login ──
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload; // { id, name, email }
            state.error = null;
            scheduleTokenRefresh();
        },

        // ── Signup (don't auto-login) ──
        signupSuccess: (state) => {
            state.loading = false;
            state.error = null;
        },

        // ── Fetch current user ──
        setUser: (state, action) => {
            state.loading = false;
            state.user = action.payload; // req.user from GET /auth/me
            state.isAuthenticated = true;
            state.error = null;
            scheduleTokenRefresh();
        },

        // ── Logout / session expired ──
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.loading = false;
            state.error = null;
            clearTokenRefresh();
        },
    },
});

export const {
    setLoading,
    setError,
    clearError,
    loginSuccess,
    signupSuccess,
    setUser,
    logout,
} = authSlice.actions;

export default authSlice.reducer;