import { api, generateQuery } from '@/utils/api/base';

const path = '/admin/users';

export const UsersAPI = {
  get: async (id) => await api(`${path}/${id}`),
  getExpanded: async (id) => await api(`${path}/${id}/with-profiles`),
  list: async (params = {}) => await api(`${path}/?${generateQuery(params)}`),
  update: async (id, payload) => await api(`${path}/${id}/edit`, { method: 'POST', body: payload }),
  remove: async (id) => await api(`${path}/${id}`, { method: 'DELETE' }),
};

export default UsersAPI;
