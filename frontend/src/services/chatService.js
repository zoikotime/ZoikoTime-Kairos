import { API_PATHS, getApiUrl } from "./apiPaths";

async function request(path, options = {}) {
  const response = await fetch(getApiUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Request failed");
  }

  return response.json();
}

export function sendChatMessage(payload) {
  return request(API_PATHS.chatbot, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchBootstrap() {
  return request(API_PATHS.bootstrap);
}

export function createSupportTicket(payload) {
  return request(API_PATHS.support, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchWorkspaceConfig(role, key) {
  const params = new URLSearchParams({ role });
  if (key) params.set("key", key);
  return request(`${API_PATHS.workspaceConfig}?${params.toString()}`);
}

export function fetchEmployeeSummary(userState, employeeId) {
  const params = new URLSearchParams({ userState });
  if (employeeId) params.set("employeeId", employeeId);
  return request(`${API_PATHS.employeeSummary}?${params.toString()}`);
}

export function fetchChatHistory(sessionId) {
  return request(`${API_PATHS.history}/${sessionId}`);
}

export function fetchAdminOverview() {
  return request(API_PATHS.adminOverview);
}
