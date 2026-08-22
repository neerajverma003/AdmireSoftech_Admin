import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest, refreshAccessToken, getTokenExpiry } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('admire_admin_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem('admire_admin_token') || localStorage.getItem('admire_admin_refresh_token'));
  });

  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  /**
   * Schedule automatic silent token refresh 2 minutes before access token expires
   */
  const scheduleSilentRefresh = useCallback((token) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (!token) return;

    const expiryMs = getTokenExpiry(token);
    const now = Date.now();
    // Refresh 2 minutes (120s) before token expires, or in 10s if already expired/close
    const delay = expiryMs > now ? Math.max(expiryMs - now - 120000, 10000) : 10000;

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const storedRefreshToken = localStorage.getItem('admire_admin_refresh_token');
        if (!storedRefreshToken) return;

        const refreshData = await refreshAccessToken();
        if (refreshData && refreshData.accessToken) {
          if (refreshData.user) {
            setUser(refreshData.user);
            localStorage.setItem('admire_admin_user', JSON.stringify(refreshData.user));
          }
          setIsAuthenticated(true);
          scheduleSilentRefresh(refreshData.accessToken);
        }
      } catch (err) {
        console.warn('[Auth] Background silent refresh failed:', err.message);
      }
    }, delay);
  }, []);

  // Validate session with backend on initial load
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const token = localStorage.getItem('admire_admin_token');
      const storedRefreshToken = localStorage.getItem('admire_admin_refresh_token');

      if (!token && !storedRefreshToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // Step 1: Try verifying current access token
        if (token) {
          try {
            const response = await apiRequest('/auth/me');
            if (response && response.user) {
              if (response.user.role !== 'admin') {
                throw new Error('Non-admin user');
              }
              if (isMounted) {
                setUser(response.user);
                setIsAuthenticated(true);
                localStorage.setItem('admire_admin_user', JSON.stringify(response.user));
                scheduleSilentRefresh(token);
                setLoading(false);
              }
              return;
            }
          } catch (meErr) {
            console.warn('[Auth] Access token invalid or expired, attempting refresh...');
          }
        }

        // Step 2: If access token failed/missing, attempt refresh using refresh token
        if (storedRefreshToken) {
          const refreshData = await refreshAccessToken();
          if (refreshData && refreshData.accessToken) {
            const userRes = await apiRequest('/auth/me');
            if (userRes && userRes.user && userRes.user.role === 'admin') {
              if (isMounted) {
                setUser(userRes.user);
                setIsAuthenticated(true);
                localStorage.setItem('admire_admin_user', JSON.stringify(userRes.user));
                scheduleSilentRefresh(refreshData.accessToken);
                setLoading(false);
              }
              return;
            }
          }
        }

        throw new Error('No valid session could be established');
      } catch (err) {
        console.warn('[Auth] Session verification could not be restored:', err.message);
        if (isMounted) {
          localStorage.removeItem('admire_admin_token');
          localStorage.removeItem('admire_admin_refresh_token');
          localStorage.removeItem('admire_admin_user');
          localStorage.removeItem('admire_admin_auth');
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [scheduleSilentRefresh]);

  /**
   * Listen for window focus / tab visibility to refresh token if expired while inactive
   */
  useEffect(() => {
    const handleVisibilityOrFocus = async () => {
      if (document.visibilityState === 'visible') {
        const token = localStorage.getItem('admire_admin_token');
        const refreshToken = localStorage.getItem('admire_admin_refresh_token');
        if (!token && !refreshToken) return;

        const expiryMs = getTokenExpiry(token);
        const now = Date.now();
        // If token expires in less than 60 seconds or is already expired
        if (expiryMs <= now + 60000) {
          try {
            const refreshData = await refreshAccessToken();
            if (refreshData && refreshData.accessToken) {
              scheduleSilentRefresh(refreshData.accessToken);
            }
          } catch (err) {
            console.warn('[Auth] Window focus refresh failed:', err.message);
          }
        }
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [scheduleSilentRefresh]);

  /**
   * Real Backend Admin Login
   */
  const login = async (email, password) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response || !response.accessToken) {
        throw new Error(response?.message || 'Login failed.');
      }

      if (response.user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      localStorage.setItem('admire_admin_token', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('admire_admin_refresh_token', response.refreshToken);
      }
      localStorage.setItem('admire_admin_user', JSON.stringify(response.user));
      localStorage.setItem('admire_admin_auth', 'true');

      setUser(response.user);
      setIsAuthenticated(true);

      // Start proactive background refresh schedule
      scheduleSilentRefresh(response.accessToken);

      return { success: true, user: response.user };
    } catch (error) {
      console.error('Admin Login Error:', error);
      throw error;
    }
  };

  /**
   * Logout from Backend & Clear Local State
   */
  const logout = async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    try {
      await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      localStorage.removeItem('admire_admin_token');
      localStorage.removeItem('admire_admin_refresh_token');
      localStorage.removeItem('admire_admin_user');
      localStorage.removeItem('admire_admin_auth');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
