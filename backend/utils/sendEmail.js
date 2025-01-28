import transporter from "../config/emailconfig.js";

export const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "2FA Verification Code",
    html: `
      <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
        <h2 style="color: #333;">Your Verification Code</h2>
        <p>Please use this code to complete your login:</p>
        <h1 style="color: #007bff; letter-spacing: 2px;">${otp}</h1>
        <p style="color: #666;">This code will expire in 5 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendEmailVerification = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Verify Your Email",
    html: `
      <div style="padding: 20px; background-color: #f8f9fa;">
        <h2>Email Verification</h2>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
