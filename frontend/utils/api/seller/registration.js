import { api } from "../base.js";

const base = "/seller/registration";

export const RegistrationAPI = {
  getProgress: async () => api(`${base}/progress`),

  saveStep: async (payload) =>
    api(`${base}/save-step`, {
      method: "POST",
      body: payload,
      json: true,
    }),
};

export const getRegistrationProgress = RegistrationAPI.getProgress;
export const saveRegistrationStep = RegistrationAPI.saveStep;

export default RegistrationAPI;
