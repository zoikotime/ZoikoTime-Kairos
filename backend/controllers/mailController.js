const { sendMail } = require("../services/mailService");

const sendMailHandler = async (req, res) => {
  try {
    const { from, to, subject, body } = req.body;

    if (!from || !to || !subject) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: from, to, subject",
      });
    }

    await sendMail({ to, from, subject, body });

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Mail Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to send email",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
};

module.exports = { sendMailHandler };