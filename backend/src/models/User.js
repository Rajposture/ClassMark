import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },

    phoneNumber: {
      type: String,
      trim: true
    },

    role: {
      type: String,
      enum: ["teacher", "student"],
      required: true
    },

    clerkId: {
  type: String,
  required: true,
  unique: true
},
    enrollmentNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "student";
      },
      default: null
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ enrollmentNumber: 1 }, { unique: true, sparse: true });
userSchema.index({ clerkId: 1 }, { unique: true });

export default mongoose.model("User", userSchema);