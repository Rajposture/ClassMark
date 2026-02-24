import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    enrollment: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    ipAddress: {
      type: String,
      default: ""
    },
    deviceInfo: {
      type: String,
      default: ""
    },
    time: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const lectureSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    qrSecret: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    radius: {
      type: Number,
      default: 50
    },
    isActive: {
      type: Boolean,
      default: true
    },
    qrExpiresAt: {
      type: Date,
      default: null
    },
    attendance: {
      type: [attendanceSchema],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("Lecture", lectureSchema);