import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["student", "teacher"],
    required: true
  },

  enrollment: {
    type: String,
    trim: true,
    required: function () {
      return this.role === "student";
    }
  },

  otp: {
    type: String,
    default: null
  },

  otpExpires: {
    type: Date,
    default: null
  },

  otpAttempts: {
    type: Number,
    default: 0
  },

  resetToken: {
    type: String,
    default: null
  },

  resetTokenExpires: {
    type: Date,
    default: null
  }

},
{ timestamps: true }
);

export default mongoose.model("User", userSchema);