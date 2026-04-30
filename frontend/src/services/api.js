import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// AUTH
export async function verifyUser(payload) {
  const { data } = await api.post("/auth/verify", payload);
  return data;
}

// CHAT (🔥 MAIN FLOW)
export async function sendMessage(payload) {
  const { data } = await api.post("/chat", payload);
  return data; // will now return sessionId also
}

export async function fetchHistory(sessionId) {
  const { data } = await api.get(`/chat/history/${sessionId}`);
  return data;
}

export async function fetchUserSessions(email) {
  const { data } = await api.get("/chat/sessions", {
    params: { email },
  });

  // 🔥 EXTRA SAFETY (frontend filter)
  return {
    ...data,
    sessions: (data.sessions || []).filter(
      (s) => s.messageCount > 0 // or s.messages?.length > 0
    ),
  };
}

// ❌ REMOVE THIS COMPLETELY
// export async function createChatSession(user) {
//   const { data } = await api.post("/chat/sessions", { user });
//   return data;
// }

// SESSION MANAGEMENT (keep these)
export async function endChatSession(sessionId, userEmail) {
  const { data } = await api.patch(`/chat/sessions/${sessionId}/end`, {
    userEmail,
  });
  return data;
}

export async function deleteChatSession(sessionId, userEmail) {
  const { data } = await api.delete(`/chat/sessions/${sessionId}`, {
    params: { userEmail },
  });
  return data;
}

export default api;