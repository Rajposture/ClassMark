import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateOtp from "./generateOtp.js";
import otpEmailTemplate from "./otpEmailTemplate.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"ClassMark" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.log("Email error:", error);
    throw error;
  }
};


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

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      enrollmentNumber: role === "student" ? enrollmentNumber : null,
      otp,
      isVerified: false,
    });

    await sendMail(
      email.toLowerCase(),
      "ClassMark OTP Verification",
      otpEmailTemplate(name, otp)
    );

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.log("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user || user.otp !== otp.trim())
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });

    user.isVerified = true;
    user.otp = null;
    await user.save();

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

  } catch (err) {
    console.log("Verify OTP error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });

    if (!user.isVerified)
      return res.status(403).json({
        success: false,
        message: "Verify OTP first",
      });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });

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

  } catch (err) {
    console.log("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
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

  } catch (err) {
    console.log("JWT error:", err.message);
    return res.status(401).json({ success: false });
  }
};

export const logout = async (req, res) => {
  return res.json({ success: true });
};
