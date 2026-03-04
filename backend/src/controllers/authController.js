import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

import { sendEmail } from "../utils/sendEmail.js";
import { signupEmailTemplate } from "../emails/signupEmailTemplate.js";
import { loginOtpTemplate } from "../emails/loginOtpTemplate.js";
import { resetPasswordTemplate } from "../emails/resetPasswordTemplate.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, enrollment } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Missing required fields" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      enrollment: role === "student" ? enrollment : undefined,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      otpAttempts: 0
    });

    await sendEmail({
      to: email,
      subject: "ClassMark Signup OTP",
      html: signupEmailTemplate(otp)
    });

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (user.otpAttempts >= 5)
      return res.status(429).json({ message: "Too many OTP attempts. Try again later." });

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.otp = null;
    user.otpExpires = null;
    user.otpAttempts = 0;

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollment: user.enrollment
      }
    });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpAttempts = 0;

    await user.save();

    await sendEmail({
      to: email,
      subject: "ClassMark Login OTP",
      html: loginOtpTemplate(otp)
    });

    res.json({ message: "OTP sent" });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (user.otpAttempts >= 5)
      return res.status(429).json({ message: "Too many OTP attempts. Try again later." });

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.otp = null;
    user.otpExpires = null;
    user.otpAttempts = 0;

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollment: user.enrollment
      }
    });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your ClassMark password",
      html: resetPasswordTemplate(resetUrl)
    });

    res.json({ message: "Password reset email sent" });

  } catch (err) {

    console.error("Forgot Password Error:", err);

    res.status(500).json({
      message: "Error sending reset email"
    });

  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};