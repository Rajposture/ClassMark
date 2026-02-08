import jwt from "jsonwebtoken";
import Lecture from "../models/Lecture.js";

export const markAttendance = async (req, res) => {
  try {
    const { lectureId, token } = req.body;

    if (!lectureId || !token) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, lecture.qrSecret);
    } catch (err) {
      return res.status(403).json({ message: "QR expired" });
    }

    if (decoded.lectureId.toString() !== lectureId.toString()) {
      return res.status(403).json({ message: "Invalid QR" });
    }

    const now = new Date();

    const lectureStart = new Date(`${lecture.date}T${lecture.startTime}`);
    const lectureEnd = new Date(`${lecture.date}T${lecture.endTime}`);

    if (isNaN(lectureStart.getTime()) || isNaN(lectureEnd.getTime())) {
      return res.status(400).json({ message: "Invalid lecture time" });
    }

    const bufferBefore = new Date(lectureStart.getTime() - 5 * 60000);
    const bufferAfter = new Date(lectureEnd.getTime() + 5 * 60000);

    if (now < bufferBefore || now > bufferAfter) {
      return res.status(403).json({ message: "Attendance window closed" });
    }

    if (!lecture.attendance) {
      lecture.attendance = [];
    }

    const existingEntry = lecture.attendance.find(
      (entry) =>
        entry.studentId.toString() === req.user._id.toString()
    );

    if (existingEntry) {
      if (existingEntry.deviceInfo !== (req.headers["user-agent"] || "")) {
        return res.status(403).json({
          message: "Multiple device access blocked"
        });
      }

      return res.status(400).json({
        message: "Attendance already marked"
      });
    }

    lecture.attendance.push({
      studentId: req.user._id,
      name: req.user.name,
      enrollmentNumber: req.user.enrollmentNumber,
      ipAddress: req.ip || "",
      deviceInfo: req.headers["user-agent"] || "",
      markedAt: new Date()
    });

    await lecture.save();

    res.status(201).json({ message: "Attendance marked successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
