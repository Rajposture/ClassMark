import Lecture from "../models/Lecture.js";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // meters

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
    const { lectureId, latitude, longitude, enrollment } = req.body;

    // 🔐 Must be student
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can mark attendance" });
    }

    if (!lectureId)
      return res.status(400).json({ message: "Lecture ID missing" });

    if (latitude == null || longitude == null)
      return res.status(400).json({ message: "Location not detected" });

    // 🔍 Fetch lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture)
      return res.status(404).json({ message: "Lecture not found" });

    // ⏳ 20-Minute Expiry Check
    const now = new Date();
    const lectureCreatedTime = new Date(lecture.createdAt);
    const expiryTime = new Date(lectureCreatedTime.getTime() + 20 * 60 * 1000);

    if (now > expiryTime) {
      return res.status(403).json({ message: "QR session expired" });
    }

    // 🔒 Enrollment verification (extra auth layer after scan)
    if (req.user.enrollment !== enrollment) {
      return res.status(403).json({ message: "Invalid enrollment number" });
    }

    const studentLat = Number(latitude);
    const studentLon = Number(longitude);

    const distance = calculateDistance(
      Number(lecture.latitude),
      Number(lecture.longitude),
      studentLat,
      studentLon
    );

    if (distance > Number(lecture.radius)) {
      return res.status(403).json({ message: "Outside classroom radius" });
    }

    // 🚫 Prevent duplicate attendance
    const alreadyMarked = lecture.attendance.some(
      (entry) => entry.studentId.toString() === req.user.id
    );

    if (alreadyMarked) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    // ✅ Push attendance
    lecture.attendance.push({
      studentId: req.user.id,
      name: req.user.name,
      enrollment: req.user.enrollment,
      latitude: studentLat,
      longitude: studentLon,
      ipAddress: req.ip || "",
      deviceInfo: req.headers["user-agent"] || "",
      time: new Date()
    });

    await lecture.save();

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};