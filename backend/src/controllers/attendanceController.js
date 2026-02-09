import jwt from "jsonwebtoken";
import Lecture from "../models/Lecture.js";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const markAttendance = async (req, res) => {
  try {
    const {
      lectureId,
      token,
      latitude,
      longitude,
      studentId,
      name,
      enrollmentNumber
    } = req.body;

    if (!lectureId || !token)
      return res.status(400).json({ message: "Missing lectureId or token" });

    if (!studentId || !name)
      return res.status(400).json({ message: "Student information missing" });

    if (latitude == null || longitude == null)
      return res.status(400).json({ message: "Location not detected" });

    const lecture = await Lecture.findById(lectureId);
    if (!lecture)
      return res.status(404).json({ message: "Lecture not found" });

    let decoded;
    try {
      decoded = jwt.verify(token, lecture.qrSecret);
    } catch {
      return res.status(403).json({ message: "QR expired or invalid" });
    }

    if (decoded.lectureId.toString() !== lectureId.toString())
      return res.status(403).json({ message: "Invalid QR" });

    const studentLat = Number(latitude);
    const studentLon = Number(longitude);

    const distance = calculateDistance(
      Number(lecture.latitude),
      Number(lecture.longitude),
      studentLat,
      studentLon
    );

    if (distance > Number(lecture.radius))
      return res.status(403).json({ message: "You are outside classroom radius" });

    const alreadyMarked = lecture.attendance.some(
      (entry) => entry.studentId.toString() === studentId.toString()
    );

    if (alreadyMarked)
      return res.status(400).json({ message: "Attendance already marked" });

    lecture.attendance.push({
      studentId,
      name,
      enrollmentNumber,
      latitude: studentLat,
      longitude: studentLon,
      ipAddress: req.ip || "",
      deviceInfo: req.headers["user-agent"] || "",
      time: new Date()
    });

    await lecture.save();

    const folderPath = path.join("uploads", "attendance");
    if (!fs.existsSync(folderPath))
      fs.mkdirSync(folderPath, { recursive: true });

    const safeSubject = (lecture.subject || "Lecture")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    const filePath = path.join(folderPath, `${safeSubject}.xlsx`);

    const workbook = new ExcelJS.Workbook();
    let worksheet;

    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
      worksheet = workbook.getWorksheet("Attendance");
    } else {
      worksheet = workbook.addWorksheet("Attendance");

      worksheet.columns = [
        { header: "Name", key: "name" },
        { header: "Enrollment Number", key: "enrollmentNumber" },
        { header: "Date", key: "date" },
        { header: "Submit Time", key: "submitTime" },
        { header: "Device", key: "device" },
        { header: "Latitude", key: "latitude" },
        { header: "Longitude", key: "longitude" },
        { header: "IP Address", key: "ip" }
      ];

      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      worksheet.getRow(1).font = { bold: true };

      worksheet.columns.forEach(column => {
        column.width = 20;
      });
    }

    worksheet.addRow({
      name,
      enrollmentNumber,
      date: lecture.date,
      submitTime: new Date().toLocaleString(),
      device: req.headers["user-agent"] || "",
      latitude: studentLat,
      longitude: studentLon,
      ip: req.ip || ""
    });

    await workbook.xlsx.writeFile(filePath);

    return res.status(201).json({
      message: "Attendance marked successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
