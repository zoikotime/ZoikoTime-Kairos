const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (req, res) => {
  try {
    const { from, to, subject, body } = req.body;

    if (!from || !to || !subject) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const msg = {
      to,
      from: process.env.FROM_EMAIL, // ✅ MUST be verified in SendGrid
      replyTo: from, // ✅ user's email
      subject,
      text: body || "No message provided",
    };

    await sgMail.send(msg);

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Mail Error:", error.response?.body || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};

module.exports = { sendMail };