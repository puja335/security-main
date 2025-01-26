import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { generateOTP, isOTPExpired } from "../config/emailconfig.js";
import User from "../models/user.model.js"; // Import User model
import { generateToken } from "../utils/generateToken.js";
import {
  sendEmailVerification,
  sendVerificationEmail,
} from "../utils/sendEmail.js";

// Add password expiry duration (in days)
const PASSWORD_EXPIRY_DAYS = 90;
const PASSWORD_HISTORY_LIMIT = 5; // Number of previous passwords to track
// Function to assess password strength
function passwordStrength(password) {
  let strength = 0;

  // Check the length of the password
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) strength++;

  // Check for lowercase letters
  if (/[a-z]/.test(password)) strength++;

  // Check for numbers
  if (/\d/.test(password)) strength++;

  // Check for special characters
  if (/[\W_]/.test(password)) strength++;

  // Evaluate the strength
  if (strength <= 2) return { value: "Weak" };
  if (strength <= 4) return { value: "Medium" };
  return { value: "Strong" };
}

// user checking
export const checkUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("token", token);
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    const user = await User.findById(decoded.id || decoded.data);

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        error: "Email not verified",
      });
    }

    req.user = decoded;
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};

// get user

// controllers/user.controller.js
export const getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select(
      "-password -passwordHistory"
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 12);
    // check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();
    await sendEmailVerification(email, verificationToken);

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendEmailVerification(email, verificationToken);
    res.status(200).json({ message: "Verification email resent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add password expiry check middleware
export const checkPasswordExpiry = async (req, res, next) => {
  const PASSWORD_EXPIRY_DAYS = 90;

  try {
    const user = await User.findById(req.user.id);
    const daysSinceUpdate =
      (Date.now() - user.passwordUpdatedAt) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate > PASSWORD_EXPIRY_DAYS) {
      return res.status(403).json({
        error: "Password expired. Please update your password to continue.",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const newUsers = async (req, res) => {
  try {
    const newUsers = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: newUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const totalUsers = async (req, res) => {
  try {
    const total = await User.countDocuments();
    return res.status(200).json({ success: true, data: total });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.twoFactorAuth = {
      enabled: false,
      otp: { code: otp, expiresAt },
    };
    await user.save();

    await sendVerificationEmail(user.email, otp);
    res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.userId || req.user.data);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "User not found please login again" });
    }

    if (!user.twoFactorAuth.otp) {
      return res.status(400).json({ error: "Please request a new code" });
    }

    if (isOTPExpired(user.twoFactorAuth.otp.expiresAt)) {
      return res.status(400).json({ error: "Code expired" });
    }

    if (user.twoFactorAuth.otp.code !== otp) {
      return res.status(400).json({ error: "Invalid code" });
    }

    user.twoFactorAuth.enabled = true;
    user.twoFactorAuth.otp = undefined;
    await user.save();
    const token = generateToken(user);
    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day expiration
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV !== "development",
    });

    res.status(200).json({
      message: "2FA verified successfully",
      userId: user._id,
      sessionId:req.sessionID,
      success: true,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Signin controller with rate limiter applied
export const Signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    // Check if account is locked
    if (user.isAccountLocked()) {
      const remainingLockTime = Math.ceil(
        ((user.lockUntil?.getTime() || 0) - Date.now()) / (1000 * 60)
      );
      return res.status(403).json({
        error: `Account locked due to multiple failed login attempt. Please try again in ${remainingLockTime} minutes.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lock
        user.isLocked = true;
      }

      await user.save();
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check for password expiry
    const passwordAge =
      (new Date() - new Date(user.passwordUpdatedAt)) / (1000 * 60 * 60 * 24); // Age in days
    if (passwordAge > PASSWORD_EXPIRY_DAYS) {
      return res.status(403).json({
        error:
          "Your password has expired. Please reset your password to continue.",
      });
    }
    if (user.twoFactorAuth.enabled) {
      const otp = generateOTP();
      user.twoFactorAuth.otp = {
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
      await user.save();
      await sendVerificationEmail(user.email, otp);

      const tempToken = jwt.sign(
        { userId: user._id, temp: true },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      return res.status(200).json({
        requires2FA: true,
        token: tempToken,
        role: user.role,
        message: "Please enter the verification code sent to your email",
        success: true,
      });
    }

    // Generate token and set secure cookie
    const token = generateToken(user);
    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day expiration
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV !== "development",
    });

    res.status(200).json({
      message: "User signed in successfully",
      sessionId:req.sessionID,
      userId: user._id,
      success: true,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in signin controller", error.message);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};

// Logout implementation to clear session cookies securely
export const Logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};

// Password reuse prevention and expiry (middleware)
export const preventPasswordReuse = async (req, res, next) => {
  try {
    const { userId, newPassword } = req.body;
    const user = await User.findById(userId);

    // Check if the new password matches the current password
    const isMatch = await bcrypt.compare(newPassword, user.password);
    if (isMatch) {
      return res.status(400).json({
        error:
          "You cannot reuse the same password. Please choose a different one.",
      });
    }

    // Check if the new password matches any recent passwords
    for (const oldPassword of user.passwordHistory || []) {
      if (await bcrypt.compare(newPassword, oldPassword)) {
        return res.status(400).json({
          error:
            "You cannot reuse a recently used password. Please choose a different one.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Error in password reuse check:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Password Controller
export const updatePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check password complexity and strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }

    const strength = passwordStrength(newPassword).value;
    if (strength !== "Strong") {
      return res.status(400).json({
        error: `Password is not strong enough (${strength}). Please choose a stronger password.`,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and history
    user.password = hashedPassword;
    user.passwordHistory = [
      hashedPassword,
      ...(user.passwordHistory || []),
    ].slice(0, PASSWORD_HISTORY_LIMIT);
    user.passwordUpdatedAt = new Date();

    await user.save();

    res
      .status(200)
      .json({ message: "Password updated successfully", success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      data: users,
      message: "Users fetched succesfully!",
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
