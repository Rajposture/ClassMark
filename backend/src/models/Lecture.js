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
      default: "",
    },
    deviceInfo: {
      type: String,
      default: "",
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    markedAt: {
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
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    radius: {
      type: Number,
      required: true,
      default: 50,
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

lectureSchema.index(
  { _id: 1, "attendance.studentId": 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("Lecture", lectureSchema);
