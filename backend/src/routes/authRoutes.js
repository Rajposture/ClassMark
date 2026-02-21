import express from "express";
import {
  requestSignupOtp,
  verifySignupOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  logout
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup/request-otp", requestSignupOtp);
router.post("/signup/verify-otp", verifySignupOtp);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/me", getMe);
router.post("/logout", logout);

export default router;