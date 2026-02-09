import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: String,
    enrollmentNumber: String,

    // 🔵 Student GPS
    latitude: Number,
    longitude: Number,

    ipAddress: String,
    deviceInfo: String,

    time: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const lectureSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    qrSecret: { type: String, required: true },

    // 🔵 Classroom GPS
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radius: { type: Number, default: 50 }, // meters

    attendance: {
      type: [attendanceSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lecture", lectureSchema);
