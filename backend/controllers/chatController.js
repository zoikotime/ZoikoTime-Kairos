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

async function sendChatMessage(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { sessionId, message, user, language = "en" } = req.body;

    await saveMessage({
      sessionId,
      user,
      userEmail: user?.email || "unknown@local",
      role: "user",
      content: message,
    });

    const reply = generateChatReply(message, language);

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
      },
    });

    return res.json({
      success: true,
      message: reply,
    });
  } catch (error) {
    next(error);
  }
}

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

async function closeSession(req, res, next) {
  try {
    const { userEmail } = req.body;
    await endConversation(req.params.sessionId, userEmail?.toLowerCase().trim());
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

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
