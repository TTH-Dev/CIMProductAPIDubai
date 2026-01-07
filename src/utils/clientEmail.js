import nodemailer from "nodemailer";
import { decrypt } from "./crypto.js";

const sendEmailClient = async (smtpData, mailOptions) => {
  try {
    if (process.env.SEND_EMAIL === "false") {
      console.log("Email not sent because SEND_EMAIL is set to false");
      return;
    }

    const smtpPlainPass = decrypt(smtpData.smtpPass);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: smtpData.smtpuserId,
        pass: smtpPlainPass,
      },
    });

    const info = await transporter.sendMail({
      from: smtpData.smtpUserEmail,
      ...mailOptions,
    });
    return info;
  } catch (error) {
    throw error;
  }
};

export default sendEmailClient;
