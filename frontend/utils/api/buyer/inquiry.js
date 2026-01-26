import { api } from "@/utils/api/base";

const path = "/buyer/inquiry";

export const inquiryAPI = {
  /**
   * Create a new inquiry
   * @param {Object} payload - { product, quantity, message, files }
   */
  create: async (payload) => api(path, { method: "POST", body: payload }),

  /**
   * List inquiries
   * @param {Object} params - { requirementFulfilled, product }
   */
  list: async (params) => api(path, { params }),

  /**
   * Get inquiry by ID
   * @param {string} id
   */
  getById: async (id) => api(`${path}/${id}`),
};

export default inquiryAPI;
