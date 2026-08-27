import { apiRequest } from './client';

/**
 * Fetch sent outreach email history logs
 */
export const fetchOutreachHistory = async () => {
  try {
    const res = await apiRequest('/outreach/history');
    return res;
  } catch (err) {
    console.warn('[OutreachApi] Error fetching outreach history:', err.message);
    throw err;
  }
};

/**
 * Send custom direct outreach email
 */
export const sendOutreachEmail = async (emailData) => {
  try {
    const res = await apiRequest('/outreach/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
    return res;
  } catch (err) {
    console.error('[OutreachApi] Error sending outreach email:', err);
    throw err;
  }
};

/**
 * Delete an outreach log record
 */
export const deleteOutreachLog = async (id) => {
  try {
    const res = await apiRequest(`/outreach/history/${id}`, {
      method: 'DELETE',
    });
    return res;
  } catch (err) {
    console.error('[OutreachApi] Error deleting outreach record:', err);
    throw err;
  }
};

/**
 * Fetch all configured multi-sender email accounts
 */
export const fetchSenderAccounts = async () => {
  try {
    const res = await apiRequest('/outreach/senders');
    return res;
  } catch (err) {
    console.warn('[OutreachApi] Error fetching sender accounts:', err.message);
    throw err;
  }
};

/**
 * Create/verify a new sender email account
 */
export const createSenderAccount = async (accountData) => {
  try {
    const res = await apiRequest('/outreach/senders', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
    return res;
  } catch (err) {
    console.error('[OutreachApi] Error creating sender account:', err);
    throw err;
  }
};

/**
 * Delete a sender email account
 */
export const deleteSenderAccount = async (id) => {
  try {
    const res = await apiRequest(`/outreach/senders/${id}`, {
      method: 'DELETE',
    });
    return res;
  } catch (err) {
    console.error('[OutreachApi] Error deleting sender account:', err);
    throw err;
  }
};

/**
 * Set an account as the default sender
 */
export const setDefaultSenderAccount = async (id) => {
  try {
    const res = await apiRequest(`/outreach/senders/${id}/default`, {
      method: 'PATCH',
    });
    return res;
  } catch (err) {
    console.error('[OutreachApi] Error setting default sender account:', err);
    throw err;
  }
};

