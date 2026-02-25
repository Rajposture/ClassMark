import express from "express";
import {
  createLecture,
  getMyLectures,
  getHistoryLectures,
  generateQRToken,
  generateExcelSheet,
  generateMonthlyExcel,
  deleteLecture
} from "../controllers/lectureController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleProtect from "../middleware/roleProtect.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", roleProtect("teacher"), createLecture);

router.get("/mine", roleProtect("teacher"), getMyLectures);

router.get("/history", roleProtect("teacher"), getHistoryLectures);

router.get("/:id/qr", roleProtect("teacher"), generateQRToken);

router.get("/:id/excel", roleProtect("teacher"), generateExcelSheet);
router.get("/:id/monthly-excel", roleProtect("teacher"), generateMonthlyExcel);

router.delete("/:id", roleProtect("teacher"), deleteLecture);

export default router;