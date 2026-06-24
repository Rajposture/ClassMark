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
    startDateTime: {
      type: Date,
      required: true
    },
    endDateTime: {
      type: Date,
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
   lectureCode: {
  type: String,
  required: true,
  unique: true,
  trim: true
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
  default: 800
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