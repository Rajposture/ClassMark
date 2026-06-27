import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../../utils/axios"
import { useAuth } from "../../context/AuthContext"

// ─── Inline SVG icons (no extra deps needed) ──────────────────────────────────
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)

// ─── Typing indicator dots ────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 14px", background: "#fff", border: "1px solid #E8E4FF", borderRadius: "18px 18px 18px 4px", width: "fit-content", maxWidth: 80 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18, ease: "easeInOut" }}
          style={{ width: 7, height: 7, borderRadius: "50%", background: "#818CF8" }}
        />
      ))}
    </div>
  )
}

// ─── Simple markdown renderer (bold + bullets) ────────────────────────────────
function RenderMessage({ text }) {
  const lines = text.split("\n")
  return (
    <div style={{ lineHeight: 1.55 }}>
      {lines.map((line, i) => {
        // Bullet
        if (line.startsWith("- ") || line.startsWith("• ")) {
          const content = line.replace(/^[-•]\s/, "")
          return (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}>
              <span style={{ flexShrink: 0, marginTop: 2 }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: boldify(content) }} />
            </div>
          )
        }
        if (line.trim() === "") return <div key={i} style={{ height: 6 }} />
        return <div key={i} dangerouslySetInnerHTML={{ __html: boldify(line) }} />
      })}
    </div>
  )
}

function boldify(text) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
}

// ─── Main AIRobo ──────────────────────────────────────────────────────────────
const AIRobo = () => {
  const { user } = useAuth()
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [listening, setListening] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Welcome message when chat first opens
  useEffect(() => {
    if (open && messages.length === 0 && user) {
      setMessages([{
        role: "assistant",
        content: user.role === "teacher"
          ? "Hello Professor 👋 I'm ClassMark AI. How can I assist you today?"
          : "Hello 👋 I'm ClassMark AI. How can I help with your studies today?"
      }])
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setError("")
    setInput("")

    setMessages(prev => [...prev, { role: "user", content: trimmed }])
    setLoading(true)

    try {
      const res = await api.post("/ai/chat", { message: trimmed })
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }])
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again."
      setError(msg)
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ " + msg }])
    } finally {
      setLoading(false)
    }
  }

  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setError("Voice input is not supported in this browser.")
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.start()
    setListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend   = () => setListening(false)
  }

  if (!user) return null

  const suggestions = user.role === "teacher"
    ? ["Generate quiz questions", "Class attendance summary", "Assignment ideas for DSA"]
    : ["What is Big O notation?", "Upcoming lecture tips"]

  return (
    <>
      <style>{`
        .ai-robo-root * { box-sizing: border-box; }
        .ai-chat-bubble-user {
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          color: #fff;
          border-radius: 18px 18px 4px 18px;
          padding: 9px 14px;
          font-size: 0.8rem;
          max-width: 80%;
          align-self: flex-end;
          word-break: break-word;
          line-height: 1.5;
        }
        .ai-chat-bubble-ai {
          background: #fff;
          color: #1C2B42;
          border: 1px solid #E8E4FF;
          border-radius: 18px 18px 18px 4px;
          padding: 9px 14px;
          font-size: 0.8rem;
          max-width: 82%;
          align-self: flex-start;
          word-break: break-word;
        }
        .ai-suggestion-btn {
          padding: 5px 11px;
          border-radius: 999px;
          border: 1.5px solid #E8E4FF;
          background: #fff;
          font-size: 0.7rem;
          color: #4F46E5;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          font-family: inherit;
        }
        .ai-suggestion-btn:hover { background: #EEF2FF; border-color: #C4B5FD; }
        .ai-input {
          flex: 1;
          min-width: 0;
          padding: 9px 14px;
          border-radius: 999px;
          border: 1.5px solid #E8E4FF;
          font-size: 0.8rem;
          font-family: inherit;
          color: #0F172A;
          outline: none;
          background: #FAFAFE;
          transition: border-color 0.2s;
        }
        .ai-input:focus { border-color: #4F46E5; background: #fff; }
        .ai-input::placeholder { color: #C4B5FD; }
        .ai-send-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          border: none;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 3px 10px rgba(79,70,229,0.35);
        }
        .ai-send-btn:hover { opacity: 0.88; transform: scale(1.05); }
        .ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .ai-mic-btn {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #EEF2FF;
          border: 1.5px solid #E8E4FF;
          color: #4F46E5;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .ai-mic-btn:hover { background: #E0E7FF; }
        .ai-mic-btn.listening { background: #EF4444; border-color: #EF4444; color: #fff; animation: ai-mic-pulse 1s ease-in-out infinite; }
        @keyframes ai-mic-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes ai-robo-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
      `}</style>

      <div className="ai-robo-root">
        {/* ── Floating button ────────────────────────────────── */}
        <motion.div
          drag dragElastic={0.2} dragMomentum={false}
          style={{ position: "fixed", bottom: 20, right: 20, zIndex: 999 }}
        >
          <div
            onClick={() => setOpen(o => !o)}
            style={{
              width: 58, height: 58,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              boxShadow: "0 6px 24px rgba(79,70,229,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              animation: open ? "none" : "ai-robo-bob 2.2s ease-in-out infinite",
            }}
          >
            {open ? (
              <CloseIcon />
            ) : (
              /* Robot "eyes" */
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 0.25].map((delay, i) => (
                  <motion.div key={i}
                    animate={{ scaleY: [1, 0.15, 1] }}
                    transition={{ repeat: Infinity, duration: 3, delay }}
                    style={{ width: 10, height: 10, background: "#fff", borderRadius: "50%" }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Chat window ────────────────────────────────────── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                // Mobile: full screen
                bottom: 0, right: 0, left: 0, top: 0,
                // Desktop: floating panel
                zIndex: 998,
                display: "flex", flexDirection: "column",
                background: "#F8F7FF",
                fontFamily: "'Inter', 'DM Sans', sans-serif",
                // Desktop override via media query (applied via class)
              }}
              className="ai-chat-window"
            >
              <style>{`
                @media (min-width: 560px) {
                  .ai-chat-window {
                    bottom: 88px !important;
                    right: 20px !important;
                    left: auto !important;
                    top: auto !important;
                    width: 370px !important;
                    height: 560px !important;
                    border-radius: 20px !important;
                    box-shadow: 0 20px 60px rgba(79,70,229,0.18), 0 4px 20px rgba(0,0,0,0.08) !important;
                    overflow: hidden;
                  }
                }
              `}</style>

              {/* Header */}
              <div style={{
                background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                padding: "14px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Mini robot avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>
                    {[0, 0.3].map((d, i) => (
                      <motion.div key={i}
                        animate={{ scaleY: [1, 0.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: d }}
                        style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%" }}
                      />
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff" }}>ClassMark AI</div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)" }}>
                      {loading ? "Thinking…" : "Online"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CloseIcon />
                </button>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "16px 14px",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={msg.role === "user" ? "ai-chat-bubble-user" : "ai-chat-bubble-ai"}
                  >
                    {msg.role === "assistant"
                      ? <RenderMessage text={msg.content} />
                      : msg.content}
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <TypingDots />
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              <div style={{
                padding: "8px 14px 6px",
                display: "flex", gap: 6, overflowX: "auto", flexShrink: 0,
                background: "#F8F7FF",
                scrollbarWidth: "none",
              }}>
                {suggestions.map((s, i) => (
                  <button key={i} className="ai-suggestion-btn"
                    onClick={() => sendMessage(s)} disabled={loading}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    style={{ background: "#FEF2F2", borderTop: "1px solid #FECACA", padding: "6px 14px", fontSize: "0.72rem", color: "#DC2626", flexShrink: 0 }}>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input bar */}
              <div style={{
                padding: "10px 14px",
                borderTop: "1px solid #E8E4FF",
                display: "flex", alignItems: "center", gap: 8,
                background: "#fff", flexShrink: 0,
              }}>
                <button
                  className={`ai-mic-btn${listening ? " listening" : ""}`}
                  onClick={startVoice}
                  title="Voice input"
                >
                  <MicIcon />
                </button>

                <input
                  ref={inputRef}
                  className="ai-input"
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder={listening ? "Listening…" : "Ask something…"}
                  disabled={loading}
                />

                <button
                  className="ai-send-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  title="Send"
                >
                  <SendIcon />
                </button>
              </div>

              {/* Mobile safe area spacer */}
              <div style={{ height: "env(safe-area-inset-bottom, 0px)", background: "#fff", flexShrink: 0 }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default AIRobo