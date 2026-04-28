const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY);
if (hasSendGrid) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

async function sendEscalationEmail(payload) {
  if (hasSendGrid) {
    await sgMail.send({
      to: payload.to,
      from: process.env.MAIL_FROM,
      subject: payload.subject,
      html: payload.html,
    });
    return { provider: "sendgrid", success: true };
  }

  const transporter = nodemailer.createTransport({
    jsonTransport: true,
  });

  await transporter.sendMail({
    to: payload.to,
    from: process.env.MAIL_FROM,
    subject: payload.subject,
    html: payload.html,
  });

  return { provider: "nodemailer-json", success: true };
}

module.exports = { sendEscalationEmail };
