import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createLecture,
  getMyLectures,
  generateQRToken,
  deleteLecture,
  generateExcelSheet,
} from "../controllers/lectureController.js";

const router = express.Router();

router.post("/", protect, createLecture);
router.get("/mine", protect, getMyLectures);
router.get("/:id/qr", protect, generateQRToken);
router.get("/:id/excel", protect, generateExcelSheet);
router.delete("/:id", protect, deleteLecture);

export default router;
