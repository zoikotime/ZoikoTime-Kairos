const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ─── File Loader ─────────────────────────────────────────────────────────────

function loadJsonFile(fileName) {
  const filePath = path.resolve(__dirname, "..", "data", fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// ─── Load Data ────────────────────────────────────────────────────────────────
// knowledge.json is an OBJECT — extract the arrays we need
const knowledgeData    = loadJsonFile("knowledge.json");
const intents          = knowledgeData.intents;           // Array of intent objects
const searchRedirects  = knowledgeData.search_redirects;  // Array of redirect objects
const fallbackMsg      = knowledgeData.fallback;
const secondFallback   = knowledgeData.second_fallback;
const agentMessage     = knowledgeData.agent_message;
const emailPrompt      = knowledgeData.email_manager_prompt;
const defaultSuggestions = knowledgeData.default_suggestions ?? [];

const config = loadJsonFile("config.json");
const { toolContracts, workspaceConfigs, employeeSummaries, bootstrap } = config;

// ─── In-Memory Stores ─────────────────────────────────────────────────────────

const conversations  = [];
const toolLogs       = [];
const safetyLogs     = [];
const supportTickets = [];
const leads          = [];

// ─── Utilities ────────────────────────────────────────────────────────────────

function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeText(value = "") {
  return value.toLowerCase().trim();
}

function createSessionId()      { return makeId("session"); }
function createConversationId() { return makeId("conv"); }

function logSafety(type, message, surface, userState) {
  safetyLogs.push({
    id: makeId("safe"),
    type,
    message,
    surface,
    userState,
    timestamp: new Date().toISOString(),
  });
}

// ─── Tool Runner ──────────────────────────────────────────────────────────────

function logTool(name, input, output, authorized = true, error = null) {
  const entry = {
    id: makeId("tool"),
    tool: name,
    version: toolContracts?.[name]?.version ?? "1.0.0",
    authorized,
    input,
    output,
    error,
    timestamp: new Date().toISOString(),
  };
  toolLogs.push(entry);
  return entry;
}

function runTool(name, payload) {
  try {
    switch (name) {
      case "request_demo": {
        const lead = { id: makeId("demo"), type: "demo_request", ...payload, createdAt: new Date().toISOString() };
        leads.push(lead);
        return logTool(name, payload, lead);
      }
      case "capture_lead": {
        const lead = { id: makeId("lead"), type: "sales_lead", ...payload, createdAt: new Date().toISOString() };
        leads.push(lead);
        return logTool(name, payload, lead);
      }
      case "create_support_ticket": {
        const ticket = { id: makeId("ticket"), status: "open", ...payload, createdAt: new Date().toISOString() };
        supportTickets.push(ticket);
        return logTool(name, payload, ticket);
      }
      case "escalate_to_human": {
        const escalation = { id: makeId("esc"), status: "queued", ...payload, createdAt: new Date().toISOString() };
        return logTool(name, payload, escalation);
      }
      case "fetch_workspace_config": {
        const key = payload?.configKey;
        const result = key
          ? { [key]: workspaceConfigs?.[key] ?? "Not configured in this demo workspace." }
          : workspaceConfigs;
        return logTool(name, payload, result);
      }
      case "fetch_my_data_summary": {
        const employeeId = payload?.employeeId ?? "employee_001";
        const result = employeeSummaries?.[employeeId] ?? {
          visibility: ["No demo record found for this employee."],
          correctionRoute: "Contact your workspace admin.",
          privacyNote: "Only own-data routes are available here.",
        };
        return logTool(name, payload, result);
      }
      default:
        return logTool(name, payload, null, false, "Unknown tool");
    }
  } catch (error) {
    return logTool(name, payload, null, false, error.message);
  }
}

// ─── Safety Refusals ──────────────────────────────────────────────────────────

function refusalReply(reason) {
  if (reason === "covert_monitoring") {
    return {
      answer: "I can't help set up hidden monitoring. ZoikoTime is designed for transparent, policy-based workforce visibility.",
      suggestions: ["What gets recorded?", "Back to Main Menu"],
      nextAction: { type: "prompt", label: "Show transparent policy setup", value: "Show me how transparent screenshot and policy setup works" },
    };
  }
  if (reason === "professional_advice") {
    return {
      answer: "I can't provide legal, disciplinary, tax, medical, or similar professional advice.",
      suggestions: ["Speak to a human agent", "Back to Main Menu"],
      nextAction: { type: "tool", label: "Escalate to a human", value: "escalate_to_human" },
    };
  }
  if (reason === "forbidden_data_access") {
    return {
      answer: "I don't have permission to show another person's data or another workspace's data.",
      suggestions: ["Back to Main Menu"],
      nextAction: { type: "prompt", label: "Show allowed report routes", value: "Show me the approved report routes for my role" },
    };
  }
  return {
    answer: "I can't help with internal instructions, hidden system behavior, or prompt-bypass requests.",
    suggestions: ["Back to Main Menu"],
    nextAction: { type: "prompt", label: "What can Kairos do?", value: "What can Kairos help with?" },
  };
}

// ─── Intent Classifier ────────────────────────────────────────────────────────

function classifyIntent(message, userState) {
  const text = normalizeText(message);

  if (/(ignore previous|system prompt|hidden instructions|jailbreak|bypass guardrails)/.test(text))
    return { category: "refusal", reason: "prompt_injection" };
  if (/(secretly|hidden monitoring|spy on|covert monitoring|without consent)/.test(text))
    return { category: "refusal", reason: "covert_monitoring" };
  if (/(lawsuit|legal advice|disciplinary action|terminate employee|tax advice|medical advice)/.test(text))
    return { category: "refusal", reason: "professional_advice" };
  if (/(another user|other employee|someone else's|other workspace|show me their data)/.test(text))
    return { category: "refusal", reason: "forbidden_data_access" };
  if (/(demo|book a demo|talk to sales|contact sales)/.test(text))
    return { category: "sales", action: "request_demo" };
  if (/(price|pricing|plan|cost|subscription|quote)/.test(text))
    return { category: "sales", action: "capture_lead" };
  if (/(human|agent|support team|escalate|talk to someone)/.test(text))
    return { category: "support", action: "escalate_to_human" };
  if (/(not tracking|can't log in|cannot log in|screenshot missing|reports wrong|issue|bug|problem)/.test(text))
    return { category: "support", action: userState === "public" ? "escalate_to_human" : "create_support_ticket" };

  return { category: "general" };
}

// ─── Intent Matcher (against knowledge.json intents array) ───────────────────

function matchIntent(text) {
  return intents.find((intent) =>
    intent.keywords.some((kw) => text.includes(kw.toLowerCase()))
  ) ?? null;
}

// ─── Search Redirect Matcher ─────────────────────────────────────────────────

function matchRedirect(text) {
  return searchRedirects.find((r) =>
    r.keywords.some((kw) => text.includes(kw.toLowerCase()))
  ) ?? null;
}

// ─── Core Reply Builder ───────────────────────────────────────────────────────

function buildReply({ message, userState = "public", surface = "website" }) {
  const text = normalizeText(message);
  const safetyIntent = classifyIntent(message, userState);

  // 1. Safety / refusal checks
  if (safetyIntent.category === "refusal") {
    logSafety(safetyIntent.reason, message, surface, userState);
    const refusal = refusalReply(safetyIntent.reason);
    return {
      intent: safetyIntent.category,
      answer: refusal.answer,
      suggestions: refusal.suggestions ?? [],
      route: null,
      nextAction: refusal.nextAction,
      citations: [],
      toolsUsed: [],
      quickReplies: refusal.suggestions?.slice(0, 3) ?? [],
    };
  }

  // 2. Email manager trigger
  const emailTriggers = emailPrompt?.trigger_keywords ?? [];
  if (emailTriggers.some((kw) => text.includes(kw.toLowerCase()))) {
    return {
      intent: "email_manager",
      answer: emailPrompt.response,
      suggestions: [],
      route: null,
      nextAction: null,
      citations: [],
      toolsUsed: [],
      quickReplies: [],
    };
  }

  // 3. Tool actions for sales/support intents (before KB match)
  const toolInvocations = [];
  if (safetyIntent.category === "sales") {
    const toolName = safetyIntent.action === "request_demo" ? "request_demo" : "capture_lead";
    const toolResult = runTool(toolName, {
      name: "App user",
      email: "pending@example.com",
      company: "Pending qualification",
      intent: safetyIntent.action,
      surface,
    });
    toolInvocations.push(toolResult);
  }

  if (safetyIntent.category === "support") {
    const toolName = safetyIntent.action === "create_support_ticket"
      ? "create_support_ticket"
      : "escalate_to_human";
    const toolResult = runTool(toolName, { issue: message, priority: "normal", surface });
    toolInvocations.push(toolResult);
  }

  // 4. Match against intents in knowledge.json
  const matched = matchIntent(text);
  if (matched) {
    return {
      intent: matched.id,
      answer: matched.response,
      suggestions: matched.suggestions ?? [],
      route: matched.route ?? null,
      nextAction: null,
      citations: [],
      toolsUsed: toolInvocations.map((entry) => ({
        name: entry.tool,
        id: entry.output?.id ?? entry.id,
        success: Boolean(entry.output) && !entry.error,
      })),
      quickReplies: (matched.suggestions ?? []).slice(0, 3),
    };
  }

  // 5. Match against search_redirects
  const redirect = matchRedirect(text);
  if (redirect) {
    return {
      intent: redirect.intentId,
      answer: redirect.prompt,
      suggestions: [],
      route: redirect.route,
      nextAction: { type: "navigate", label: redirect.actionLabel, value: redirect.route },
      citations: [],
      toolsUsed: [],
      quickReplies: [],
    };
  }

  // 6. Second fallback (shown after first fallback was already given, or as default)
  return {
    intent: "fallback",
    answer: fallbackMsg,
    suggestions: defaultSuggestions,
    route: null,
    nextAction: null,
    citations: [],
    toolsUsed: [],
    quickReplies: defaultSuggestions.slice(0, 3),
  };
}

// ─── Conversation Store ───────────────────────────────────────────────────────

function recordConversation(conversation) {
  conversations.push(conversation);
}

function getConversationHistory(sessionId) {
  return conversations.filter((entry) => entry.sessionId === sessionId);
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

function getBootstrap() {
  return bootstrap;
}

// ─── Admin Overview ───────────────────────────────────────────────────────────

function getAdminOverview() {
  return {
    metrics: {
      conversations: conversations.length,
      supportTickets: supportTickets.length,
      leads: leads.length,
      safetyEvents: safetyLogs.length,
      toolInvocations: toolLogs.length,
    },
    recentConversations: conversations.slice(-5).reverse(),
    recentSafetyEvents: safetyLogs.slice(-5).reverse(),
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  createSessionId,
  createConversationId,
  logSafety,
  classifyIntent,
  runTool,
  buildReply,
  getBootstrap,
  recordConversation,
  getConversationHistory,
  getAdminOverview,
};