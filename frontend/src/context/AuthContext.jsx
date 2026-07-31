import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Loader2, Server, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useToast } from './ToastContext';
import LoadingOverlay from '../components/common/LoadingOverlay';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('cached_user');
    try {
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [backendReady, setBackendReady] = useState(false);
  const [wakingBackend, setWakingBackend] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const { showToast } = useToast();
  const location = useLocation();

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      let userData = res.data;
      if (userData.school_id) {
        try {
          const schoolRes = await api.get(`/schools/${userData.school_id}`);
          userData = { ...userData, school_name: schoolRes.data.school_name };
        } catch (schoolErr) {
          console.error("Failed to fetch user's school name:", schoolErr);
        }
      }
      setUser(userData);
      localStorage.setItem('cached_user', JSON.stringify(userData));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('cached_user');
    } finally {
      setLoading(false);
    }
  };

  const checkBackendHealth = async () => {
    setBackendError(false);
    
    // Set a timer to show the waking UI if the backend response takes more than 600ms
    const timer = setTimeout(() => {
      setWakingBackend(true);
    }, 600);

    try {
      await api.get('/health');
      setBackendReady(true);
      setWakingBackend(false);
      return true;
    } catch (err) {
      console.warn("Backend health check failed/waking:", err);
      // If the backend responded (e.g. 401 or standard HTTP responses), it means the server is awake!
      if (err.response || err.code === 'ERR_BAD_RESPONSE') {
        setBackendReady(true);
        setWakingBackend(false);
        return true;
      } else {
        setBackendError(true);
        setWakingBackend(false);
        return false;
      }
    } finally {
      clearTimeout(timer);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const isReady = await checkBackendHealth();
      
      const token = localStorage.getItem('token');
      if (token && isReady) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await fetchCurrentUser();
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    const isReady = await checkBackendHealth();
    
    const token = localStorage.getItem('token');
    if (token && isReady) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await fetchCurrentUser();
    } else {
      setLoading(false);
    }
  };

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
              localStorage.removeItem('cached_user');
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
      localStorage.removeItem('cached_user');
      delete api.defaults.headers.common['Authorization'];
      showToast('Logged out successfully', 'success');
    }
  };

  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
  const isPublicPath = publicPaths.some(path => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  });

  // If backend is not ready and user is not on a public path, block and show status
  if (!isPublicPath) {
    if (backendError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-6 py-12">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh pointer-events-none -z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="glass-card max-w-md w-full border border-white/20 dark:border-white/5 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center">
            <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">Connection Error</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              We are unable to connect to the DropGuard system. The workspace might be undergoing maintenance.
            </p>
            
            <button
              onClick={handleRetry}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Reconnecting...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> Try Again
                </>
              )}
            </button>

            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-semibold mt-6">
              <ArrowLeft className="h-4 w-4" /> Return to Landing Page
            </Link>
          </div>
        </div>
      );
    }

    if (wakingBackend && !backendReady) {
      return <LoadingOverlay />;
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register: registerUser, 
      logout, 
      setUser, 
      fetchCurrentUser,
      backendReady,
      backendError,
      wakingBackend,
      checkBackendHealth
    }}>
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
