import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

export async function verifyUser(payload) {
  const { data } = await api.post("/auth/verify", payload);
  return data;
}

export async function sendMessage(payload) {
  const { data } = await api.post("/chat", payload);
  return data;
}

export async function fetchHistory(sessionId) {
  const { data } = await api.get(`/chat/history/${sessionId}`);
  return data;
}

export async function fetchChatContext() {
  const { data } = await api.get("/chat/context");
  return data;
}

export async function fetchUserSessions(email) {
  const { data } = await api.get("/chat/sessions", {
    params: { email },
  });
  return data;
}

export async function createChatSession(user) {
  const { data } = await api.post("/chat/sessions", { user });
  return data;
}

export async function endChatSession(sessionId, userEmail) {
  const { data } = await api.patch(`/chat/sessions/${sessionId}/end`, { userEmail });
  return data;
}

export async function deleteChatSession(sessionId, userEmail) {
  const { data } = await api.delete(`/chat/sessions/${sessionId}`, {
    params: { userEmail },
  });
  return data;
}

export default api;
