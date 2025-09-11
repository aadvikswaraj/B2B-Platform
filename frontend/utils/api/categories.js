import { api, generateQuery } from '@/utils/api/base';
const path = '/admin/category';
export const CategoryAPI = {
  list: async (params={}) => await api(path + '?' + generateQuery(params)),
  tree: async (params={}) => await api(path + '/tree?' + generateQuery(params)),
  suggest: async (params={}) => await api(path + '/suggest?' + generateQuery(params)),
  get: async (id) =>  await api(path + '/'+id),
  path: async (id) =>  await api(path + '/'+id+'/path'),
  create: async (payload) =>  await api(path + '/new', { method:'POST', body: payload }),
  update: async (id, payload) =>  await api(path + '/'+id+'/edit', { method:'POST', body: payload }),
  remove: async (id) =>  await api(path + '/'+id, { method:'DELETE' }),
  resolveCommission: async (payload) =>await  api(path + '/resolve-commission', { method:'POST', body: payload }),
  bulkStatus: async (ids, isActive) => api(path + '/bulk/status', { method:'POST', body:{ ids, isActive } }),
};

export default CategoryAPI;