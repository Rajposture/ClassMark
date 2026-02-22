import express from "express"
import {
  createLecture,
  getMyLectures,
  generateQRToken,
  generateExcelSheet,
  deleteLecture
} from "../controllers/lectureController.js"

import { requireAuth } from "@clerk/express"
import roleProtect from "../middleware/roleProtect.js"

const router = express.Router()

router.use(requireAuth())

router.post("/", roleProtect("teacher"), createLecture)

router.get("/mine", roleProtect("teacher"), getMyLectures)

router.get("/:id/qr", roleProtect("teacher"), generateQRToken)

router.get("/:id/excel", roleProtect("teacher"), generateExcelSheet)

router.delete("/:id", roleProtect("teacher"), deleteLecture)

export default router