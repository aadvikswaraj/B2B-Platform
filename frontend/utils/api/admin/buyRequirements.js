import { api, generateQuery } from '@/utils/api/base';

const path = '/admin/buy-requirements';

export const BuyRequirementAPI = {
    list: async (params = {}) => api(path + '?' + generateQuery(params)),
    get: async (id) => api(path + '/' + id),
    verifyDecision: async (id, payload) => api(path + '/' + id + '/verifyDecision', { method: 'POST', body: payload }),
};

export default BuyRequirementAPI;
