import { api, generateQuery } from "@/utils/api/base";

const path = "/admin/buy-requirements";

export const BuyRequirementAPI = {
  list: async (params = {}) => api(path + "?" + generateQuery(params)),
  get: async (id) => api(path + "/" + id),
  verifyDecision: async (id, payload) =>
    api(path + "/" + id + "/verifyDecision", { method: "POST", body: payload }),
  updateTags: async (id, tags) =>
    api(path + "/" + id + "/tags", { method: "PUT", body: { tags } }),
};

export default BuyRequirementAPI;
