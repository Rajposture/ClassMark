import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import generateOtp from "./generateOtp.js";
import otpEmailTemplate from "./otpEmailTemplate.js";
import resetPasswordTemplate from "./resetPasswordTemplate.js";

import nodemailer from "nodemailer";
import dotenv from "dotenv";




dotenv.config();

const pendingUsers = new Map();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"ClassMark" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ success: false, message: "All fields required" });

    if (role === "student" && !enrollmentNumber)
      return res.status(400).json({ success: false, message: "Enrollment required" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser)
      return res.status(400).json({ success: false, message: "User already exists" });

    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 12);

    pendingUsers.set(email.toLowerCase(), {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      enrollmentNumber: role === "student" ? enrollmentNumber : null,
      otp,
      createdAt: Date.now(),
    });

    const mailSent = await sendMail({
      to: email.toLowerCase(),
      subject: "ClassMark OTP Verification",
      html: otpEmailTemplate(name, otp),
    });

    if (!mailSent)
      return res.status(500).json({ success: false, message: "Failed to send OTP email" });

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Invalid request" });

    const pendingUser = pendingUsers.get(email.toLowerCase());

    if (!pendingUser || pendingUser.otp !== otp.trim())
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    const newUser = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
      enrollmentNumber: pendingUser.enrollmentNumber,
      isVerified: true,
    });

    pendingUsers.delete(email.toLowerCase());

    const token = generateToken(newUser);

    return res.json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        role: newUser.role,
        enrollmentNumber: newUser.enrollmentNumber || null,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        enrollmentNumber: user.enrollmentNumber || null,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

const resetLink =
  process.env.NODE_ENV === "production"
    ? `https://class-mark.vercel.app/reset-password/${resetToken}`
    : `http://localhost:5173/reset-password/${resetToken}`;

    const mailSent = await sendMail({
      to: user.email,
      subject: "Reset Your ClassMark Password",
      html: resetPasswordTemplate(user.name, resetLink),
    });

    if (!mailSent)
      return res.status(500).json({ success: false, message: "Failed to send reset email" });

    return res.json({ success: true, message: "Reset email sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ success: false, message: "Password required" });

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ success: false });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(404).json({ success: false });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        enrollmentNumber: user.enrollmentNumber || null,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false });
  }
};

export const logout = async (req, res) => {
  return res.json({ success: true });
};
