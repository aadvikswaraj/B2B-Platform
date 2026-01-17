import { api, generateQuery } from '@/utils/api/base';
const path = '/admin/category';
export const CategoryAPI = {
  list: async (params = {}) => api(path + '?' + generateQuery(params)),
  get: async (id) => api(path + '/' + id),
  create: async (payload) => api(path + '/new', { method: 'POST', body: payload }),
  update: async (id, payload) => api(path + '/' + id + '/edit', { method: 'POST', body: payload }),
  remove: async (id) => api(path + '/' + id, { method: 'DELETE' })
};

export default CategoryAPI;