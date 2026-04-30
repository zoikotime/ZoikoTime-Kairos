const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const nodemailer = require("nodemailer");

console.log("ENV CHECK:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? "loaded" : "MISSING",
  from: process.env.FROM_EMAIL,
});

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net", // hardcode this, don't use env var
  port: 465,
  secure: true,
  tls: {
    rejectUnauthorized: false, // ← add this
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendMail = async ({ to, from, subject, body, html }) => {
  if (!emailRegex.test(to)) throw new Error("Invalid recipient email");
  if (from && !emailRegex.test(from)) throw new Error("Invalid sender email");

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    replyTo: from,
    to,
    subject,
    text: body || "",
    html: html || body || "",
  });
};

module.exports = { sendMail };
