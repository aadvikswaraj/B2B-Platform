import { api, generateQuery } from '@/utils/api/base';

const base = '/catalog';

export const CatalogAPI = {
  categories: async (params={}) => api(base + '/categories?' + generateQuery(params)),
  categoriesTree: async (params={}) => api(base + '/categories/tree?' + generateQuery(params)),
  category: async (id) => api(base + '/categories/' + id),
  commissionPercent: async (id, amount) => api(base + '/categories/' + id + '/commission?' + generateQuery({ amount })),
  brands: async () => api(base + '/brands'),
  
  // Products
  products: async (params={}) => api(base + '/products?' + generateQuery(params)),
  product: async (id) => api(base + '/products/' + id),
  
  // Seller
  sellerContact: async (sellerId) => api(base + '/seller-info/' + sellerId + '/contact'),
};

export default CatalogAPI;
