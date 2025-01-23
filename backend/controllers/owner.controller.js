import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit"; // Import rate limiter
import Owner from "../models/owner.model.js";
import { adminToken } from "../utils/generateToken.js";

// Create a login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: {
    error: "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Signup controller with password policy enforcement
export const Signup = async (req, res) => {
  console.log("signup");

  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Password policy enforcement
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "Password and confirm password do not match" });
    }

    const ownerExist = await Owner.findOne({ email: email });
    if (ownerExist) {
      return res.status(400).json({ error: "Owner already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOwner = new Owner({
      name,
      email,
      password: hashedPassword,
      role: "owner",
    });

    await newOwner.save();
    if (!newOwner) {
      return res.status(500).json({ error: "Owner not created" });
    }
    res.status(201).json({ message: "Owner created successfully" });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Signin controller with rate limiting
export const Signin = [
  loginLimiter, // Apply login limiter middleware
  async (req, res) => {
    try {
      const { email, password } = req.body; 

      const owner = await Owner.findOne({ email: email });
      if (!owner) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, owner.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = adminToken(owner);
      res.cookie("token", token, {        
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day expiration
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV !== "development",
      });
      res.status(200).json({ message: "Logged in successfully", role: owner.role });
    } catch (error) {
      console.log("Error in signin controller", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Logout implementation
export const Logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Check Owner authentication
export const checkOwner = async (req, res) => {
  const owner = req.owner;
  try {
    const ownerData = await Owner.findOne({ _id: owner.ownerId });
    if (!ownerData) {
      return res.status(404).json({ message: "Owner not found", success: false });
    }

    if (ownerData.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Authentication failed", success: false });
    }

    res.status(200).json({ message: "Authenticate Owner", success: true });
  } catch (error) {
    console.error("Error while checking owner status:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Check Admin authentication
export const checkAdmin = async (req, res) => {
  const owner = req.owner;
  try {
    const adminData = await Owner.findOne({ _id: owner.ownerId });
    if (!adminData) {
      return res.status(404).json({ message: "Admin not found", success: false });
    }

    if (adminData.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Authentication failed", success: false });
    }

    res.status(200).json({ message: "Authenticate Admin", success: true });
  } catch (error) {
    console.error("Error while checking admin status:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
