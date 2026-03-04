import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiX, FiSend } from "react-icons/fi"
import { IoMicOutline } from "react-icons/io5"
import api from "../../utils/axios"
import { useAuth } from "../../context/AuthContext"

const AIRobo = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Welcome Message
  useEffect(() => {
    if (open && messages.length === 0 && user) {
      setMessages([
        {
          role: "assistant",
          content:
            user.role === "teacher"
              ? "Hello Professor 👋 How can I assist you today?"
              : "Hello 👋 How can I help you with your studies today?"
        }
      ])
    }
  }, [open])

  const sendMessage = async (text) => {
    if (!text.trim()) return

    const userMessage = { role: "user", content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await api.post("/ai/chat", {
        message: text
      })

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply }
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "AI error occurred." }
      ])
    } finally {
      setLoading(false)
    }
  }

  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window)) return

    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = "en-US"
    recognition.start()

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }
  }

  if (!user) return null

  const suggestions =
    user.role === "teacher"
      ? [
          "Generate DBMS assignment",
          "Create quiz questions",
          "Show lecture analytics"
        ]
      : [
          "Show my attendance",
          "Show assignments",
          "Upcoming lectures"
        ]

  return (
    <>
      {/* Floating Robo Button */}
      <motion.div
        drag
        dragElastic={0.2}
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="fixed bottom-5 right-5 z-[999]"
      >
        <div
          onClick={() => setOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center cursor-pointer"
        >
          <div className="flex gap-2">
            <motion.div
              className="w-2.5 h-2.5 bg-white rounded-full"
              animate={{ scaleY: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
            <motion.div
              className="w-2.5 h-2.5 bg-white rounded-full"
              animate={{ scaleY: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 3, delay: 0.2 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 md:inset-auto md:bottom-24 md:right-5 z-[999] md:w-[380px] w-full h-full md:h-[550px] bg-white shadow-2xl rounded-none md:rounded-3xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white md:rounded-t-3xl">
              <span className="font-semibold">ClassMark AI</span>
              <button onClick={() => setOpen(false)}>
                <FiX size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "ml-auto bg-indigo-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {msg.content}
                </motion.div>
              ))}

              {loading && (
                <div className="text-sm text-gray-400 animate-pulse">
                  AI is thinking...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Smart Suggestions */}
            <div className="px-4 pt-2 flex flex-wrap gap-2 bg-gray-50">
              {suggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(item)}
                  className="text-xs px-3 py-1 bg-white border rounded-full"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex items-center gap-2 bg-white md:rounded-b-3xl">
              <button onClick={startVoice} className="text-xl text-gray-600">
                <IoMicOutline />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && sendMessage(input)
                }
                placeholder="Ask something..."
                className="flex-1 px-4 py-2 border rounded-full outline-none"
              />

              <button
                onClick={() => sendMessage(input)}
                className="bg-indigo-600 text-white p-2 rounded-full"
              >
                <FiSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIRobo