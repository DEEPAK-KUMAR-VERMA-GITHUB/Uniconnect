import ErrorHandler from "./ErrorHandler.js";
import nodemailer from "nodemailer";

export const sendEmail = async (user, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_APP_PASSWORD
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    throw new ErrorHandler("Error sending email", 500);
  }
};
