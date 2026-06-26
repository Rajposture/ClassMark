import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // ── 1. Extract token ──────────────────────────────────────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      return res.status(401).json({ message: "Unauthorized: Token is empty" });
    }

    // ── 2. Verify JWT ─────────────────────────────────────────────────────────
    // jwt.verify throws JsonWebTokenError, TokenExpiredError, or NotBeforeError
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please log in again." });
      }
      // JsonWebTokenError, NotBeforeError, or malformed token
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // ── 3. Validate decoded payload ───────────────────────────────────────────
    if (!decoded?.id) {
      return res.status(401).json({ message: "Unauthorized: Malformed token payload" });
    }

    // ── 4. Fetch user from DB ─────────────────────────────────────────────────
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Account not found" });
    }

    // ── 5. Guard: block unverified accounts ───────────────────────────────────
    // Only enforced if your User model has an isVerified field.
    // Remove this block if you don't use OTP-based email verification.
    if (user.isVerified === false) {
      return res.status(403).json({ message: "Email not verified. Please verify your account." });
    }

    // ── 6. Attach user context to request ─────────────────────────────────────
    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      ...(user.enrollment && { enrollment: user.enrollment }),
    };

    next();
  } catch (err) {
    // Catches unexpected errors (e.g. DB down, network timeout)
    console.error("[authMiddleware] Unexpected error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default authMiddleware;