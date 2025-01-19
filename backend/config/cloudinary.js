// config/cloudinary.js

import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ||946225538192519,
  api_secret: process.env.CLOUDINARY_API_SECRET || "IFSpOtLpUKwOtuWhe24DFeo-OK0",
});

export default cloudinary.v2;
