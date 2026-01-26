import api from "../base";

export const getBuyLeads = async (params) => {
  try {
    const response = await api.get("/seller/buyleads", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};
