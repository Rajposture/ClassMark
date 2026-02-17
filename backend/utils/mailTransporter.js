import nodemailer from "nodemailer";

export const createTransporter = () => {
  if (!process.env.MAIL_HOST || !process.env.MAIL_PORT) {
    throw new Error("Mail environment variables not loaded");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT), // ✅ FIX
    secure: false, // for 587
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};
