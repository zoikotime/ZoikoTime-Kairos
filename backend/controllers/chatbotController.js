import {
  buildReply,
  createConversationId,
  createSessionId,
  getAdminOverview,
  getBootstrap,
  getConversationHistory,
  logSafety,
  recordConversation,
  runTool,
} from "../services/chatbotService.js";

export function getHealth(_req, res) {
  res.json({
    status: "ok",
    service: "zoikotime-kairos-backend",
    version: "1.0.0",
    capabilities: [
      "grounded-chat",
      "typed-tools",
      "audit-logs",
      "support-routing",
      "role-aware-responses",
      "bootstrap-config",
    ],
  });
}

export function getBootstrapData(_req, res) {
  res.json({
    success: true,
    ...getBootstrap(),
  });
}

export function sendChatMessage(req, res) {
  const {
    message,
    sessionId = createSessionId(),
    surface = "website",
    userState = "public",
    locale = "en",
  } = req.body ?? {};

  if (!message || !message.trim()) {
    return res.status(400).json({
      error: "message_required",
      message: "A chat message is required.",
    });
  }

  const reply = buildReply({ message, surface, userState, locale });
  const conversation = {
    id: createConversationId(),
    sessionId,
    message,
    surface,
    userState,
    reply,
    timestamp: new Date().toISOString(),
  };

  recordConversation(conversation);

  return res.json({
    sessionId,
    conversationId: conversation.id,
    ...reply,
  });
}

export function createSupportRequest(req, res) {
  const { issue, contact = "unknown", surface = "website", priority = "normal" } = req.body ?? {};

  if (!issue) {
    return res.status(400).json({ error: "issue_required" });
  }

  const result = runTool("create_support_ticket", {
    issue,
    contact,
    surface,
    priority,
  });

  if (!result.output) {
    return res.status(500).json({
      success: false,
      message: "Support ticket could not be created.",
    });
  }

  return res.json({
    success: true,
    ticket: result.output,
  });
}

export function getWorkspaceConfig(req, res) {
  const role = req.query.role ?? "public";

  if (role !== "admin") {
    logSafety("permission_conflict", "workspace config access denied", "api", role);
    return res.status(403).json({
      error: "forbidden",
      message: "Only admins can view workspace configuration.",
    });
  }

  const configKey = req.query.key ?? null;
  const result = runTool("fetch_workspace_config", { configKey });

  return res.json({
    success: true,
    config: result.output,
  });
}

export function getEmployeeSummary(req, res) {
  const userState = req.query.userState ?? "public";

  if (userState !== "employee") {
    logSafety("permission_conflict", "employee summary access denied", "api", userState);
    return res.status(403).json({
      error: "forbidden",
      message: "Only employee self-service can access this summary.",
    });
  }

  const result = runTool("fetch_my_data_summary", {
    employeeId: req.query.employeeId ?? "employee_001",
  });

  return res.json({
    success: true,
    summary: result.output,
  });
}

export function getHistory(req, res) {
  res.json({
    success: true,
    items: getConversationHistory(req.params.sessionId),
  });
}

export function getOverview(_req, res) {
  res.json({
    success: true,
    ...getAdminOverview(),
  });
}
