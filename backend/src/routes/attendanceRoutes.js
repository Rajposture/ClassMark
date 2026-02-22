import express from "express"
import { markAttendance } from "../controllers/attendanceController.js"

import { requireAuth } from "@clerk/express";
import roleProtect from "../middleware/roleProtect.js"

const router = express.Router()

router.use(requireAuth())

router.post(
  "/mark",
  roleProtect("student"),
  markAttendance
)

export default router