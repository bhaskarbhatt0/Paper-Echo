import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = (to, resetLink) => {
  return transporter.sendMail({
    from: `"Paper Echo" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your Paper Echo password",
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
    `,
  });
};

export const sendContactEmail = (name, fromEmail, message) => {
  return transporter.sendMail({
    from: `"Paper Echo Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: fromEmail,
    subject: `New message from ${name} via Paper Echo contact form`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${fromEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });
};

export default transporter;
