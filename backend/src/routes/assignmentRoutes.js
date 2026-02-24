import express from "express";
import {
  createAssignment,
  getAllAssignments,
  deleteAssignment
} from "../controllers/assignmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleProtect from "../middleware/roleProtect.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  roleProtect("teacher"),
  upload.single("image"),
  createAssignment
);

router.get(
  "/",
  getAllAssignments
);

router.delete(
  "/:id",
  roleProtect("teacher"),
  deleteAssignment
);

export default router;