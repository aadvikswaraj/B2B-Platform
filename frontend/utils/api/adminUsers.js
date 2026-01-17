import { api, generateQuery } from '@/utils/api/base';

const path = '/admin/users';

export const UsersAPI = {
  get: async (id) => api(`${path}/${id}`),
  getExpanded: async (id) => api(`${path}/${id}/with-profiles`),
  list: async (params = {}) => api(`${path}/?${generateQuery(params)}`),
  update: async (id, payload) => api(`${path}/${id}/edit`, { method: 'POST', body: payload }),
  remove: async (id) => api(`${path}/${id}`, { method: 'DELETE' }),
};

export default UsersAPI;
