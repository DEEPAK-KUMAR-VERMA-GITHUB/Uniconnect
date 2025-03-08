export const forgotPasswordEmailTemplate = (username, resetUrl) => {
  return `<h1>Uniconnect Password Reset </h1>
  <p>Hi <strong>${username}</strong></p>
  <p>You are receiving this email because you have requested for password reset on <strong>Uniconnect</strong>. If you don't please ignore it and don't share it with anyone.</p><p>This link is valid only for ${process.env.RESET_PASSWORD_EXPIRES} minutes.</p><p>${resetUrl}</p><p>For any assistance contact us @${process.env.NODEMAILER_EMAIL}</p>`;
};
