import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role === "teacher" && !email) {
      return res.status(400).json({ message: "Email is required for teacher" });
    }

    if (role === "student" && !enrollmentNumber) {
      return res.status(400).json({ message: "Enrollment number is required for students" });
    }

    let existingUser;

    if (role === "student") {
      existingUser = await User.findOne({ enrollmentNumber });
    } else {
      existingUser = await User.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: role === "teacher" ? email : undefined,
      password: hashedPassword,
      role,
      enrollmentNumber: role === "student" ? enrollmentNumber : undefined,
    });

    res.status(201).json({ message: "Signup successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role, enrollmentNumber } = req.body;

    let user;

    if (role === "student") {
      user = await User.findOne({ enrollmentNumber });
    } else if (role === "teacher") {
      user = await User.findOne({ email });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: "Role mismatch" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.json({ message: "Logged out successfully" });
};
