import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadJsonFile(fileName) {
  const filePath = path.resolve(__dirname, "..", "data", fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

const knowledgeBase = loadJsonFile("knowledge.json");
const config = loadJsonFile("config.json");

const { toolContracts, workspaceConfigs, employeeSummaries, bootstrap } = config;

const conversations = [];
const toolLogs = [];
const safetyLogs = [];
const supportTickets = [];
const leads = [];

function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeText(value = "") {
  return value.toLowerCase().trim();
}

function scoreSource(message, source) {
  const text = normalizeText(message);
  return source.tags.reduce((score, tag) => {
    if (text.includes(tag.toLowerCase())) return score + 3;
    return score;
  }, source.domain === "product" ? 1 : 0);
}

function resolveAudience(userState) {
  if (userState === "admin") return "admin";
  if (userState === "employee") return "employee";
  if (userState === "authenticated") return "authenticated";
  return "public";
}

function getAllowedAudiences(userState) {
  const audience = resolveAudience(userState);
  if (audience === "admin") return ["public", "authenticated", "admin"];
  if (audience === "employee") return ["public", "employee"];
  if (audience === "authenticated") return ["public", "authenticated"];
  return ["public"];
}

function retrieveSources(message, userState, intent) {
  const allowedAudiences = getAllowedAudiences(userState);

  return knowledgeBase
    .filter((source) => allowedAudiences.includes(source.audience))
    .map((source) => ({ ...source, relevance: scoreSource(message, source) }))
    .filter((source) => {
      if (intent.category === "admin") return source.domain === "admin" || source.domain === "product";
      if (intent.category === "employee") return source.domain === "employee" || source.domain === "privacy";
      if (intent.category === "support") return source.domain === "support" || source.domain === "product";
      if (intent.category === "privacy") return source.domain === "privacy" || source.domain === "employee";
      if (intent.category === "sales") return source.domain === "sales" || source.domain === "product";
      return ["product", intent.category].includes(source.domain) || source.relevance > 0;
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);
}

function makeCitation(source) {
  return {
    sourceId: source.source_id,
    title: source.title,
    url: source.source_url,
    version: source.version,
    domain: source.domain,
  };
}

function logTool(name, input, output, authorized = true, error = null) {
  const entry = {
    id: makeId("tool"),
    tool: name,
    version: toolContracts[name]?.version ?? "1.0.0",
    authorized,
    input,
    output,
    error,
    timestamp: new Date().toISOString(),
  };
  toolLogs.push(entry);
  return entry;
}

export function createSessionId() {
  return makeId("session");
}

export function createConversationId() {
  return makeId("conv");
}

export function logSafety(type, message, surface, userState) {
  safetyLogs.push({
    id: makeId("safe"),
    type,
    message,
    surface,
    userState,
    timestamp: new Date().toISOString(),
  });
}

export function classifyIntent(message, userState) {
  const text = normalizeText(message);

  if (/(ignore previous|system prompt|hidden instructions|jailbreak|bypass guardrails)/.test(text)) {
    return { category: "refusal", reason: "prompt_injection" };
  }
  if (/(secretly|hidden monitoring|spy on|covert monitoring|without consent)/.test(text)) {
    return { category: "refusal", reason: "covert_monitoring" };
  }
  if (/(lawsuit|legal advice|disciplinary action|terminate employee|tax advice|medical advice)/.test(text)) {
    return { category: "refusal", reason: "professional_advice" };
  }
  if (/(another user|other employee|someone else's|other workspace|show me their data)/.test(text)) {
    return { category: "refusal", reason: "forbidden_data_access" };
  }
  if (/(demo|book a demo|talk to sales|contact sales)/.test(text)) {
    return { category: "sales", action: "request_demo" };
  }
  if (/(price|pricing|plan|cost|subscription|quote)/.test(text)) {
    return { category: "sales", action: "capture_lead" };
  }
  if (/(human|agent|support team|escalate|talk to someone)/.test(text)) {
    return { category: "support", action: "escalate_to_human" };
  }
  if (/(not tracking|can't log in|cannot log in|screenshot missing|reports wrong|issue|bug|problem)/.test(text)) {
    return {
      category: "support",
      action: userState === "public" ? "escalate_to_human" : "create_support_ticket",
    };
  }
  if (/(my data|what can my manager see|what is recorded|screenshots|idle time|breaks|dispute|correction)/.test(text)) {
    return { category: userState === "employee" ? "employee" : "privacy" };
  }
  if (/(workspace|reports|report|policy|configure|setup|onboard|admin)/.test(text)) {
    return { category: userState === "admin" ? "admin" : "product" };
  }
  if (/(what is zoikotime|how does zoikotime work|product|feature|platform|overview)/.test(text)) {
    return { category: "product" };
  }
  if (/(privacy|security|gdpr|compliance|data protection|consent)/.test(text)) {
    return { category: "privacy" };
  }

  return { category: "product" };
}

export function runTool(name, payload) {
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
        const result = key ? { [key]: workspaceConfigs[key] ?? "Not configured in this demo workspace." } : workspaceConfigs;
        return logTool(name, payload, result);
      }
      case "fetch_my_data_summary": {
        const employeeId = payload?.employeeId ?? "employee_001";
        const result = employeeSummaries[employeeId] ?? {
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

function refusalReply(reason) {
  if (reason === "covert_monitoring") {
    return {
      answer: "I can't help set up hidden monitoring. ZoikoTime is designed for transparent, policy-based workforce visibility. I can help you understand responsible configuration, notices, roles, and controls instead.",
      nextAction: {
        type: "prompt",
        label: "Show transparent policy setup",
        value: "Show me how transparent screenshot and policy setup works",
      },
    };
  }
  if (reason === "professional_advice") {
    return {
      answer: "I can't provide legal, disciplinary, tax, medical, or similar professional advice. What I can do is explain ZoikoTime's audit trails, reporting, and evidence exports so your team can review them with the right specialist.",
      nextAction: { type: "tool", label: "Escalate to a human", value: "escalate_to_human" },
    };
  }
  if (reason === "forbidden_data_access") {
    return {
      answer: "I don't have permission to show another person's data or another workspace's data. If you need a report that your role allows, I can help you find the right approved route.",
      nextAction: {
        type: "prompt",
        label: "Show allowed report routes",
        value: "Show me the approved report routes for my role",
      },
    };
  }
  return {
    answer: "I can't help with internal instructions, hidden system behavior, or prompt-bypass requests. I can explain what Kairos is designed to do and how it protects privacy and permissions.",
    nextAction: { type: "prompt", label: "What can Kairos do?", value: "What can Kairos help with?" },
  };
}

function responseForIntent({ message, intent, userState, surface, sources }) {
  if (intent.category === "refusal") {
    logSafety(intent.reason, message, surface, userState);
    return refusalReply(intent.reason);
  }

  if (!sources.length) {
    return {
      answer: "I couldn't find an approved source strong enough to answer that reliably right now. I can point you to the help route or escalate this to a human with the context preserved.",
      nextAction: { type: "tool", label: "Escalate to a human", value: "escalate_to_human" },
    };
  }

  const primary = sources[0];
  let answer = "";
  let nextAction = null;
  const toolInvocations = [];

  if (intent.category === "sales") {
    answer = "ZoikoTime questions about plans and commercial fit should stay grounded in approved pricing guidance. I can explain the pricing framework, help narrow plan fit, and route you to sales if you want a tailored conversation.";
    if (intent.action === "request_demo") {
      const toolResult = runTool("request_demo", {
        name: "Website visitor",
        email: "pending@example.com",
        company: "Pending qualification",
        intent: "demo_request",
      });
      toolInvocations.push(toolResult);
      nextAction = { type: "tool", label: "Demo request queued", value: toolResult.output.id };
    } else {
      nextAction = { type: "prompt", label: "Compare plans", value: "Help me compare ZoikoTime plans" };
    }
  } else if (intent.category === "admin") {
    answer = "For admins, Kairos can explain workspace setup, policy controls, reporting, and implementation routes. It should guide configuration, not silently make high-risk changes. I can also show the current workspace guidance that your role is allowed to view.";
    const toolResult = runTool("fetch_workspace_config", { configKey: null });
    toolInvocations.push(toolResult);
    nextAction = { type: "prompt", label: "Explain workspace configuration", value: "Explain the current workspace configuration" };
  } else if (intent.category === "employee") {
    answer = "On the employee surface, Kairos should be transparency-first. It can explain what may be recorded for you, how screenshots and idle states work when enabled by policy, and how to request a correction or raise a dispute.";
    const toolResult = runTool("fetch_my_data_summary", { employeeId: "employee_001" });
    toolInvocations.push(toolResult);
    nextAction = { type: "prompt", label: "How do corrections work?", value: "How do I request a correction or dispute in ZoikoTime?" };
  } else if (intent.category === "support") {
    answer = "Kairos should guide troubleshooting calmly, preserve context, and escalate cleanly when an issue needs human help. It must never fabricate tool success, so if ticketing or escalation fails the response should say that clearly.";
    const toolName = intent.action === "create_support_ticket" ? "create_support_ticket" : "escalate_to_human";
    const toolResult = runTool(toolName, { issue: message, priority: "normal", surface });
    toolInvocations.push(toolResult);
    nextAction = {
      type: "tool",
      label: toolName === "create_support_ticket" ? "Support ticket opened" : "Human escalation queued",
      value: toolResult.output.id,
    };
  } else if (intent.category === "privacy") {
    answer = "Kairos should explain ZoikoTime through a privacy-first and transparency-first lens. It can describe what categories of data may be recorded, that visibility depends on workspace policy and role, and that covert or hidden monitoring is outside approved use.";
    nextAction = { type: "prompt", label: "Explain employee transparency", value: "Explain employee transparency and own-data access" };
  } else {
    answer = "Kairos is ZoikoTime's governed conversational layer. It should answer product questions with approved sources, keep the language calm and direct, and offer one clear next step without drifting into generic AI behavior.";
    nextAction = { type: "prompt", label: "Show pricing options", value: "Show me ZoikoTime pricing options" };
  }

  return {
    answer,
    nextAction,
    toolInvocations,
    sourceSummary: primary.content,
  };
}

export function buildReply({ message, userState = "public", surface = "website" }) {
  const intent = classifyIntent(message, userState);
  const sources = retrieveSources(message, userState, intent);
  const decision = responseForIntent({ message, intent, userState, surface, sources });
  const citations = sources.map(makeCitation);
  const toolResults = decision.toolInvocations ?? [];

  return {
    intent: intent.category,
    answer: decision.answer,
    context: decision.sourceSummary ?? "Kairos answers are grounded in approved ZoikoTime sources and should stay within the active role and surface boundary.",
    nextAction: decision.nextAction,
    citations,
    toolsUsed: toolResults.map((entry) => ({
      name: entry.tool,
      id: entry.output?.id ?? entry.id,
      success: Boolean(entry.output) && !entry.error,
    })),
    quickReplies: ["Show pricing options", "Explain screenshots", "Talk to a human"],
  };
}

export function getBootstrap() {
  return bootstrap;
}

export function recordConversation(conversation) {
  conversations.push(conversation);
}

export function getConversationHistory(sessionId) {
  return conversations.filter((entry) => entry.sessionId === sessionId);
}

export function getAdminOverview() {
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
