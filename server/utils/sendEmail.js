const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

// Sends an HTML email. If SMTP isn't configured (e.g. local dev), logs the
// email to the console instead of failing — callers should never let a
// delivery failure change what's shown to the end user (see forgot-password).
async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log("\n📧 [DEV] SMTP not configured — email would be sent:");
    console.log(`   To: ${to}\n   Subject: ${subject}\n${html}\n`);
    return;
  }
  await t.sendMail({
    from: process.env.EMAIL_FROM || `"EventSync" <no-reply@eventsync.local>`,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
