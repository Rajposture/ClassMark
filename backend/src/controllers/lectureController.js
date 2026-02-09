import crypto from "crypto";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import jwt from "jsonwebtoken";
import Lecture from "../models/Lecture.js";

export const createLecture = async (req, res) => {
  try {
    const {
      subject,
      date,
      startTime,
      endTime,
      latitude,
      longitude,
      radius
    } = req.body;

    if (!subject || !date || !startTime || !endTime)
      return res.status(400).json({ message: "Missing required fields" });

    const qrSecret = crypto.randomBytes(32).toString("hex");

    const lecture = new Lecture({
      subject,
      date,
      startTime,
      endTime,
      teacherId: req.user._id,
      qrSecret,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius: radius ? Number(radius) : 300,
      isActive: true,
      attendance: []
    });

    await lecture.save();

    return res.status(201).json({ lecture });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find({
      teacherId: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json(lectures);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const generateQRToken = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ message: "Lecture not found" });

    if (lecture.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized access" });

    const token = jwt.sign(
      { lectureId: lecture._id },
      lecture.qrSecret,
      { expiresIn: "3h" }
    );

    return res.status(200).json({
      token,
      subject: lecture.subject
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const generateExcelSheet = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ message: "Lecture not found" });

    if (lecture.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized access" });

    const workbook = XLSX.utils.book_new();

    const attendanceData = lecture.attendance.length
      ? lecture.attendance.map((entry) => ({
          Name: entry.name || "",
          EnrollmentNumber: entry.enrollmentNumber || "",
          SubmitTime: entry.time
            ? new Date(entry.time).toLocaleString()
            : "",
          Device: entry.deviceInfo || "",
          Latitude: entry.latitude || "",
          Longitude: entry.longitude || "",
          IP: entry.ipAddress || ""
        }))
      : [
          {
            Name: "",
            EnrollmentNumber: "",
            SubmitTime: "",
            Device: "",
            Latitude: "",
            Longitude: "",
            IP: ""
          }
        ];

    const worksheet = XLSX.utils.json_to_sheet(attendanceData);

    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    const headers = Object.keys(attendanceData[0]);

    headers.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true }
        };
      }
    });

    const colWidths = headers.map((header) => ({
      wch: Math.max(
        header.length + 2,
        ...attendanceData.map(row =>
          String(row[header] || "").length + 2
        )
      )
    }));

    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const safeSubject = (lecture.subject || "Lecture")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    const folderPath = path.join("uploads");
    if (!fs.existsSync(folderPath))
      fs.mkdirSync(folderPath, { recursive: true });

    const filePath = path.join(folderPath, `${safeSubject}.xlsx`);

    XLSX.writeFile(workbook, filePath);

    return res.download(filePath, `${safeSubject}.xlsx`);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to generate Excel" });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ message: "Lecture not found" });

    if (lecture.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized access" });

    await Lecture.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Lecture deleted" });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
