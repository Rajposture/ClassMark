import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
    },
    enrollmentNumber: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      required: function () {
        return this.role === "student";
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
