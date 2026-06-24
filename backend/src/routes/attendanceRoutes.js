import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleProtect from "../middleware/roleProtect.js";

import {
  markAttendance,
  markAttendanceByCode,
  createAttendanceRequest,
  getAttendanceRequests,
  approveAttendanceRequest,
  rejectAttendanceRequest
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

router.post(
  "/request",
  roleProtect("student"),
  createAttendanceRequest
);

router.get(
  "/requests",
  roleProtect("teacher"),
  getAttendanceRequests
);

router.put(
  "/approve/:id",
  roleProtect("teacher"),
  approveAttendanceRequest
);

router.put(
  "/reject/:id",
  roleProtect("teacher"),
  rejectAttendanceRequest
);

export default router;