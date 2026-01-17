import { api, generateQuery } from '@/utils/api/base';
const path = '/admin/users';

export const UsersAPI = {
  list: async (params = {}) => api(path + '?' + generateQuery(params)),
  get: async (id) => api(path + '/' + id),
  getWithProfiles: async (id) => api(path + '/' + id + '/with-profiles'),
  count: async () => api(path + '/users-count'),
  createAdmin: async (payload) => api(path + '/new-admin', { method: 'POST', body: payload }),
  update: async (id, payload) => api(path + '/' + id + '/edit', { method: 'POST', body: payload }),
  remove: async (id) => api(path + '/' + id, { method: 'DELETE' }),
};

export default UsersAPI;
