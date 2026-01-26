import { api, generateQuery } from "@/utils/api/base";

const path = "/admin/product-verification";

export const ProductVerificationAPI = {
  list: async (params = {}) => api(`${path}/list?` + generateQuery(params)),
  get: async (productId) => api(`${path}/${productId}`),
  verifyDecision: async (productId, payload) =>
    api(`${path}/${productId}/verify`, { method: "POST", body: payload }),
  updateTags: async (productId, tags) =>
    api(`${path}/${productId}/tags`, {
      method: "PUT",
      body: { tags },
    }),
};

export default ProductVerificationAPI;
