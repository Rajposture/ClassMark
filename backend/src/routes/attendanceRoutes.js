import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleProtect from "../middleware/roleProtect.js";

import {
  markAttendance,
  markAttendanceByCode
} from "../controllers/attendanceController.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/mark",
  roleProtect("student"),
  markAttendance
);

router.post(
  "/mark-by-code",
  roleProtect("student"),
  markAttendanceByCode
);

export default router;