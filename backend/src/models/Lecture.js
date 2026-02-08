import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    enrollmentNumber: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    deviceInfo: {
      type: String,
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const lectureSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrSecret: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attendance: {
      type: [attendanceSchema],
      default: [],
    },
    excelFilePath: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lecture", lectureSchema);
