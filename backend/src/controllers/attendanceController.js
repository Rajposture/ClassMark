import Lecture from "../models/Lecture.js"
import jwt from "jsonwebtoken"

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180
  const R = 6371000

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const markAttendance = async (req, res) => {
  try {
    const { token, latitude, longitude } = req.body

    if (!token)
      return res.status(400).json({ message: "QR token required" })

    if (latitude == null || longitude == null)
      return res.status(400).json({ message: "Location not detected" })

    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" })

    let decoded

    try {
      decoded = jwt.decode(token)
    } catch {
      return res.status(400).json({ message: "Invalid QR token" })
    }

    if (!decoded || !decoded.lectureId)
      return res.status(400).json({ message: "Invalid QR token" })

    const lecture = await Lecture.findById(decoded.lectureId)

    if (!lecture)
      return res.status(404).json({ message: "Lecture not found" })

    try {
      jwt.verify(token, lecture.qrSecret)
    } catch {
      return res.status(403).json({ message: "QR expired or invalid" })
    }

    if (!lecture.qrExpiresAt || new Date() > lecture.qrExpiresAt)
      return res.status(403).json({ message: "QR expired" })

    const studentLat = Number(latitude)
    const studentLon = Number(longitude)

    const distance = calculateDistance(
      Number(lecture.latitude),
      Number(lecture.longitude),
      studentLat,
      studentLon
    )

    if (distance > Number(lecture.radius))
      return res.status(403).json({
        message: "You are outside classroom radius"
      })

    const alreadyMarked = lecture.attendance.some(
      (entry) => entry.studentId.toString() === req.user._id.toString()
    )

    if (alreadyMarked)
      return res.status(400).json({
        message: "Attendance already marked"
      })

    lecture.attendance.push({
      studentId: req.user._id,
      name: req.user.name,
      enrollmentNumber: req.user.enrollmentNumber,
      latitude: studentLat,
      longitude: studentLon,
      ipAddress: req.ip || "",
      deviceInfo: req.headers["user-agent"] || "",
      markedAt: new Date()
    })

    await lecture.save()

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully"
    })

  } catch (error) {
    console.log("Mark attendance error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
