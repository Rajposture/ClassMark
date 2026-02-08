import express from "express";
import protect from "../middleware/authMiddleware.js";
import { markAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/", protect, markAttendance);

export default router;
