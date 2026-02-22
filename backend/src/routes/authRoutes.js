import express from "express";
import { syncUser, getMe } from "../controllers/authController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/sync", requireAuth(), syncUser);
router.get("/me", requireAuth(), getMe);

export default router;