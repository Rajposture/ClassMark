import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  signup,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
