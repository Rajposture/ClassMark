import Lecture from "../models/Lecture.js";

/* ===============================
   DISTANCE CALCULATION (Haversine)
=============================== */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters

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

/* ===============================
   MARK ATTENDANCE
=============================== */
export const markAttendance = async (req, res) => {
  try {
    const { lectureId, latitude, longitude } = req.body;

    if (!lectureId)
      return res.status(400).json({ message: "Lecture ID required" });

    if (latitude == null || longitude == null)
      return res.status(400).json({ message: "Location not detected" });

    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const lecture = await Lecture.findById(lectureId);
    if (!lecture)
      return res.status(404).json({ message: "Lecture not found" });

    const studentLat = Number(latitude);
    const studentLon = Number(longitude);

    const distance = calculateDistance(
      Number(lecture.latitude),
      Number(lecture.longitude),
      studentLat,
      studentLon
    );

    if (distance > Number(lecture.radius))
      return res.status(403).json({
        message: "You are outside classroom radius"
      });

    const alreadyMarked = lecture.attendance.some(
      (entry) => entry.studentId.toString() === req.user._id.toString()
    );

    if (alreadyMarked)
      return res.status(400).json({
        message: "Attendance already marked"
      });

    lecture.attendance.push({
      studentId: req.user._id,
      name: req.user.name,
      enrollmentNumber: req.user.enrollmentNumber,
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
    console.log("Mark attendance error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

