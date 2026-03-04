import Groq from "groq-sdk";
import Chat from "../models/Chat.js";
import Attendance from "../models/Attendance.js";

export const chatWithAI = async (req, res) => {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const userId = req.user.id;
    const { message } = req.body;

    let chat = await Chat.findOne({ userId });

    if (!chat) {
      chat = await Chat.create({
        userId,
        messages: []
      });
    }

    const systemPrompt =
      req.user.role === "teacher"
        ? "You are an advanced AI assistant helping teachers manage lectures, assignments and analytics."
        : "You are an advanced AI assistant helping students track attendance, assignments and academic progress.";


    if (message.toLowerCase().includes("attendance")) {
      const count = await Attendance.countDocuments({
        studentId: userId
      });

      return res.json({
        reply: `You have attended ${count} lectures so far.`
      });
    }

    chat.messages.push({ role: "user", content: message });


    const formattedMessages = chat.messages
      .slice(-10)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

const completion = await groq.chat.completions.create({
  model: "mixtral-8x7b-32768",
  messages: [
    { role: "system", content: systemPrompt },
    ...formattedMessages
  ],
});

    const reply = completion.choices[0].message.content;


    chat.messages.push({ role: "assistant", content: reply });
    await chat.save();

    res.json({ reply });

  } catch (error) {
  console.error("FULL GROQ ERROR:", error.response?.data || error);
  res.status(500).json({ message: "Groq failed" });
}
};