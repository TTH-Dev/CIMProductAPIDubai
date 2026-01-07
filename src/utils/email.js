import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERID,
    pass: process.env.SMTP_PASS,
  },
});

// Define a function to send an email
const sendEmail = async (mailOptions) => {
  try {
    if (process.env.SEND_EMAIL === "false") {
      console.log("Email not sent because SEND_EMAIL is set to false");
      return;
    }

    const info = await transporter.sendMail({
      from: `"NextGenMed" <info@nextgenmed.in>`,
      ...mailOptions,
    });
    return info;
  } catch (error) {
    throw error;
  }
};




export default sendEmail;






