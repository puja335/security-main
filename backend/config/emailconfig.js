import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "shahipuja335@gmail.com",
    pass: "goic ysxr fiwb xmms",
  },
  tls: {
    rejectUnauthorized: false, // Helps avoid TLS errors
  },
});

export default transporter;

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const isOTPExpired = (expiryTime) =>
  Date.now() > new Date(expiryTime).getTime();
