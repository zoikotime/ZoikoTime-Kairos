export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const API_PATHS = {
  health: "/health",
  bootstrap: "/api/bootstrap",
  chatbot: "/api/chatbot",
  support: "/api/support",
  workspaceConfig: "/api/workspace-config",
  employeeSummary: "/api/employee-summary",
  history: "/api/history",
  adminOverview: "/api/admin/overview",
};

export function getApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
