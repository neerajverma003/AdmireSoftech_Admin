import { apiRequest } from './client';

/**
 * Fetch all case studies for Admin
 */
export const fetchAdminCaseStudies = async () => {
  try {
    const response = await apiRequest('/case-studies?sort=createdAt&order=desc');
    const list = response?.data || response?.caseStudies || [];
    return list.map((item) => ({
      ...item,
      id: item._id || item.id,
    }));
  } catch (err) {
    console.warn('[CaseStudyApi] Error fetching admin case studies:', err.message);
    throw err;
  }
};

/**
 * Create a new case study
 */
export const createCaseStudy = async (caseStudyData) => {
  try {
    const response = await apiRequest('/case-studies', {
      method: 'POST',
      body: JSON.stringify(caseStudyData),
    });
    const item = response?.data || response?.caseStudy || response;
    return { ...item, id: item._id || item.id };
  } catch (err) {
    console.error('[CaseStudyApi] Error creating case study:', err);
    throw err;
  }
};

/**
 * Update an existing case study
 */
export const updateCaseStudy = async (id, updates) => {
  try {
    const response = await apiRequest(`/case-studies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    const item = response?.data || response?.caseStudy || response;
    return { ...item, id: item._id || item.id };
  } catch (err) {
    console.error('[CaseStudyApi] Error updating case study:', err);
    throw err;
  }
};

/**
 * Delete a case study
 */
export const deleteCaseStudy = async (id) => {
  try {
    const response = await apiRequest(`/case-studies/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (err) {
    console.error('[CaseStudyApi] Error deleting case study:', err);
    throw err;
  }
};

/**
 * Toggle case study status (published / featured)
 */
export const toggleCaseStudyStatus = async (id, field = 'isPublished') => {
  try {
    const response = await apiRequest(`/case-studies/${id}/toggle-status`, {
      method: 'PATCH',
      body: JSON.stringify({ field }),
    });
    const item = response?.data || response;
    return { ...item, id: item._id || item.id };
  } catch (err) {
    console.error('[CaseStudyApi] Error toggling status:', err);
    throw err;
  }
};
