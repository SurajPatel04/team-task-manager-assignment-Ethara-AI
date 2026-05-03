import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true, // send cookies (accessToken, refreshToken) with every request
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor: attempt silent token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If we get a 401 and haven't already retried, try refreshing the token
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh') &&
            !originalRequest.url.includes('/auth/signin')
        ) {
            originalRequest._retry = true;

            try {
                // Hit the refresh endpoint — new cookies are set automatically
                await api.post('/auth/refresh');

                // Retry the original request with the new access token cookie
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh also failed — user must re-login
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;