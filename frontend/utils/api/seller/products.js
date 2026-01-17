import { api } from '@/utils/api/base';

const base = '/seller/products';

export const SellerProductsAPI = {
  list: async (params = {}) => api(`${base}/list`, { params }),
  create: async (payload) => api(base + "/new", { method: 'POST', body: payload }),
  update: async (id, payload) => api(`${base}/${id}`, { method: 'POST', body: payload }),
  updateTrade: async (id, payload) => api(`${base}/${id}/trade`, { method: 'POST', body: payload }),
  updateCore: async (id, payload) => api(`${base}/${id}/core`, { method: 'POST', body: payload }),
  discardDraft: async (id) => api(`${base}/${id}/draft`, { method: 'DELETE' }),
  get: async (id) => api(`${base}/${id}`),
};

export default SellerProductsAPI;
