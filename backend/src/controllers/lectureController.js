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

    res.status(201).json({ message: "Lecture created", lecture });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find({
      teacherId: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json(lectures);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateQRToken = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ message: "Lecture not found" });

    if (!lecture.qrSecret)
      return res.status(400).json({ message: "QR secret missing" });

    if (lecture.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized access" });

    const token = jwt.sign(
      { lectureId: lecture._id },
      lecture.qrSecret,
      { expiresIn: "3h" }
    );

    res.status(200).json({
      token,
      subject: lecture.subject
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
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

  const data = lecture.attendance.map((entry) => ({
  Name: entry.name,
  EnrollmentNumber: entry.enrollmentNumber,
  SubmitTime: new Date(entry.time).toLocaleString(),
  Device: entry.deviceInfo,
  Latitude: entry.latitude,
  Longitude: entry.longitude,
  IP: entry.ipAddress
}));

    const worksheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const folderPath = path.join("uploads");
    if (!fs.existsSync(folderPath))
      fs.mkdirSync(folderPath);

    const filePath = path.join(
      folderPath,
      `Lecture_${lecture._id}.xlsx`
    );

    XLSX.writeFile(workbook, filePath);

    res.download(filePath);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
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

    res.status(200).json({ message: "Lecture deleted" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
