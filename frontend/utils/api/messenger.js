import { api, generateQuery } from "@/utils/api/base";

const base = "/user/messenger";

export const MessengerAPI = {
  // Contacts
  contacts: async (params = {}) =>
    api(base + "/contacts?" + generateQuery(params)),

  // Conversations
  conversation: async (id) => api(base + "/conversations/" + id),
  messages: async (id, params = {}) =>
    api(base + "/" + id + "/messages?" + generateQuery(params)),

  // Actions
  sendMessage: async (data) =>
    api(base + "/send", { method: "POST", body: data }),
  startConversation: async (data) =>
    api(base + "/start", { method: "POST", body: data }),
  updateMeta: async (id, data) =>
    api(base + "/" + id + "/meta", { method: "PATCH", body: data }),
};

export default MessengerAPI;
