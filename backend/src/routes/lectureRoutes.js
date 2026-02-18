import express from "express";
import {
  createLecture,
  getMyLectures,
  generateQRToken,
  generateExcelSheet,
  deleteLecture
} from "../controllers/lectureController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create lecture
router.post("/", protect, createLecture);

// ✅ Get teacher lectures
router.get("/mine", protect, getMyLectures);

// ✅ Generate QR token
router.get("/:id/qr", protect, generateQRToken);

// ✅ Download Excel
router.get("/:id/excel", protect, generateExcelSheet);

// ✅ Delete lecture
router.delete("/:id", protect, deleteLecture);

export default router;
