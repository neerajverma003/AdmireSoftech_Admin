import { apiRequest } from './client';

/**
 * Fetch Estimator Configuration (public/admin)
 */
export async function getEstimatorConfig() {
  try {
    const response = await apiRequest('/estimator-config');
    return response?.config || null;
  } catch (error) {
    console.warn('[EstimatorConfig API] Error fetching config:', error);
    throw error;
  }
}

/**
 * Update Estimator Configuration (Admin Only)
 */
export async function updateEstimatorConfig(payload) {
  try {
    const response = await apiRequest('/estimator-config/admin', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error('[EstimatorConfig API] Error saving config:', error);
    throw error;
  }
}

/**
 * Reset Estimator Configuration to Factory Defaults (Admin Only)
 */
export async function resetEstimatorConfig() {
  try {
    const response = await apiRequest('/estimator-config/admin/reset', {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('[EstimatorConfig API] Error resetting config:', error);
    throw error;
  }
}
