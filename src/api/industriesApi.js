import { apiRequest } from './client';

/**
 * Fetch all industries for Admin (including inactive if requested)
 */
export const fetchAdminIndustries = async (includeInactive = true) => {
  try {
    const response = await apiRequest(`/industries?includeInactive=${includeInactive}`);
    const list = response?.industries || [];
    return list.map((item) => ({
      ...item,
      id: item._id || item.id,
    }));
  } catch (err) {
    console.warn('[IndustriesApi] Error fetching admin industries:', err.message);
    throw err;
  }
};

/**
 * Create a new industry vertical
 */
export const createIndustry = async (industryData) => {
  try {
    const response = await apiRequest('/industries', {
      method: 'POST',
      body: JSON.stringify(industryData),
    });
    const item = response?.industry || response;
    return { ...item, id: item._id || item.id };
  } catch (err) {
    console.error('[IndustriesApi] Error creating industry:', err);
    throw err;
  }
};

/**
 * Update an existing industry vertical
 */
export const updateIndustry = async (id, updates) => {
  try {
    const response = await apiRequest(`/industries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const item = response?.industry || response;
    return { ...item, id: item._id || item.id };
  } catch (err) {
    console.error('[IndustriesApi] Error updating industry:', err);
    throw err;
  }
};

/**
 * Delete an industry vertical
 */
export const deleteIndustry = async (id) => {
  try {
    const response = await apiRequest(`/industries/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (err) {
    console.error('[IndustriesApi] Error deleting industry:', err);
    throw err;
  }
};
