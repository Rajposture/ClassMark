import crypto from "crypto";
import jwt from "jsonwebtoken";
import XLSX from "xlsx";
import Lecture from "../models/Lecture.js";

export const createLecture = async (req, res) => {
  try {
    const { subject, date, startTime, endTime } = req.body;

    if (!subject || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields required" });
    }

    const qrSecret = crypto.randomBytes(32).toString("hex");

    const lecture = await Lecture.create({
      subject,
      date,
      startTime,
      endTime,
      teacherId: req.user._id,
      qrSecret,
      attendance: [],
    });

    res.status(201).json(lecture);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find({
      teacherId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(lectures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const generateQRToken = async (req, res) => {
  try {
    const lecture = await Lecture.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const token = jwt.sign(
      {
        lectureId: lecture._id.toString(),
      },
      lecture.qrSecret,
      { expiresIn: "600s" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findOneAndDelete({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.json({ message: "Lecture deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const generateExcelSheet = async (req, res) => {
  try {
    const lecture = await Lecture.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const attendanceData = lecture.attendance || [];

    const formattedData = attendanceData.map((entry, index) => ({
      No: index + 1,
      Name: entry.name,
      EnrollmentNumber: entry.enrollmentNumber,
      MarkedAt: entry.markedAt
        ? new Date(entry.markedAt).toLocaleString()
        : "",
      IPAddress: entry.ipAddress || "",
      Device: entry.deviceInfo || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${lecture.subject}-attendance.xlsx`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
