import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import confetti from "canvas-confetti"

const VerifyEnrollment = () => {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const [enrollment, setEnrollment] = useState("")
  const [error, setError] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [touchStart, setTouchStart] = useState(null)

  const inputRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user) navigate("/login", { replace: true })
    if (user && user.role !== "student")
      navigate("/teacher-dashboard", { replace: true })
  }, [user, loading, navigate])

  // 🔄 Swipe Back Gesture
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    if (!touchStart) return
    const currentX = e.targetTouches[0].clientX
    if (currentX - touchStart > 120) {
      navigate(-1)
    }
  }

  const handleVerify = () => {
    if (!user) return

    setError("")
    setVerifying(true)

    setTimeout(() => {
      if (enrollment.trim() !== user.enrollment) {
        setError("Invalid Enrollment Number")
        setVerifying(false)
        return
      }

      // 📳 Vibration
      if (navigator.vibrate) navigator.vibrate(200)

      // 🔊 Success Sound
      if (audioRef.current) {
        audioRef.current.play().catch(() => {})
      }

      // 🎊 Confetti Burst
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      })

      setSuccess(true)

      setTimeout(() => {
        navigate(`/attendance/${lectureId}`, { replace: true })
      }, 1500)

    }, 500)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 px-4"
    >

      {/* 🔊 Hidden Audio */}
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3"
      />

      <AnimatePresence mode="wait">

        {!success ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl w-full max-w-md"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8">

              <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
                Verify Enrollment
              </h2>

              <input
                ref={inputRef}
                type="text"
                placeholder="Enrollment Number"
                value={enrollment}
                onChange={(e) => setEnrollment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />

              {/* 🌊 Ripple Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleVerify}
                disabled={verifying}
                className={`relative overflow-hidden w-full mt-6 py-3 rounded-xl font-medium text-white transition-all ${
                  verifying
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                {verifying ? "Verifying..." : "Verify & Continue"}
              </motion.button>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-red-500 mt-4 text-sm"
                >
                  {error}
                </motion.p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 250 }}
              className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="w-12 h-12 text-green-600"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6">
              Verified Successfully 🎉
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              Redirecting to attendance...
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

export default VerifyEnrollment