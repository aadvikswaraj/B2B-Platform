import { api, generateQuery } from '@/utils/api/base';

const base = '/auth';

export const AuthAPI = {
  checkStatus: async () => api(base + '/loggedin-status')
};

export default AuthAPI;