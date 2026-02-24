import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"

const VerifyEnrollment = () => {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [enrollment, setEnrollment] = useState("")
  const [error, setError] = useState("")

  if (!user || user.role !== "student") {
    navigate("/login")
    return null
  }

  const handleVerify = () => {
    if (enrollment !== user.enrollment) {
      setError("Invalid Enrollment Number")
      return
    }

    navigate(`/attendance/${lectureId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
          Verify Enrollment
        </h2>

        <input
          type="text"
          placeholder="Enter Enrollment Number"
          value={enrollment}
          onChange={(e) => setEnrollment(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none"
        />

        <button
          onClick={handleVerify}
          className="w-full mt-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition"
        >
          Verify & Continue
        </button>

        {error && (
          <p className="text-center text-red-500 mt-4 text-sm">{error}</p>
        )}
      </motion.div>
    </div>
  )
}

export default VerifyEnrollment