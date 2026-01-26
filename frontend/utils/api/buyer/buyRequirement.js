import { api, generateQuery } from "@/utils/api/base";
const path = "/buyer/buy-requirement";

export const buyerBuyRequirementAPI = {
  list: async (params = {}) => api(path + "?" + generateQuery(params)),
  get: async (id) => api(path + "/" + id),
  create: async (payload) =>
    api(path + "/new", { method: "POST", body: payload }),
  updateStatus: async (id, payload) =>
    api(path + "/" + id + "/status", { method: "PUT", body: payload }),
};

export default buyerBuyRequirementAPI;
