import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Interceptor setup for Token Refresh
  useEffect(() => {
    const refreshInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const res = await api.post('/auth/refresh', { refresh_token: refreshToken });
              const { access_token, refresh_token } = res.data;
              localStorage.setItem('token', access_token);
              localStorage.setItem('refresh_token', refresh_token);
              api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
              originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
              return api(originalRequest);
            } catch (refreshErr) {
              setUser(null);
              localStorage.removeItem('token');
              localStorage.removeItem('refresh_token');
              delete api.defaults.headers.common['Authorization'];
              const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
              const isPublicPath = publicPaths.some(path => {
                if (path === '/') return window.location.pathname === '/';
                return window.location.pathname === path || window.location.pathname.startsWith(path + '/');
              });
              if (!isPublicPath) {
                window.location.href = '/login';
              }
              return Promise.reject(refreshErr);
            }
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      await fetchCurrentUser();
      showToast('Logged in successfully', 'success');
      return true;
    } catch (err) {
      showToast(err.response?.data?.detail || 'Login failed', 'error');
      return false;
    }
  };

  const registerUser = async (data) => {
    try {
      await api.post('/auth/register', data);
      showToast('User account registered successfully', 'success');
      return true;
    } catch (err) {
      showToast(err.response?.data?.detail || 'Registration failed', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      showToast('Logged out successfully', 'success');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register: registerUser, logout, setUser, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
