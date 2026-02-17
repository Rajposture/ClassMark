import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import generateOtp from "./generateOtp.js";
import otpEmailTemplate from "./otpEmailTemplate.js";

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
auth: {
  user: "classmarkofficial1@gmail.com",
  pass: "cxfnjbevnqniqkyw",
},
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("SMTP SERVER READY");
  }
});



const sendOtp = async (email, name, otp) => {
  return await transporter.sendMail({
    from: `"ClassMark" <${process.env.EMAIL}>`,
    to: email,
    subject: "ClassMark OTP Verification",
    html: otpEmailTemplate(name, otp),
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

    try {
      await sendOtp(email.toLowerCase(), name, otp);
    } catch (mailError) {
      console.error("MAIL ERROR:", mailError);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    await User.create({
      name,
      email: email.toLowerCase(),
      enrollmentNumber: role === "student" ? enrollmentNumber : undefined,
      password: hashedPassword,
      role,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    return res.status(201).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({ message: "Server error" });
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

    if (user.otpExpires < Date.now())
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
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role, enrollmentNumber } = req.body;

    if (!password || !role)
      return res.status(400).json({ message: "Invalid request" });

    let user;

    if (role === "teacher") {
      if (!email)
        return res.status(400).json({ message: "Email required" });
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      if (!enrollmentNumber)
        return res.status(400).json({ message: "Enrollment required" });
      user = await User.findOne({ enrollmentNumber });
    }

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
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
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

    await sendOtp(user.email, user.name, otp);

    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("FORGOT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
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

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 12);
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
    console.error("RESET ERROR:", err);
    return res.status(500).json({ message: "Server error" });
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
