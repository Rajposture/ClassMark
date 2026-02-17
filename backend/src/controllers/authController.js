import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import generateOtp from "./generateOtp.js";
import otpEmailTemplate from "./otpEmailTemplate.js";

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

const createTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

const sendMail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"ClassMark" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber } = req.body;

    if (!name || !password || !role)
      return res.status(400).json({ message: "All fields required" });

    if (!email)
      return res.status(400).json({ message: "Email required" });

    if (role === "student" && !enrollmentNumber)
      return res.status(400).json({ message: "Enrollment required" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 12);

    await sendMail({
      to: email.toLowerCase(),
      subject: "ClassMark OTP Verification",
      html: otpEmailTemplate(name, otp),
    });

    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      enrollmentNumber: role === "student" ? enrollmentNumber : null,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    };

    await User.create(userData);

    return res.status(201).json({ message: "OTP sent successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Invalid request" });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (!user.otpExpires || user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 86400000,
    });

    return res.json({
      id: user._id,
      name: user.name,
      role: user.role,
      enrollmentNumber: user.enrollmentNumber || null,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Invalid request" });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Verify OTP first" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 86400000,
    });

    return res.json({
      id: user._id,
      name: user.name,
      role: user.role,
      enrollmentNumber: user.enrollmentNumber || null,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendMail({
      to: user.email,
      subject: "ClassMark Password Reset OTP",
      html: otpEmailTemplate(user.name, otp),
    });

    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "Invalid request" });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (!user.otpExpires || user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 86400000,
    });

    return res.json({
      id: user._id,
      name: user.name,
      role: user.role,
      enrollmentNumber: user.enrollmentNumber || null,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    return res.json({
      id: user._id,
      name: user.name,
      role: user.role,
      enrollmentNumber: user.enrollmentNumber || null,
    });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out" });
};
