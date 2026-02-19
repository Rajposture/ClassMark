import crypto from "crypto";
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

    if (!subject || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

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

    return res.status(201).json({
      success: true,
      lecture
    });

  } catch (err) {
    console.log("Create lecture error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getMyLectures = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const lectures = await Lecture.find({
      teacherId: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      lectures
    });

  } catch (err) {
    console.log("Fetch lectures error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const generateQRToken = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });

    if (lecture.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    lecture.qrExpiresAt = expiresAt;
    await lecture.save();

    const token = jwt.sign(
      { lectureId: lecture._id },
      lecture.qrSecret,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      success: true,
      token,
      subject: lecture.subject,
      expiresAt
    });

  } catch (err) {
    console.log("QR token error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const generateExcelSheet = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });

    if (lecture.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });

    const attendanceData = lecture.attendance.map((entry) => ({
      Name: entry.name || "",
      EnrollmentNumber: entry.enrollmentNumber || "",
      SubmitTime: entry.time
        ? new Date(entry.time).toLocaleString()
        : "",
      Device: entry.deviceInfo || "",
      Latitude: entry.latitude || "",
      Longitude: entry.longitude || "",
      IP: entry.ipAddress || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(
      attendanceData.length ? attendanceData : [{}]
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx"
    });

    const safeSubject = (lecture.subject || "attendance")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${safeSubject}.xlsx`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);

  } catch (err) {
    console.log("Excel error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate Excel"
    });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });

    if (lecture.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });

    await Lecture.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Lecture deleted"
    });

  } catch (err) {
    console.log("Delete lecture error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
