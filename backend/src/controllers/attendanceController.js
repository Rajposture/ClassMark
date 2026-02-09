import jwt from "jsonwebtoken";
import Lecture from "../models/Lecture.js";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";

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

    const now = new Date();
    const lectureStart = new Date(`${lecture.date}T${lecture.startTime}`);
    const lectureEnd = new Date(`${lecture.date}T${lecture.endTime}`);
    const bufferBefore = new Date(lectureStart.getTime() - 5 * 60000);
    const bufferAfter = new Date(lectureEnd.getTime() + 5 * 60000);

    if (now < bufferBefore || now > bufferAfter)
      return res.status(403).json({ message: "Attendance window closed" });

    const studentLat = Number(latitude);
    const studentLon = Number(longitude);

    if (isNaN(studentLat) || isNaN(studentLon))
      return res.status(400).json({ message: "Invalid location data" });

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

    const filePath = path.join(folderPath, `Lecture_${lecture._id}.xlsx`);

    let workbook;
    let sheetData = [];

    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      workbook = XLSX.utils.book_new();
    }

    sheetData.push({
      Name: name,
      EnrollmentNumber: enrollmentNumber,
      Date: lecture.date,
      SubmitTime: new Date().toLocaleString(),
      Device: req.headers["user-agent"],
      Latitude: studentLat,
      Longitude: studentLon,
      IP: req.ip || ""
    });

    const worksheet = XLSX.utils.json_to_sheet(sheetData);

    if (workbook.SheetNames.length === 0) {
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    } else {
      workbook.Sheets[workbook.SheetNames[0]] = worksheet;
    }

    XLSX.writeFile(workbook, filePath);

    return res.status(201).json({
      message: "Attendance marked successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
