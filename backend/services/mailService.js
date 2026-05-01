const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const nodemailer = require("nodemailer");

console.log("ENV CHECK:", {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? "loaded" : "MISSING",
  from: process.env.FROM_EMAIL,
});

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 465,
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
});

// ✅ VERIFY CONNECTION
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error);
  } else {
    console.log("✅ SMTP Server Ready");
  }
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendMail = async ({ to, from, subject, body, html }) => {
  if (!to || !subject) {
    throw new Error("Missing required fields: to, subject");
  }

  if (!emailRegex.test(to)) throw new Error("Invalid recipient email");
  if (from && !emailRegex.test(from))
    throw new Error("Invalid sender email");

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    replyTo: from,
    to,
    subject,

    text:
      body ||
      "User has reported an issue. Please view this email in HTML format.",

    html:
      html ||
      `
      <div style="font-family: Arial; padding: 10px;">
        <h3>User Issue</h3>
        <p>${(body || "No content").replace(/\n/g, "<br/>")}</p>
      </div>
      `,
  });
};

module.exports = { sendMail };