import { api, generateQuery } from '@/utils/api/base';

const path = '/admin/product-verification';

export const ProductVerificationAPI = {
  list: async (params = {}) => api(`${path}/list?${generateQuery(params)}`),
  get: async (productId) => api(`${path}/${productId}`),
  approve: async (productId) => api(`${path}/${productId}/approve`, { method: 'POST' }),
  reject: async (productId, reason) => api(`${path}/${productId}/reject`, { method: 'POST', body: { reason } }),
};

// Legacy exports for backward compatibility
export async function listProductVerifications(params = {}) {
  const res = await ProductVerificationAPI.list(params);
  if (!res.success) throw new Error(res.message || 'Failed to load');
  return res.data;
}

export async function getProductVerification(productId) {
  const res = await ProductVerificationAPI.get(productId);
  if (!res.success) throw new Error(res.message || 'Failed to load');
  return res.data;
}

export async function approveProduct(productId) {
  const res = await ProductVerificationAPI.approve(productId);
  if (!res.success) throw new Error(res.message || 'Failed to approve');
  return res.data;
}

export async function rejectProduct(productId, reason) {
  const res = await ProductVerificationAPI.reject(productId, reason);
  if (!res.success) throw new Error(res.message || 'Failed to reject');
  return res.data;
}

export default ProductVerificationAPI;
