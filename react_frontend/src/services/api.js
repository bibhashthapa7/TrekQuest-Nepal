import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const API = axios.create({
    baseURL: `${BASE_URL}/api/`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token refresh
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
                try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${BASE_URL}/auth/jwt/refresh/`, {
                        refresh: refreshToken
                    });
                    
                    const { access } = response.data;
                    localStorage.setItem('access_token', access);
                    
                    // Retry the original request
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return API(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/auth';
            }
        }
        
        return Promise.reject(error);
    }
);

export default API;
