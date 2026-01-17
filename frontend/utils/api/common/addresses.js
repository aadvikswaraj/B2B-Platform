import { api } from "@/utils/api/base";
const path = "/user/address";

const AddressesAPI = {
  list: async () => api(path),
  get: async (id) => api(`${path}/${id}`),
  add: async (payload) => api(path, { method: "POST", body: payload }),
  update: async (id, payload) =>
    api(`${path}/${id}`, { method: "PUT", body: payload }),
  delete: async (id) => api(`${path}/${id}`, { method: "DELETE" }),
  setDefault: async (id) => api(`${path}/${id}/default`, { method: "POST" }),
};
export default AddressesAPI;
