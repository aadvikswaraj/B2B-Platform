import { api, generateQuery } from '@/utils/api/base';

const path = '/admin/seller-verification';

export const SellerVerificationAPI = {
  list: async (params = {}) => api(`${path}/list?${generateQuery(params)}`),
  get: async (userId) => api(`${path}/${userId}`),
  verifySection: async (userId, payload) => api(`${path}/${userId}/verify-section`, { method: 'POST', body: payload }),
  verifyDecision: async (userId, payload) => api(`${path}/${userId}/verifyDecision`, { method: 'POST', body: payload }),
};

// Legacy exports for backward compatibility
export async function listSellerVerifications(params = {}) {
  const res = await SellerVerificationAPI.list(params);
  if (!res.success) throw new Error(res.message || 'Failed to load');
  return res.data;
}

export async function getSellerVerification(userId) {
  const res = await SellerVerificationAPI.get(userId);
  if (!res.success) throw new Error(res.message || 'Failed to load');
  return res.data;
}

export async function updateSellerStatuses(userId, payload) {
  // This function seems unused or deprecated, but if needed, it should map to verifyDecision or verifySection
  throw new Error("updateSellerStatuses is deprecated. Use verifyDecision or verifySection.");
}

export async function approveSeller(userId) {
  const res = await SellerVerificationAPI.verifyDecision(userId, { decision: 'verified' });
  if (!res.success) throw new Error(res.message || 'Failed to approve');
  return res.data;
}

export async function rejectSeller(userId, reason) {
  const res = await SellerVerificationAPI.verifyDecision(userId, { decision: 'rejected', reason });
  if (!res.success) throw new Error(res.message || 'Failed to reject');
  return res.data;
}

export default SellerVerificationAPI;
