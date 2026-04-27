import { API_PATHS, getApiUrl } from "./apiPaths";

export function getChatbotEndpoint() {
  return getApiUrl(API_PATHS.chatbot);
}

export async function sendChatMessage(payload) {
  const response = await fetch(getChatbotEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to send chat message");
  }

  return response.json();
}
