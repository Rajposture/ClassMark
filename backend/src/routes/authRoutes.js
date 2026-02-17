import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  signup,
  verifyOtp,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);

router.get("/me", protect, getMe);

router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
