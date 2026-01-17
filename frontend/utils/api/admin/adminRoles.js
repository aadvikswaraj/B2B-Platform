import { api, generateQuery } from '@/utils/api/base';
const path = '/admin/roles';

export const RolesAPI = {
	list: async (params = {}) => api(path + '/list?' + generateQuery(params)),
	usersCount: async (id) => api(path + '/' + id + '/users-count'),
	get: async (id) => api(path + '/' + id),
	create: async (payload) => api(path + '/new', { method: 'POST', body: payload, json: true }),
	update: async (id, payload) => api(path + '/' + id, { method: 'PUT', body: payload, json: true }),
	remove: async (id) => api(path + '/' + id, { method: 'DELETE' }),
	users: async (id, params = {}) => api(path + '/' + id + '/users?' + generateQuery(params)),
};

export default RolesAPI;