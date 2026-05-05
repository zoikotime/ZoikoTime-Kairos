const { sendMail } = require("../services/mailService");
const { getSessionHistory } = require("../services/chatService");
const { formatChatHistory } = require("../utils/formatChatHistory");

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

    const messages = await getSessionHistory(sessionId);
    const html = formatChatHistory(messages, user, subject, body);

    await sendMail({ to, from: user.email, subject, html });

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

module.exports = { sendMailHandler };