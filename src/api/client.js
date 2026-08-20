/**
 * Centralized API Client Layer for Admire Softech Admin Panel
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Generic API fetch helper with token authentication & error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('admire_admin_token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: defaultHeaders,
    });

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
