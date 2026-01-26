import { api } from "./base";

const BASE_PATH = "/buyer/order";

export const orderAPI = {
  create: async (data) => {
    return await api(`${BASE_PATH}/`, { method: "POST", body: data });
  },

  getById: async (id) => {
    return await api(`${BASE_PATH}/${id}`);
  },

  addShippingAddress: async (orderId, shippingAddressId) => {
    return await api(`${BASE_PATH}/${orderId}/shipping-address`, {
      method: "PUT",
      body: { shippingAddressId },
    });
  },

  createPayment: async (orderId) => {
    return await api(`${BASE_PATH}/${orderId}/payment`, { method: "POST" });
  },

  verifyPayment: async (data) => {
    return await api(`${BASE_PATH}/payment/verify`, {
      method: "POST",
      body: data,
    });
  },

  demoPayment: async (orderId, status) => {
    return await api(`${BASE_PATH}/${orderId}/demo-payment`, {
      method: "POST",
      body: { status, source: "demo-handler" },
    });
  },

  list: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api(`${BASE_PATH}?${queryString}`);
  },

  cancel: async (id, reason) => {
    return await api(`${BASE_PATH}/${id}/cancel`, {
      method: "PUT",
      body: { reason },
    });
  },

  getStats: async () => {
    return await api(`${BASE_PATH}/stats`);
  },
};
