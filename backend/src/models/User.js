import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "teacher"],
      required: true
    },

    enrollmentNumber: {
      type: String,
      unique: true,
      sparse: true
    },

    phoneNumber: {
      type: String
    }
  },
  { timestamps: true }
)

export default mongoose.model("User", userSchema)