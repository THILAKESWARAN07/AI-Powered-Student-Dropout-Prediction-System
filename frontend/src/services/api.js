import axios from 'axios';

// Get API base URL from Vite environment variables or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout to accommodate cold starts
});

// Request interceptor to attach JWT auth tokens in subsequent modules
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling centralized API errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    
    if (status === 401) {
      // Clear credentials if token expired (Module 2+)
      localStorage.removeItem('token');
      // Redirect to login if user is in app views (exclude public auth routes)
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
      const isPublicPath = publicPaths.some(path => {
        if (path === '/') return window.location.pathname === '/';
        return window.location.pathname === path || window.location.pathname.startsWith(path + '/');
      });
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
