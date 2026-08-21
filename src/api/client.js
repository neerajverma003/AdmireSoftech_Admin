/**
 * Centralized API Client Layer for Admire Softech Admin Panel
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Generic API fetch helper with automatic silent token refresh, token authentication, cookies & error handling
 */
export async function apiRequest(endpoint, options = {}) {
  let token = localStorage.getItem('admire_admin_token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers: defaultHeaders,
    });

    // If 401 Unauthorized & not an auth endpoint, attempt automatic token refresh
    if (
      response.status === 401 &&
      !endpoint.startsWith('/auth/login') &&
      !endpoint.startsWith('/auth/refresh') &&
      !endpoint.startsWith('/auth/signup')
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const storedRefreshToken = localStorage.getItem('admire_admin_refresh_token');
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.accessToken;
            if (newToken) {
              localStorage.setItem('admire_admin_token', newToken);
              if (refreshData.refreshToken) {
                localStorage.setItem('admire_admin_refresh_token', refreshData.refreshToken);
              }
              isRefreshing = false;
              onRefreshed(newToken);
              // Retry original request with newly refreshed access token
              return apiRequest(endpoint, options);
            }
          }
        } catch (refreshErr) {
          console.warn('[Admin API Client] Auto-refresh failed:', refreshErr.message);
        }
        isRefreshing = false;
        onRefreshed(null);
      } else {
        // Queue pending requests while token refresh is in progress
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken) {
              resolve(apiRequest(endpoint, options));
            } else {
              reject(new Error('Session expired. Please log in again.'));
            }
          });
        });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[Admin API Client] Error calling ${endpoint}:`, error.message);
    throw error;
  }
}

