const fs = require("node:fs");
const path = require("node:path");
const { v4: uuidv4 } = require("uuid");
const Chat = require("../models/Chat");
const Conversation = require("../models/Conversation");

// FIXED: Point to correct knowledge.json location (root, not /data)
// const knowledgePath = path.resolve(__dirname, "..", "data", "knowledge.json");
// const knowledgeDocument = JSON.parse(fs.readFileSync(knowledgePath, "utf-8"));
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
  return new Date(base + SESSION_TTL_MS);
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
    if (messageText.includes(normalizedKeyword)) score += 5;
    for (const token of tokenize(keyword)) {
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
    startedAt: new Date(),
    lastMessageAt: new Date(),
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
  const payload = {
    sessionId,
    userEmail: user?.email || "unknown@local",
    userName: user?.name || "",
    company: user?.company || "",
    employeeId: user?.employeeId || "",
    lastMessageAt: new Date(),
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
    const existing = await Conversation.findOne({ sessionId });
    const messageCount = existing?.messageCount || current.messageCount || 0;
    const record = await Conversation.findOneAndUpdate(
      { sessionId },
      {
        ...payload,
        title: payload.title || existing?.title || current.title,
        preview:
          payload.preview !== undefined
            ? payload.preview
            : existing?.preview || current.preview,
        messageCount,
        startedAt: existing?.startedAt || current.startedAt || new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    inMemoryConversations.set(sessionId, {
      sessionId: record.sessionId,
      userEmail: record.userEmail,
      userName: record.userName,
      company: record.company,
      employeeId: record.employeeId,
      title: record.title,
      preview: record.preview,
      messageCount: record.messageCount,
      status: record.status,
      startedAt: record.startedAt,
      lastMessageAt: record.lastMessageAt,
      expiresAt: record.expiresAt,
    });
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
  const nextConversation = {
    ...current,
    title: nextTitle || "New conversation",
    preview: summarizeText(content, 150),
    messageCount: nextCount,
    lastMessageAt: new Date(),
    expiresAt: createExpiryDate(),
  };
  inMemoryConversations.set(sessionId, nextConversation);
  try {
    await Conversation.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          userEmail: user?.email || "unknown@local",
          userName: user?.name || "",
          company: user?.company || "",
          employeeId: user?.employeeId || "",
          title: nextConversation.title,
          preview: nextConversation.preview,
          lastMessageAt: nextConversation.lastMessageAt,
          expiresAt: nextConversation.expiresAt,
        },
        $inc: { messageCount: 1 },
        $setOnInsert: {
          startedAt: current.startedAt || new Date(),
          status: "active",
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
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
  const now = new Date();
  try {
    const existing = await Conversation.findOne({
      userEmail: user?.email || "unknown@local",
      expiresAt: { $gt: now },
    })
      .sort({ lastMessageAt: -1 })
      .lean();
    if (existing)
      return { sessionId: existing.sessionId, expiresAt: existing.expiresAt };
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
    conversation.lastMessageAt = new Date();
    inMemoryConversations.set(sessionId, conversation);
  }
  try {
    await Conversation.findOneAndUpdate(
      { sessionId, ...(userEmail ? { userEmail } : {}) },
      {
        status: "ended",
        lastMessageAt: new Date(),
        expiresAt: createExpiryDate(),
      },
    );
  } catch (_error) {}
}
async function deleteConversation(sessionId, userEmail) {
  inMemoryConversations.delete(sessionId);
  inMemoryHistory.delete(sessionId);
  try {
    await Conversation.deleteOne({
      sessionId,
      ...(userEmail ? { userEmail } : {}),
    });
    await Chat.deleteMany({ sessionId, ...(userEmail ? { userEmail } : {}) });
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
    const conversations = await Conversation.find({
      userEmail,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastMessageAt: -1 })
      .lean();
    if (conversations.length) {
      return conversations.map((conversation) => ({
        sessionId: conversation.sessionId,
        title: conversation.title,
        preview: conversation.preview,
        messageCount: conversation.messageCount,
        status: conversation.status,
        startedAt: conversation.startedAt,
        lastMessageAt: conversation.lastMessageAt,
        expiresAt: conversation.expiresAt,
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
      timestamp: new Date().toISOString(),
    };
  }
  const ranked = intents
    .map((entry) => ({ ...entry, score: scoreEntry(message, entry) }))
    .sort((a, b) => b.score - a.score);
  const bestMatch = ranked[0];
  if (!bestMatch || bestMatch.score < 3) return buildFallbackAnswer(language);
  const confidence = Math.min(0.99, Number((bestMatch.score / 16).toFixed(2)));
  return {
    id: uuidv4(),
    answer: localizeAnswer(bestMatch, language),
    matchedQuestion: bestMatch.question,
    confidence,
    suggestions: ranked.slice(1, 4).map((entry) => entry.question),
    timestamp: new Date().toISOString(),
  };
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
    await Chat.create({
      sessionId,
      userEmail,
      role,
      content,
      metadata,
      expiresAt,
    });
  } catch (_error) {}
  return message;
}

async function getSessionHistory(sessionId) {
  const fallbackMessages = inMemoryHistory.get(sessionId) || [];
  try {
    const dbMessages = await Chat.find({ sessionId })
      .sort({ createdAt: 1 })
      .lean();
    if (!dbMessages.length) return fallbackMessages;
    return dbMessages.map((entry) => ({
      id: entry._id.toString(),
      role: entry.role,
      content: entry.content,
      meta: entry.metadata,
      timestamp: entry.createdAt,
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
  getSessionHistory,
  listUserConversations,
  saveMessage,
};
