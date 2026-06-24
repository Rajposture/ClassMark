import Lecture from "../models/Lecture.js";
import AttendanceRequest from "../models/AttendanceRequest.js";


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

const processAttendance = async (
  lecture,
  req,
  res,
  latitude,
  longitude,
  enrollment
) => {
  const now = new Date();

  const expiryTime = lecture.qrExpiresAt
    ? new Date(lecture.qrExpiresAt)
    : new Date(
        new Date(lecture.createdAt).getTime() +
        20 * 60 * 1000
      );

  if (now > expiryTime) {
    return res.status(403).json({
      success: false,
      message: "QR session expired"
    });
  }

  if (
    enrollment &&
    req.user.enrollment !== enrollment
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid enrollment number"
    });
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
    return res.status(403).json({
      success: false,
      message: "Outside classroom radius"
    });
  }

  const alreadyMarked = lecture.attendance.some(
    (entry) =>
      entry.studentId.toString() === req.user.id
  );

  if (alreadyMarked) {
    return res.status(400).json({
      success: false,
      message: "Attendance already marked"
    });
  }

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
};

export const markAttendance = async (req, res) => {
  try {
    const {
      lectureId,
      latitude,
      longitude,
      enrollment
    } = req.body;

    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can mark attendance"
      });
    }

    if (!lectureId) {
      return res.status(400).json({
        success: false,
        message: "Lecture ID missing"
      });
    }

    if (latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: "Location not detected"
      });
    }

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    return processAttendance(
      lecture,
      req,
      res,
      latitude,
      longitude,
      enrollment
    );
  } catch (error) {
    console.error("Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const markAttendanceByCode = async (req, res) => {
  try {
    const {
      lectureCode,
      latitude,
      longitude,
      enrollment
    } = req.body;

    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can mark attendance"
      });
    }

    if (!lectureCode) {
      return res.status(400).json({
        success: false,
        message: "Lecture code is required"
      });
    }

    if (latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: "Location not detected"
      });
    }

    const lecture = await Lecture.findOne({
      lectureCode: lectureCode.trim()
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Invalid lecture code"
      });
    }

    return processAttendance(
      lecture,
      req,
      res,
      latitude,
      longitude,
      enrollment
    );
  } catch (error) {
    console.error("Lecture Code Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
export const createAttendanceRequest = async (req, res) => {
  try {
    const {
      lectureId,
      lectureCode,
      latitude,
      longitude
    } = req.body;

    let lecture = null;

    if (lectureId) {
      lecture = await Lecture.findById(lectureId);
    }

    if (!lecture && lectureCode) {
      lecture = await Lecture.findOne({
        lectureCode: lectureCode.trim()
      });
    }

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    const existingRequest =
      await AttendanceRequest.findOne({
        studentId: req.user.id,
        lectureId: lecture._id,
        status: "pending"
      });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Request already sent"
      });
    }

    await AttendanceRequest.create({
      studentId: req.user.id,
      lectureId: lecture._id,
      latitude,
      longitude
    });
const io = req.app.get("io");

io.emit("attendanceRequest", {
  studentName: req.user.name,
  enrollment: req.user.enrollment,
  lectureId: lecture._id,
  subject: lecture.subject
});
    return res.status(201).json({
      success: true,
      message: "Request sent successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getAttendanceRequests = async (req, res) => {
  try {
    const requests = await AttendanceRequest.find({
      status: "pending"
    })
      .populate("studentId", "name enrollment")
      .populate({
        path: "lectureId",
        match: {
          teacherId: req.user.id
        },
        select: "subject teacherId"
      });

    const filteredRequests = requests.filter(
      (request) => request.lectureId
    );

    return res.status(200).json({
      success: true,
      requests: filteredRequests
    });

  } catch (error) {
    console.error("Get Attendance Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const approveAttendanceRequest = async (req, res) => {
  try {
    const request =
      await AttendanceRequest.findById(req.params.id)
      .populate("studentId")
      .populate("lectureId");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    const lecture = request.lectureId;
    const student = request.studentId;

    const alreadyMarked =
      lecture.attendance.some(
        (a) =>
          a.studentId.toString() ===
          student._id.toString()
      );

    if (!alreadyMarked) {
      lecture.attendance.push({
        studentId: student._id,
        name: student.name,
        enrollment: student.enrollment,
        latitude: request.latitude,
        longitude: request.longitude,
        ipAddress: "Teacher Approved",
        deviceInfo: "Teacher Override",
        time: new Date()
      });

      await lecture.save();
    }

    request.status = "approved";
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();

    await request.save();

    return res.json({
      success: true,
      message: "Attendance approved"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const rejectAttendanceRequest = async (req, res) => {
  try {
    const request =
      await AttendanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    request.status = "rejected";

    await request.save();

    return res.json({
      success: true,
      message: "Request rejected"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};