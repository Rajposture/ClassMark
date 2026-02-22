import express from "express"
import {
  createAssignment,
  getAllAssignments,
  deleteAssignment
} from "../controllers/assignmentController.js"

import { requireAuth } from "@clerk/express";
import roleProtect from "../middleware/roleProtect.js"
import upload from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.use(requireAuth())

router.post(
  "/",
  roleProtect("teacher"),
  upload.single("image"),
  createAssignment
)

router.get(
  "/",
  getAllAssignments
)

router.delete(
  "/:id",
  roleProtect("teacher"),
  deleteAssignment
)

export default router