const { sendMail } = require("../services/mailService");
const { getSessionHistory } = require("../services/chatService");
const { formatChatHistory } = require("../utils/formatChatHistory");
const { getMailLimitStatus } = require("../middlewares/rateLimiter");
const {
  detectLanguageFromText,
  processSupportEmail,
  translateTranscriptMessages,
} = require("../utils/translate");

function extractSupportMailSections(rawBody = "", fallbackSubject = "") {
  const cleanBody = typeof rawBody === "string" ? rawBody : "";
  const issueMatch = cleanBody.match(
    /Issue:\s*([\s\S]*?)\s*-{2,}\s*User Description:/i,
  );
  const descriptionMatch = cleanBody.match(
    /User Description:\s*([\s\S]*?)\s*-{2,}\s*Chat History:/i,
  );

  return {
    issue: (issueMatch?.[1] || fallbackSubject || "").trim(),
    description: (descriptionMatch?.[1] || cleanBody || "").trim(),
  };
}

function resolveOriginalLanguage({
  originalIssue = "",
  originalDescription = "",
  translatedMessages = [],
  translatedBody,
  translatedSubject,
}) {
  const detectedFromOriginalText = detectLanguageFromText(
    `${originalDescription} ${originalIssue}`.trim(),
  );

  if (detectedFromOriginalText && detectedFromOriginalText !== "Unknown") {
    return detectedFromOriginalText;
  }

  if (
    translatedBody?.sourceLang &&
    !["unknown", "english"].includes(translatedBody.sourceLang.toLowerCase())
  ) {
    return translatedBody.sourceLang;
  }

  if (
    translatedSubject?.sourceLang &&
    !["unknown", "english"].includes(translatedSubject.sourceLang.toLowerCase())
  ) {
    return translatedSubject.sourceLang;
  }

  const userLanguage = translatedMessages.find(
    (message) =>
      message.role === "user" &&
      message.detectedLanguage &&
      !["unknown", "english"].includes(message.detectedLanguage.toLowerCase()),
  )?.detectedLanguage;

  if (userLanguage) return userLanguage;

  return "English";
}

const sendMailHandler = async (req, res) => {
  try {
    const { sessionId, user, to, subject, body } = req.body;

    if (!sessionId || !user?.email || !to || !subject) {
      return res.status(400).json({
        success: false,
        code: "MISSING_FIELDS",
        message: "Missing required fields.",
      });
    }

    const messages = (await getSessionHistory(sessionId)).slice(-10);
    const extracted = extractSupportMailSections(body || "", subject);
    const [translatedSubject, translatedBody, translatedMessages] =
      await Promise.all([
        processSupportEmail(extracted.issue || subject),
        processSupportEmail(extracted.description || ""),
        translateTranscriptMessages(messages),
      ]);

    const html = formatChatHistory(
      translatedMessages,
      user,
      extracted.issue || subject,
      extracted.description || "",
      {
        originalLanguage: resolveOriginalLanguage({
          originalIssue: extracted.issue || subject,
          originalDescription: extracted.description || "",
          translatedMessages,
          translatedBody,
          translatedSubject,
        }),
        translatedSubject: translatedSubject.englishBody || extracted.issue || subject,
        translatedDescription: translatedBody.englishBody || extracted.description || "",
        wasTranslated:
          translatedSubject.wasTranslated || translatedBody.wasTranslated,
      },
    );

    await sendMail({
      to,
      from: user.email,
      subject: translatedSubject.englishBody || subject,
      html,
      body: translatedBody.englishBody || body,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully.",
    });

  } catch (error) {
    console.error("[MailController] Error:", error.message);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Something went wrong. Please try again later.",
    });
  }
};

const getMailStatusHandler = async (req, res) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        code: "MISSING_EMAIL",
        message: "Email is required.",
      });
    }

    const status = await getMailLimitStatus(email);
    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("[MailController] Status error:", error.message);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Unable to check mail status right now.",
    });
  }
};

module.exports = { sendMailHandler, getMailStatusHandler };
