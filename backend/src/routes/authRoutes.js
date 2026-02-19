import express from "express";
import {
  signup,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  logout
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/me", getMe);
router.post("/logout", logout);

export default router;
