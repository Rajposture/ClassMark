import crypto from "crypto";
import jwt from "jsonwebtoken";
import ExcelJS from "exceljs";
import Lecture from "../models/Lecture.js";

export const createLecture = async (req, res) => {
  try {
    const { subject, date, startTime, endTime, latitude, longitude, radius } = req.body;

    if (!subject || !date || !startTime || !endTime)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

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
      qrExpiresAt: null,
      attendance: []
    });

    await lecture.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("newLecture", {
        id: lecture._id,
        subject: lecture.subject,
        date: lecture.date,
        teacher: req.user.name
      });
    }

    return res.status(201).json({ success: true, lecture });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyLectures = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const lectures = await Lecture.find({ teacherId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, lectures });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const generateQRToken = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ success: false, message: "Lecture not found" });

    if (lecture.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    lecture.qrExpiresAt = expiresAt;
    await lecture.save();

    const token = jwt.sign(
      { lectureId: lecture._id },
      lecture.qrSecret,
      { expiresIn: "10m" }
    );

    return res.status(200).json({ success: true, token, subject: lecture.subject, expiresAt });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const generateExcelSheet = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ success: false, message: "Lecture not found" });

    if (lecture.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Enrollment Number", key: "enrollmentNumber", width: 25 },
      { header: "Submit Time", key: "submitTime", width: 25 },
      { header: "Device", key: "device", width: 30 },
      { header: "Latitude", key: "latitude", width: 15 },
      { header: "Longitude", key: "longitude", width: 15 },
      { header: "IP Address", key: "ip", width: 20 }
    ];

    worksheet.getRow(1).font = { bold: true };

    lecture.attendance.forEach((entry) => {
      worksheet.addRow({
        name: entry.name || "",
        enrollmentNumber: entry.enrollmentNumber || "",
        submitTime: entry.time ? new Date(entry.time).toLocaleString() : "",
        device: entry.deviceInfo || "",
        latitude: entry.latitude || "",
        longitude: entry.longitude || "",
        ip: entry.ipAddress || ""
      });
    });

    const safeSubject = (lecture.subject || "attendance")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${safeSubject}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Failed to generate Excel" });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ success: false, message: "Lecture not found" });

    if (lecture.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    await Lecture.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Lecture deleted" });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
