import { api } from "@/utils/api/base";
const path = "/user/address";

const AddressesAPI = {
  list: async () => await api(path),
  get: async (id) => await api(`${path}/${id}`),
  add: async (payload) => await api(path, { method: "POST", body: payload }),
  update: async (id, payload) =>
    await api(`${path}/${id}`, { method: "PUT", body: payload }),
  delete: async (id) => await api(`${path}/${id}`, { method: "DELETE" }),
  setDefault: async (id) => await api(`${path}/${id}/default`, { method: "POST" }),
};
export default AddressesAPI;
