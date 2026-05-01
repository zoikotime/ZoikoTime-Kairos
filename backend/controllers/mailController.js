const { sendMail } = require("../services/mailService");
const { getSessionHistory } = require("../services/chatService");
const { formatChatHistory } = require("../utils/formatChatHistory");

const sendMailHandler = async (req, res) => {
  try {
    const { sessionId, user, to, subject, body } = req.body;

    if (!sessionId || !user || !to) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const messages = await getSessionHistory(sessionId);

    // ✅ Pass subject and body so agent sees the issue clearly
    const html = formatChatHistory(messages, user, subject, body);

    await sendMail({ to, from: user.email, subject, html });

    res.json({ success: true, message: "Email sent successfully" });

  } catch (error) {
    console.error("Mail Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to send email" });
  }
};

module.exports = { sendMailHandler };