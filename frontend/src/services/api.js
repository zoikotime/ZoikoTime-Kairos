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

// CHAT
export async function sendMessage(payload) {
  const { data } = await api.post("/chat", payload);
  return data;
}

export async function fetchHistory(sessionId) {
  const { data } = await api.get(`/chat/history/${sessionId}`);
  return data;
}

export async function fetchUserSessions(email) {
  const { data } = await api.get("/chat/sessions", {
    params: { email },
  });

  return {
    ...data,
    sessions: (data.sessions || []).filter((s) => s.messageCount > 0),
  };
}

// SESSION MANAGEMENT
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

// MAIL
// Backend keys rate limit by user.email — always include it.
// Backend builds the HTML itself from sessionId, so we only send metadata.
export async function sendMail({ sessionId, user, to, subject, body }) {
  const { data } = await api.post("/mail/send", {
    sessionId,
    user,
    to,
    subject,
    body,
    email: user?.email, // explicit top-level key for rate limiter middleware
  });
  return data;
}

export default api;