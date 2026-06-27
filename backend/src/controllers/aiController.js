import Groq from "groq-sdk";
import Chat from "../models/Chat.js";
import Attendance from "../models/Attendance.js";


const PRIMARY_MODEL = "openai/gpt-oss-20b";
const FALLBACK_MODEL = "openai/gpt-oss-120b";


function getGroqErrorCode(err) {
  return (
    err?.error?.error?.code ||
    err?.error?.code ||
    err?.code ||
    null
  );
}

function getGroqStatus(err) {
  return err?.status || err?.error?.status || null;
}

async function callGroqWithFallback(groq, payloadWithoutModel) {
  try {
    return await groq.chat.completions.create({
      model: PRIMARY_MODEL,
      ...payloadWithoutModel,
    });
  } catch (err) {
    const code = getGroqErrorCode(err);

    // Rate limit on the primary model: a different model has its own
    // separate quota on Groq, so retrying with the fallback model can
    // actually succeed rather than just failing twice in a row.
    const isRateLimited = code === "rate_limit_exceeded" || getGroqStatus(err) === 429;
    const isDecommissioned = code === "model_decommissioned";

    if (!isRateLimited && !isDecommissioned) throw err;

    console.warn(
      `Primary model "${PRIMARY_MODEL}" failed (${code || "unknown error"}). Falling back to "${FALLBACK_MODEL}".`
    );
    try {
      return await groq.chat.completions.create({
        model: FALLBACK_MODEL,
        ...payloadWithoutModel,
      });
    } catch (fallbackErr) {

      if (isRateLimited) throw err;
      throw fallbackErr;
    }
  }
}

export const chatWithAI = async (req, res) => {
  let chat = null; // hoisted so the catch block can still save an error reply to it
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const userId = req.user.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // ── Fetch or create chat history ──────────────────────────────
    chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = await Chat.create({ userId, messages: [] });
    }

    // ── System prompt based on role ───────────────────────────────
    const systemPrompt =
      req.user.role === "teacher"
        ? `You are ClassMark AI, an advanced assistant helping teachers manage lectures, assignments, and student analytics. Be concise, professional, and helpful. Format lists with bullet points where appropriate.`
        : `You are ClassMark AI, an advanced assistant helping students track attendance, assignments, and academic progress. Be encouraging, concise, and helpful. Format lists with bullet points where appropriate.`;

    // ── Handle attendance intent ──────────────────────────────────
    // (parens added: previous version's `||` had lower precedence than
    // intended, so "my attendance" alone wouldn't reliably combine with
    // the other branch the way it looked like it should)
    const lower = message.toLowerCase();
    if (
      (lower.includes("attendance") && lower.includes("show")) ||
      lower.includes("my attendance")
    ) {
      try {
        // Try both field names for compatibility
        const count = await Attendance.countDocuments({
          $or: [{ studentId: userId }, { student: userId }],
          status: "present",
        });
        const total = await Attendance.countDocuments({
          $or: [{ studentId: userId }, { student: userId }],
        });

        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const reply =
          total === 0
            ? "No attendance records found yet."
            : `Your attendance: **${count} / ${total} classes** attended (${pct}%).${pct < 75 ? "\n⚠️ You are below the 75% minimum — try to attend more classes." : "\n✅ You're above the 75% threshold. Keep it up!"}`;

        chat.messages.push({ role: "user", content: message });
        chat.messages.push({ role: "assistant", content: reply });
        await chat.save();
        return res.json({ reply });
      } catch (dbErr) {
        console.error("Attendance DB error:", dbErr);
        // Fall through to Groq if DB query fails
      }
    }

    // ── Push user message ─────────────────────────────────────────
    chat.messages.push({ role: "user", content: message });

    // ── Build message array for Groq (last 12 messages) ──────────
    const formattedMessages = chat.messages
      .slice(-12)
      .map((msg) => ({ role: msg.role, content: msg.content }));

    // ── Call Groq (with automatic fallback model on deprecation) ──
    const completion = await callGroqWithFallback(groq, {
      messages: [{ role: "system", content: systemPrompt }, ...formattedMessages],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // ── Save assistant reply ──────────────────────────────────────
    chat.messages.push({ role: "assistant", content: reply });
    await chat.save();

    res.json({ reply });
  } catch (error) {
    console.error("GROQ ERROR:", error?.error || error?.message || error);

    const code = getGroqErrorCode(error);
    const isRateLimited = code === "rate_limit_exceeded" || getGroqStatus(error) === 429;

    if (isRateLimited) {
      // Try to surface Groq's suggested wait time if it's in the message,
      // e.g. "...try again in 12.5s". Falls back to generic wording if not.
      const rawMessage = error?.error?.error?.message || error?.error?.message || "";
      const waitMatch = rawMessage.match(/try again in ([\d.]+)s/i);
      const waitHint = waitMatch
        ? ` Please try again in about ${Math.ceil(parseFloat(waitMatch[1]))} second${Math.ceil(parseFloat(waitMatch[1])) === 1 ? "" : "s"}.`
        : " Please wait a moment and try again.";

      const reply = `⏳ I'm getting a lot of requests right now and have hit a temporary usage limit.${waitHint}`;

      // Save it like a normal assistant message so it shows in chat history
      // consistently, rather than only as a one-off error banner.
      // (guard in case the error happened before `chat` was ever fetched)
      if (chat) {
        try {
          chat.messages.push({ role: "assistant", content: reply });
          await chat.save();
        } catch (saveErr) {
          console.error("Failed to save rate-limit reply:", saveErr);
        }
      }

      return res.status(429).json({
        reply,
        message: "Rate limit exceeded. Please try again shortly.",
        retryable: true,
      });
    }

    res.status(500).json({
      message: "AI service failed. Please try again.",
      detail: error?.message,
    });
  }
};