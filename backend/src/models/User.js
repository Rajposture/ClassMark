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
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      default: undefined
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: true
    },
    enrollmentNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: undefined,
      required: function () {
        return this.role === "student";
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
