import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: String,
  content: String
});

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    messages: [messageSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);