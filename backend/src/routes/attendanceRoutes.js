import express from "express";
import { markAttendance } from "../controllers/attendanceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleProtect from "../middleware/roleProtect.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/mark",
  roleProtect("student"),
  markAttendance
);

export default router;