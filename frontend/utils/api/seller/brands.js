// Seller brand API helper functions
// Provides thin wrappers around fetch for brand management.
import { api, generateFormData } from '../base.js';

const base = '/seller/brands';

export const BrandsAPI = {
  list: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && query.append(k, v));
    return api(base + (query.toString() ? `?${query.toString()}` : ''));
  },

  create: async payload => api(base+'/new', { method: 'POST', body: payload, json: true }),

  update: async (id, payload) => api(`${base}/${id}`, { method: 'POST', body: payload, json: true }),

  resubmitProof: async (id, { proofFile }) => {
    const formData = generateFormData({ proofFile });
    return api(`${base}/${id}/resubmit`, { method: 'PATCH', body: formData, json: false });
  },

  get: async (id) => api(`${base}/${id}`),

  delete: async (id) => api(`${base}/${id}`, { method: 'DELETE' }),
};

export default BrandsAPI;
