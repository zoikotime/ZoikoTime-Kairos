export const API_BASE_URL = "http://localhost:5000";

export const API_PATHS = {
  health: "/health",
  chatbot: "/api/chatbot",
  support: "/api/support",
  workspaceConfig: "/api/workspace-config",
  employeeSummary: "/api/employee-summary",
};

export function getApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
