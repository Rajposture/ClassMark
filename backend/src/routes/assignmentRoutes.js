import express from "express";
import { createAssignment, getAllAssignments, deleteAssignment } from "../controllers/assignmentController.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), createAssignment);

router.get("/", protect, getAllAssignments);

router.delete("/:id", protect, deleteAssignment);

export default router;
