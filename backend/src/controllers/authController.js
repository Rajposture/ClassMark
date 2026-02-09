import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber } = req.body;

    if (!name || !password || !role)
      return res.status(400).json({ message: "All fields are required" });

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ message: "JWT secret not configured" });

    if (role === "teacher" && !email)
      return res.status(400).json({ message: "Email is required for teacher" });

    if (role === "student" && !enrollmentNumber)
      return res.status(400).json({ message: "Enrollment number required" });

    let existingUser;

    if (role === "teacher") {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    } else {
      existingUser = await User.findOne({ enrollmentNumber });
    }

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = {
      name,
      password: hashedPassword,
      role
    };

    if (email) userData.email = email.toLowerCase();
    if (role === "student") userData.enrollmentNumber = enrollmentNumber;

    const user = await User.create(userData);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email || null,
        role: user.role,
        enrollmentNumber: user.enrollmentNumber || null
      }
    });

  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: "User already exists" });

    return res.status(500).json({ message: error.message || "Server error" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password, role, enrollmentNumber } = req.body;

    if (!password || !role)
      return res.status(400).json({ message: "Missing credentials" });

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ message: "JWT secret not configured" });

    let user;

    if (role === "teacher") {
      if (!email)
        return res.status(400).json({ message: "Email required" });

      user = await User.findOne({ email: email.toLowerCase() });

    } else if (role === "student") {
      if (!enrollmentNumber)
        return res.status(400).json({ message: "Enrollment number required" });

      user = await User.findOne({ enrollmentNumber });

    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        enrollmentNumber: user.enrollmentNumber || null
      }
    });

  } catch {
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
      enrollmentNumber: user.enrollmentNumber || null
    });

  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return res.json({ message: "Logged out successfully" });
};
