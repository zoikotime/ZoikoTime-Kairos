const fs = require("node:fs");
const path = require("node:path");
const { v4: uuidv4 } = require("uuid");
const { supabase } = require("../config/db");
const NewPrompt = require("../models/NewPrompt");

// FIXED: Point to correct knowledge.json location (root, not /data)
const knowledgePath = path.resolve(__dirname, "..", "data", "knowledge.json");
let knowledgeDocument;
try {
  const rawData = fs.readFileSync(knowledgePath, "utf-8");
  knowledgeDocument = JSON.parse(rawData);
  console.log(
    `✅ Knowledge loaded: ${knowledgeDocument.intents?.length || 0} intents`,
  );
} catch (e) {
  console.error(`❌ Failed to load: ${knowledgePath}`, e.message);
  knowledgeDocument = {
    _meta: { assistantName: "Koiris" },
    intents: [],
    fallback: "Knowledge base failed to load",
    default_suggestions: [],
    search_redirects: [],
  };
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const inMemoryHistory = new Map();
const inMemoryConversations = new Map();

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text = "") {
  return normalizeText(text).split(" ").filter(Boolean);
}

async function trackUnknownPrompt(message) {
  const prompt = normalizeText(message);
  if (!prompt || !supabase) return null;

  try {
    return await NewPrompt.incrementOrCreate(prompt);
  } catch (error) {
    console.error("[ChatService] Failed to track unknown prompt:", error.message);
    return null;
  }
}

function personalizeText(text = "") {
  const assistantDisplayName =
    knowledgeDocument?._meta?.assistantName || "Koiris";
  return text
    .replace(/\bKairos\b/g, assistantDisplayName)
    .replace(/\bZoikoTime assistant\b/g, `${assistantDisplayName} assistant`);
}

function slugify(value = "") {
  return normalizeText(value).replace(/\s+/g, "-") || uuidv4();
}

function createExpiryDate(base = Date.now()) {
  return new Date(base + SESSION_TTL_MS).toISOString();
}

function summarizeText(text = "", maxLength = 110) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1)}…`;
}

function extractQuestion(intent = {}) {
  if (intent.question) return intent.question;
  if (intent.title) return intent.title;
  if (Array.isArray(intent.keywords) && intent.keywords.length > 0) {
    return intent.keywords[0];
  }
  return "General help";
}

const intents = Array.isArray(knowledgeDocument.intents)
  ? knowledgeDocument.intents
      .filter((intent) => intent && intent.response)
      .map((intent) => ({
        id: intent.id || slugify(extractQuestion(intent)),
        question: extractQuestion(intent),
        answer: personalizeText(intent.response),
        keywords: Array.isArray(intent.keywords) ? intent.keywords : [],
        category: intent.category || "general",
      }))
  : [];

const defaultSuggestions = Array.isArray(knowledgeDocument.default_suggestions)
  ? knowledgeDocument.default_suggestions
  : intents.slice(0, 6).map((intent) => intent.question);

const quickActions = Array.isArray(knowledgeDocument.search_redirects)
  ? knowledgeDocument.search_redirects.slice(0, 6).map((item) => ({
      id: item.id,
      label: item.actionLabel || item.prompt || item.intentId || "Open",
      prompt: item.prompt || item.actionLabel || "Open section",
      message: item.prompt || item.actionLabel || item.intentId || "Help",
    }))
  : [];

const greetingIntent =
  intents.find((intent) =>
    intent.keywords.some((keyword) =>
      ["hi", "hello", "hey", "help", "start"].includes(normalizeText(keyword)),
    ),
  ) ||
  intents[0] ||
  null;

function scoreEntry(message, entry) {
  const messageText = normalizeText(message);
  const messageTokens = new Set(tokenize(message));
  let score = 0;

  if (messageText.includes(normalizeText(entry.question))) score += 10;

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) continue;

    if (messageText.includes(normalizedKeyword)) {
      score += 5;
      continue;
    }

    const kwTokens = tokenize(keyword);
    const matchedTokens = kwTokens.filter((t) => messageTokens.has(t));
    if (kwTokens.length > 0) {
      const ratio = matchedTokens.length / kwTokens.length;
      if (ratio >= 0.5) score += ratio * 3.5;
    }

    for (const token of kwTokens) {
      if (messageTokens.has(token)) score += 1.25;
    }
  }

  for (const token of tokenize(entry.question)) {
    if (messageTokens.has(token)) score += 0.85;
  }

  return score;
}

function buildFallbackAnswer(language = "en") {
  const fallbackSource =
    knowledgeDocument.fallback ||
    "I want to make sure I help you correctly. Could you clarify what you need?";
  return {
    id: uuidv4(),
    answer: personalizeText(fallbackSource),
    matchedQuestion: "Fallback response",
    confidence: 0.24,
    suggestions: defaultSuggestions.slice(0, 3),
    route: null,
    intent: "fallback",
    timestamp: new Date().toISOString(),
  };
}

function buildWelcomeMessage(_language = "en") {
  if (greetingIntent?.answer) return greetingIntent.answer;
  return personalizeText(
    knowledgeDocument.fallback || "How can I help you today?",
  );
}

function localizeAnswer(entry, language) {
  if (language !== "hi") return entry.answer;
  return entry.answer;
}

function createSessionId() {
  return uuidv4();
}

function createEmployeeId(company, email) {
  const companyCode = (company || "zoiko")
    .replace(/\s+/g, "")
    .slice(0, 4)
    .toUpperCase();
  const userCode = (email || "user").split("@")[0].slice(0, 4).toUpperCase();
  return `${companyCode}-${userCode}-${Date.now().toString().slice(-4)}`;
}

function createConversationSnapshot({
  sessionId,
  user,
  title = "New conversation",
}) {
  return {
    sessionId,
    userEmail: user?.email || "unknown@local",
    userName: user?.name || "",
    company: user?.company || "",
    employeeId: user?.employeeId || "",
    title,
    preview: "",
    messageCount: 0,
    status: "active",
    startedAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    expiresAt: createExpiryDate(),
  };
}

function getInMemoryConversation(sessionId) {
  const conversation = inMemoryConversations.get(sessionId);
  if (!conversation) return null;
  if (new Date(conversation.expiresAt).getTime() <= Date.now()) {
    inMemoryConversations.delete(sessionId);
    inMemoryHistory.delete(sessionId);
    return null;
  }
  return conversation;
}

async function upsertConversation({ sessionId, user, title, preview, status }) {
  const expiresAt = createExpiryDate();
  const now = new Date().toISOString();

  const payload = {
    sessionId,
    userEmail: user?.email || "unknown@local",
    userName: user?.name || "",
    company: user?.company || "",
    employeeId: user?.employeeId || "",
    lastMessageAt: now,
    expiresAt,
  };
  if (title) payload.title = summarizeText(title, 70);
  if (preview !== undefined) payload.preview = summarizeText(preview, 150);
  if (status) payload.status = status;

  const current =
    getInMemoryConversation(sessionId) ||
    createConversationSnapshot({ sessionId, user });

  const nextConversation = {
    ...current,
    ...payload,
    messageCount: current.messageCount || 0,
  };
  inMemoryConversations.set(sessionId, nextConversation);

  try {
    if (!supabase) return nextConversation;

    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (existing) {
      await supabase
        .from("conversations")
        .update({
          session_id: sessionId,
          user_email: payload.userEmail,
          user_name: payload.userName,
          company: payload.company,
          employee_id: payload.employeeId,
          last_message_at: payload.lastMessageAt,
          expires_at: payload.expiresAt,
          status: payload.status || existing.status || current.status,
          title: payload.title || existing.title || current.title,
          preview:
            payload.preview !== undefined
              ? payload.preview
              : existing.preview || current.preview,
        })
        .eq("session_id", sessionId);
    } else {
      await supabase.from("conversations").insert({
        session_id: sessionId,
        user_email: payload.userEmail,
        user_name: payload.userName,
        company: payload.company,
        employee_id: payload.employeeId,
        title: payload.title || current.title || "New conversation",
        preview: payload.preview ?? current.preview ?? "",
        message_count: current.messageCount || 0,
        started_at: current.startedAt || now,
        last_message_at: payload.lastMessageAt,
        expires_at: payload.expiresAt,
        status: status || "active",
      });
    }
  } catch (_error) {}

  return nextConversation;
}

async function incrementConversationMessageCount(
  sessionId,
  user,
  content,
  role,
) {
  const current =
    getInMemoryConversation(sessionId) ||
    createConversationSnapshot({ sessionId, user });

  const nextCount = (current.messageCount || 0) + 1;
  const nextTitle =
    current.title && current.title !== "New conversation"
      ? current.title
      : role === "user"
        ? summarizeText(content, 70)
        : current.title;

  const now = new Date().toISOString();
  const nextConversation = {
    ...current,
    title: nextTitle || "New conversation",
    preview: summarizeText(content, 150),
    messageCount: nextCount,
    lastMessageAt: now,
    expiresAt: createExpiryDate(),
  };
  inMemoryConversations.set(sessionId, nextConversation);

  try {
    if (!supabase) return;

    const { data: existing } = await supabase
      .from("conversations")
      .select("message_count")
      .eq("session_id", sessionId)
      .single();

    if (existing) {
      await supabase
        .from("conversations")
        .update({
          user_email: user?.email || "unknown@local",
          user_name: user?.name || "",
          company: user?.company || "",
          employee_id: user?.employeeId || "",
          title: nextConversation.title,
          preview: nextConversation.preview,
          message_count: (existing.message_count || 0) + 1,
          last_message_at: nextConversation.lastMessageAt,
          expires_at: nextConversation.expiresAt,
        })
        .eq("session_id", sessionId);
    } else {
      await supabase.from("conversations").insert({
        session_id: sessionId,
        user_email: user?.email || "unknown@local",
        user_name: user?.name || "",
        company: user?.company || "",
        employee_id: user?.employeeId || "",
        title: nextConversation.title,
        preview: nextConversation.preview,
        message_count: 1,
        status: "active",
        started_at: current.startedAt || now,
        last_message_at: nextConversation.lastMessageAt,
        expires_at: nextConversation.expiresAt,
      });
    }
  } catch (_error) {}
}

async function createConversationForUser(user) {
  const sessionId = createSessionId();
  const conversation = await upsertConversation({
    sessionId,
    user,
    title: "New conversation",
    preview: "",
    status: "active",
  });
  return { sessionId, expiresAt: conversation.expiresAt };
}

async function findOrCreateConversationForUser(user) {
  const now = new Date().toISOString();
  try {
    if (!supabase) throw new Error("Supabase not configured");

    const { data: existing } = await supabase
      .from("conversations")
      .select("session_id, expires_at")
      .eq("user_email", user?.email || "unknown@local")
      .gt("expires_at", now)
      .order("last_message_at", { ascending: false })
      .limit(1)
      .single();

    if (existing)
      return { sessionId: existing.session_id, expiresAt: existing.expires_at };
  } catch (_error) {}

  const memoryConversation = [...inMemoryConversations.values()]
    .filter(
      (conversation) =>
        conversation.userEmail === (user?.email || "unknown@local") &&
        new Date(conversation.expiresAt).getTime() > Date.now(),
    )
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))[0];

  if (memoryConversation)
    return {
      sessionId: memoryConversation.sessionId,
      expiresAt: memoryConversation.expiresAt,
    };

  return createConversationForUser(user);
}

async function endConversation(sessionId, userEmail) {
  const conversation = getInMemoryConversation(sessionId);
  if (conversation && (!userEmail || conversation.userEmail === userEmail)) {
    conversation.status = "ended";
    conversation.lastMessageAt = new Date().toISOString();
    inMemoryConversations.set(sessionId, conversation);
  }
  try {
    if (!supabase) return;

    let query = supabase
      .from("conversations")
      .update({
        status: "ended",
        last_message_at: new Date().toISOString(),
        expires_at: createExpiryDate(),
      })
      .eq("session_id", sessionId);

    if (userEmail) query = query.eq("user_email", userEmail);

    await query;
  } catch (_error) {}
}

async function deleteConversation(sessionId, userEmail) {
  inMemoryConversations.delete(sessionId);
  inMemoryHistory.delete(sessionId);
  try {
    let convQuery = supabase
      .from("conversations")
      .delete()
      .eq("session_id", sessionId);
    if (userEmail) convQuery = convQuery.eq("user_email", userEmail);
    await convQuery;

    let chatQuery = supabase
      .from("chats")
      .delete()
      .eq("session_id", sessionId);
    if (userEmail) chatQuery = chatQuery.eq("user_email", userEmail);
    await chatQuery;
  } catch (_error) {}
}

async function listUserConversations(userEmail) {
  const now = Date.now();
  const memoryConversations = [...inMemoryConversations.values()]
    .filter(
      (conversation) =>
        conversation.userEmail === userEmail &&
        new Date(conversation.expiresAt).getTime() > now,
    )
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
    .map((conversation) => ({
      sessionId: conversation.sessionId,
      title: conversation.title,
      preview: conversation.preview,
      messageCount: conversation.messageCount,
      status: conversation.status,
      startedAt: conversation.startedAt,
      lastMessageAt: conversation.lastMessageAt,
      expiresAt: conversation.expiresAt,
    }));

  try {
    if (!supabase) throw new Error("Supabase not configured");

    const { data: conversations } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_email", userEmail)
      .gt("expires_at", new Date().toISOString())
      .order("last_message_at", { ascending: false });

    if (conversations && conversations.length) {
      return conversations.map((conversation) => ({
        sessionId: conversation.session_id,
        title: conversation.title,
        preview: conversation.preview,
        messageCount: conversation.message_count,
        status: conversation.status,
        startedAt: conversation.started_at,
        lastMessageAt: conversation.last_message_at,
        expiresAt: conversation.expires_at,
      }));
    }
  } catch (_error) {}

  return memoryConversations;
}

function generateChatReply(message, language = "en") {
  const normalizedMessage = normalizeText(message);
  const emailManagerPrompt = knowledgeDocument.email_manager_prompt;
  if (
    emailManagerPrompt &&
    Array.isArray(emailManagerPrompt.trigger_keywords) &&
    emailManagerPrompt.trigger_keywords.some((keyword) =>
      normalizedMessage.includes(normalizeText(keyword)),
    )
  ) {
    return {
      id: uuidv4(),
      answer: personalizeText(emailManagerPrompt.response),
      matchedQuestion: "Email manager",
      confidence: 0.98,
      suggestions: defaultSuggestions.slice(0, 3),
      route: null,
      intent: "email_manager",
      timestamp: new Date().toISOString(),
    };
  }

  const ranked = intents
    .map((entry) => ({ ...entry, score: scoreEntry(message, entry) }))
    .sort((a, b) => b.score - a.score);
  const bestMatch = ranked[0];

  if (!bestMatch || bestMatch.score < 1.5) return buildFallbackAnswer(language);

  const confidence = Math.min(0.99, Number((bestMatch.score / 16).toFixed(2)));

  const originalIntent = knowledgeDocument.intents.find(
    (intent) =>
      (intent.id || slugify(extractQuestion(intent))) === bestMatch.id,
  );

  return {
    id: uuidv4(),
    answer: localizeAnswer(bestMatch, language),
    matchedQuestion: bestMatch.question,
    confidence,
    suggestions: Array.isArray(originalIntent?.suggestions)
      ? originalIntent.suggestions
      : ranked.slice(1, 4).map((entry) => entry.question),
    route: originalIntent?.route ?? null,
    intent: bestMatch.id,
    timestamp: new Date().toISOString(),
  };
}

async function getUnknownPrompts() {
  if (!supabase) return [];

  try {
    return await NewPrompt.listAll();
  } catch (error) {
    console.error("[ChatService] Failed to load unknown prompts:", error.message);
    return [];
  }
}

function getChatContext() {
  const assistantName = personalizeText(
    knowledgeDocument._meta?.assistantName || "Koiris",
  );
  return {
    assistantName,
    productName: knowledgeDocument._meta?.product || "ZoikoTime",
    assistantBadge: "AI WORK ASSISTANT",
    statusText: "Live knowledge base active",
    welcomeMessage: buildWelcomeMessage("en"),
    welcomeMessageHi: buildWelcomeMessage("en"),
    quickActions:
      quickActions.length > 0
        ? quickActions
        : defaultSuggestions.slice(0, 6).map((item) => ({
            id: slugify(item),
            label: item,
            prompt: item,
            message: item,
          })),
    defaultSuggestions: defaultSuggestions.slice(0, 6),
    retentionHours: 24,
  };
}

async function saveMessage({
  sessionId,
  user,
  userEmail,
  role,
  content,
  metadata = {},
}) {
  const expiresAt = createExpiryDate();
  const message = {
    id: uuidv4(),
    role,
    content,
    metadata,
    timestamp: new Date().toISOString(),
  };

  const existing = inMemoryHistory.get(sessionId) || [];
  inMemoryHistory.set(sessionId, [...existing, message]);

  await incrementConversationMessageCount(
    sessionId,
    user || { email: userEmail },
    content,
    role,
  );

  try {
    if (!supabase) return message;

    await supabase.from("chats").insert({
      session_id: sessionId,
      user_email: userEmail,
      role,
      content,
      metadata,
      expires_at: expiresAt,
    });
  } catch (_error) {}

  return message;
}

async function getSessionHistory(sessionId) {
  const fallbackMessages = inMemoryHistory.get(sessionId) || [];
  try {
    if (!supabase) throw new Error("Supabase not configured");

    const { data: dbMessages } = await supabase
      .from("chats")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!dbMessages || !dbMessages.length) return fallbackMessages;

    return dbMessages.map((entry) => ({
      id: entry.id.toString(),
      role: entry.role,
      content: entry.content,
      meta: entry.metadata,
      timestamp: entry.created_at,
    }));
  } catch (_error) {
    return fallbackMessages.map((entry) => ({
      id: entry.id,
      role: entry.role,
      content: entry.content,
      meta: entry.metadata,
      timestamp: entry.timestamp,
    }));
  }
}

module.exports = {
  createConversationForUser,
  createEmployeeId,
  createSessionId,
  deleteConversation,
  endConversation,
  findOrCreateConversationForUser,
  generateChatReply,
  getChatContext,
  getUnknownPrompts,
  getSessionHistory,
  listUserConversations,
  saveMessage,
  trackUnknownPrompt,
};
