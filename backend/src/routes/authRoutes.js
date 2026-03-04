import express from "express";
import { authLimiter } from "../middleware/rateLimiter.js"
import {
  register,
  verifySignupOtp,
  login,
  verifyLoginOtp,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();



router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)

router.post("/verify-signup-otp", authLimiter, verifySignupOtp)
router.post("/verify-login-otp", authLimiter, verifyLoginOtp)

router.post("/forgot-password", authLimiter, forgotPassword)
router.post("/reset-password/:token", authLimiter, resetPassword)


router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;