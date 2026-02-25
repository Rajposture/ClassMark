import crypto from "crypto";
import jwt from "jsonwebtoken";
import ExcelJS from "exceljs";
import Lecture from "../models/Lecture.js";

export const createLecture = async (req, res) => {
  try {
    const { subject, date, startTime, endTime, latitude, longitude, radius } = req.body;

    if (!subject || !date || !startTime || !endTime)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    if (!req.user || req.user.role !== "teacher")
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const qrSecret = crypto.randomBytes(32).toString("hex");

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    const lecture = new Lecture({
      subject,
      startDateTime,
      endDateTime,
      teacherId: req.user.id,
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

    io.emit("newLecture", {
      subject: lecture.subject,
      teacher: req.user.name
    });

    return res.status(201).json({ success: true, lecture });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyLectures = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "teacher")
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const lectures = await Lecture.find({
      teacherId: req.user.id,
      endDateTime: { $gte: last24Hours }
    }).sort({ startDateTime: -1 });

    return res.status(200).json({ success: true, lectures });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getHistoryLectures = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "teacher")
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const lectures = await Lecture.find({
      teacherId: req.user.id,
      endDateTime: { $lt: last24Hours }
    }).sort({ startDateTime: -1 });

    return res.status(200).json({ success: true, lectures });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const generateQRToken = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ success: false, message: "Lecture not found" });

    if (!req.user || lecture.teacherId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const expiryMinutes = 20;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    lecture.qrExpiresAt = expiresAt;
    await lecture.save();

    const token = jwt.sign(
      { lectureId: lecture._id },
      lecture.qrSecret,
      { expiresIn: "20m" }
    );

    return res.status(200).json({
      success: true,
      token,
      subject: lecture.subject,
      expiresAt
    });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const generateExcelSheet = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ success: false, message: "Lecture not found" });

    if (!req.user || lecture.teacherId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    const totalPresent = lecture.attendance.length;

    // ===== HEADER SECTION =====
    worksheet.mergeCells("A1:F1");
    worksheet.getCell("A1").value = `Attendance Sheet - ${lecture.subject}`;
    worksheet.getCell("A1").font = { bold: true, size: 16 };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    worksheet.mergeCells("A2:F2");
    worksheet.getCell("A2").value = `Date: ${lecture.startDateTime.toLocaleDateString()}`;
    worksheet.getCell("A2").alignment = { horizontal: "center" };

    worksheet.mergeCells("A3:F3");
    worksheet.getCell("A3").value = `Time: ${lecture.startDateTime.toLocaleTimeString()} - ${lecture.endDateTime.toLocaleTimeString()}`;
    worksheet.getCell("A3").alignment = { horizontal: "center" };

    worksheet.mergeCells("A4:F4");
    worksheet.getCell("A4").value = `Total Present: ${totalPresent}`;
    worksheet.getCell("A4").font = { bold: true };
    worksheet.getCell("A4").alignment = { horizontal: "center" };

    worksheet.mergeCells("A5:F5");
    worksheet.getCell("A5").value = `Generated On: ${new Date().toLocaleString()}`;
    worksheet.getCell("A5").alignment = { horizontal: "center" };

    worksheet.addRow([]);

    // ===== TABLE HEADERS =====
    worksheet.columns = [
      { header: "Sr No", key: "sr", width: 10 },
      { header: "Name", key: "name", width: 25 },
      { header: "Enrollment", key: "enrollment", width: 20 },
      { header: "Submit Time", key: "time", width: 25 },
      { header: "Latitude", key: "lat", width: 15 },
      { header: "Longitude", key: "lng", width: 15 }
    ];

    const headerRow = worksheet.getRow(7);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    // ===== DATA ROWS =====
    lecture.attendance.forEach((entry, index) => {
      worksheet.addRow({
        sr: index + 1,
        name: entry.name,
        enrollment: entry.enrollment,
        time: entry.time ? new Date(entry.time).toLocaleString() : "",
        lat: entry.latitude || "",
        lng: entry.longitude || ""
      });
    });

    // ===== BORDER STYLING =====
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });
    });

    const safeSubject = lecture.subject.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${safeSubject}_daily.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch {
    return res.status(500).json({ success: false, message: "Failed to generate Excel" });
  }
};

export const generateMonthlyExcel = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ success: false, message: "Lecture not found" });

    if (!req.user || lecture.teacherId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const subject = lecture.subject;
    const teacherId = lecture.teacherId;

    const month = lecture.startDateTime.getMonth();
    const year = lecture.startDateTime.getFullYear();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

    const lectures = await Lecture.find({
      teacherId,
      subject,
      startDateTime: { $gte: monthStart, $lte: monthEnd }
    });

    const studentMap = {};

    lectures.forEach((lec) => {
      const day = lec.startDateTime.getDate();

      lec.attendance.forEach((entry) => {
        if (!studentMap[entry.enrollment]) {
          studentMap[entry.enrollment] = {
            name: entry.name,
            enrollment: entry.enrollment,
            days: {}
          };
        }
        studentMap[entry.enrollment].days[day] = "P";
      });
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monthly Attendance");

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const headers = ["Sr No", "Name", "Enrollment"];
    for (let d = 1; d <= daysInMonth; d++) {
      headers.push(d.toString());
    }
    headers.push("Total");

    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };

    let sr = 1;

    Object.values(studentMap).forEach((student) => {
      const row = [sr++, student.name, student.enrollment];

      let total = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        if (student.days[d] === "P") {
          row.push("P");
          total++;
        } else {
          row.push("A");
        }
      }

      row.push(total);
      worksheet.addRow(row);
    });

    const safeSubject = subject.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${safeSubject}_monthly.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to generate monthly Excel" });
  }
};
export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture)
      return res.status(404).json({ success: false, message: "Lecture not found" });

    if (!req.user || lecture.teacherId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    await Lecture.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Lecture deleted" });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};