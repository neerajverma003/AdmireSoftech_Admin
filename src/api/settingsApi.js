import { apiRequest } from './client';

/**
 * Fetch global company settings and social media links from backend
 */
export const fetchCompanySettings = async () => {
  try {
    const data = await apiRequest('/settings', { method: 'GET' });
    return data?.settings || null;
  } catch (error) {
    console.warn('[settingsApi] Error fetching settings, using cache:', error.message);
    return null;
  }
};

/**
 * Update global company settings and social media links (Admin)
 */
export const updateCompanySettings = async (settingsData) => {
  try {
    const data = await apiRequest('/settings', {
      method: 'PUT',
      body: settingsData,
    });
    return data?.settings || settingsData;
  } catch (error) {
    console.error('[settingsApi] Error updating settings:', error.message);
    throw error;
  }
};
