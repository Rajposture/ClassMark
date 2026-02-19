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
      required: true,
      trim: true,
      lowercase: true,
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
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "student";
      },
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
