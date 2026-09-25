const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null; // no SMTP configured - emails will just be logged
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[mailer] SMTP not configured - would send email to ${to}: ${subject}`);
    return { skipped: true };
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || 'Sapna Digital Studio <no-reply@sapnadigitalstudio.com>',
      to,
      subject,
      html,
      text,
    });
    return { sent: true };
  } catch (err) {
    console.error('[mailer] failed to send email:', err.message);
    return { error: err.message };
  }
}

module.exports = { sendMail };
