import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

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
    return !!localStorage.getItem('admire_admin_token');
  });

  const [loading, setLoading] = useState(true);

  // Validate session with backend on initial load
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('admire_admin_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest('/auth/me');
        if (response && response.user) {
          if (response.user.role !== 'admin') {
            throw new Error('Non-admin user');
          }
          setUser(response.user);
          setIsAuthenticated(true);
          localStorage.setItem('admire_admin_user', JSON.stringify(response.user));
        }
      } catch (err) {
        console.warn('Session verification failed, attempting token refresh:', err.message);
        try {
          // Attempt silent refresh via HttpOnly cookie
          const refreshRes = await apiRequest('/auth/refresh-token', { method: 'POST' });
          if (refreshRes && refreshRes.accessToken) {
            localStorage.setItem('admire_admin_token', refreshRes.accessToken);
            const userRes = await apiRequest('/auth/me');
            if (userRes && userRes.user && userRes.user.role === 'admin') {
              setUser(userRes.user);
              setIsAuthenticated(true);
              localStorage.setItem('admire_admin_user', JSON.stringify(userRes.user));
              setLoading(false);
              return;
            }
          }
        } catch (refreshErr) {
          console.warn('Token refresh failed:', refreshErr.message);
        }

        // Clean up invalid session
        localStorage.removeItem('admire_admin_token');
        localStorage.removeItem('admire_admin_refresh_token');
        localStorage.removeItem('admire_admin_user');
        localStorage.removeItem('admire_admin_auth');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

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
