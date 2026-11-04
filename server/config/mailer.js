const nodemailer = require('nodemailer');

const requiredSmtpSettings = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'];

const createTransporter = () => {
  const missingSetting = requiredSmtpSettings.find((setting) => !process.env[setting]);
  if (missingSetting) {
    throw new Error(`${missingSetting} must be configured to send email notifications.`);
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

const sendVerificationOtp = async (email, otp) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'CCPD email verification OTP',
    text: `Your CCPD verification OTP is ${otp}. It expires in 10 minutes.`
  });
};

const sendNoticeEmail = async ({ recipients, title, content, senderName, companyName }) => {
  const transporter = createTransporter();
  const subject = companyName ? `${title} - ${companyName}` : title;
  const text = [
    title,
    '',
    content,
    '',
    `Sent by ${senderName} through the CCPD Placement Portal.`,
    companyName ? `Placement company: ${companyName}` : ''
  ].filter(Boolean).join('\n');
  const results = await Promise.allSettled(
    recipients.map((recipient) => transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipient,
      subject,
      text
    }))
  );
  return {
    delivered: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length
  };
};

module.exports = { sendVerificationOtp, sendNoticeEmail };
