const { validationResult } = require("express-validator");
const {
  createConversationForUser,
  deleteConversation,
  endConversation,
  generateChatReply,
  getChatContext,
  getSessionHistory,
  listUserConversations,
  saveMessage,
} = require("../services/chatService");

// 🔥 MAIN CHAT FUNCTION
async function sendChatMessage(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    let { sessionId, message, user, language = "en" } = req.body;

    // ✅ prevent empty messages
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // ✅ fallback language
    if (!["en", "hi"].includes(language)) {
      console.log("⚠️ Invalid language:", language);
      language = "en";
    }

    // 🔥 CREATE SESSION ONLY WHEN FIRST MESSAGE COMES
    if (!sessionId) {
      const session = await createConversationForUser(user);
      sessionId = session.sessionId;
      console.log("🆕 Created new session:", sessionId);
    }

    // ✅ SAVE USER MESSAGE
    await saveMessage({
      sessionId,
      user,
      userEmail: user?.email || "unknown@local",
      role: "user",
      content: message.trim(),
    });

    // ✅ GENERATE BOT REPLY (safe)
    let reply;
    try {
      reply = generateChatReply(message, language);
    } catch (err) {
      console.error("❌ Reply generation failed:", err);
      reply = {
        answer: "Sorry, something went wrong.",
        suggestions: [],
        route: null,
        intent: "error",
      };
    }

    // ✅ SAVE ASSISTANT MESSAGE
    await saveMessage({
      sessionId,
      user,
      userEmail: user?.email || "unknown@local",
      role: "assistant",
      content: reply.answer,
      metadata: {
        matchedQuestion: reply.matchedQuestion,
        confidence: reply.confidence,
        suggestions: reply.suggestions,
        route: reply.route, // ✅ FIX 4: persist route from knowledge.json
        intent: reply.intent, // ✅ FIX 4: persist intent id from knowledge.json
      },
    });

    // ✅ RETURN RESPONSE
    return res.json({
      success: true,
      sessionId,
      message: reply,
    });
  } catch (error) {
    console.error("❌ ERROR in sendChatMessage:", error);
    next(error);
  }
}

// 🔹 GET CHAT HISTORY
async function getChatHistory(req, res, next) {
  try {
    const messages = await getSessionHistory(req.params.sessionId);
    const context = getChatContext();

    return res.json({
      success: true,
      messages:
        messages.length > 0
          ? messages
          : [
              {
                id: "welcome",
                role: "assistant",
                content: context.welcomeMessage,
                timestamp: new Date().toISOString(),
              },
            ],
    });
  } catch (error) {
    next(error);
  }
}

// 🔹 GET UI CONTEXT
function getChatUiContext(_req, res, next) {
  try {
    return res.json({
      success: true,
      context: getChatContext(),
    });
  } catch (error) {
    next(error);
  }
}

// 🔹 GET USER SESSIONS
async function getUserSessions(req, res, next) {
  try {
    const email = (req.query.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const sessions = await listUserConversations(email);
    return res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
}

// 🔹 CREATE SESSION (optional endpoint)
async function createSession(req, res, next) {
  try {
    const { user } = req.body;
    if (!user?.email) {
      return res.status(400).json({
        success: false,
        message: "User details are required.",
      });
    }

    const session = await createConversationForUser(user);
    return res.json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
}

// 🔹 END SESSION
async function closeSession(req, res, next) {
  try {
    const { userEmail } = req.body;
    await endConversation(
      req.params.sessionId,
      userEmail?.toLowerCase().trim(),
    );
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

// 🔹 DELETE SESSION
async function removeSession(req, res, next) {
  try {
    const userEmail = (req.query.userEmail || "").toLowerCase().trim();
    await deleteConversation(req.params.sessionId, userEmail || undefined);
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  closeSession,
  createSession,
  getChatUiContext,
  sendChatMessage,
  getChatHistory,
  getUserSessions,
  removeSession,
};
