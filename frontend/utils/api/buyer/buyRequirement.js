import { api, generateQuery } from '@/utils/api/base';
const path = '/buyer/buy-requirement';

export const buyerBuyRequirementAPI = {
    create: async (payload) => api(path + '/new', { method: 'POST', body: payload })
};

export default buyerBuyRequirementAPI;