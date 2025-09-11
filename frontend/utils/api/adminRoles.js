import { api, generateQuery } from '@/utils/api/base';
const path = '/admin/roles';

export const RolesAPI = {
	list: async (params = {}) => await api(path + '?' + generateQuery(params)),
	usersCount: async (id) => await api(path + '/' + id + '/users-count'),
	suggest: async (params = {}) => await api(path + '/suggest?' + generateQuery(params)),
	summary: async () => await api(path + '/summary'),
	get: async (id) => await api(path + '/' + id),
	create: async (payload) => await api(path + '/new', { method: 'POST', body: payload }),
	update: async (id, payload) => await api(path + '/' + id + '/edit', { method: 'POST', body: payload }),
	remove: async (id) => await api(path + '/' + id, { method: 'DELETE' }),
	bulkDelete: async (ids) => await api(path + '/bulk/delete', { method: 'DELETE', body: { ids } }),
	bulkStatus: async (ids, isActive) => await api(path + '/bulk/status', { method: 'POST', body: { ids, isActive } }),
	users: async (id, params = {}) => await api(path + '/' + id + '/users?' + generateQuery(params)),
	clone: async (id, roleName) => await api(path + '/' + id + '/clone', { method: 'POST', body: { roleName } })
};

// Extra helper for delete with strategy
export const removeWithStrategy = async (id, strategy = 'reassign', targetRoleId) =>
	await api(path + '/' + id + '/delete-with-strategy', {
		method: 'POST',
		body: { strategy, targetRoleId }
	});

RolesAPI.removeWithStrategy = removeWithStrategy;

export default RolesAPI;