import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import api from "../utils/axios"

const ResetPassword = () => {

  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      return alert("Please fill all fields")
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match")
    }

    try {

      setLoading(true)

      await api.post(`/auth/reset-password/${token}`, {
        password
      })

      setSuccess(true)

      setTimeout(() => {
        navigate("/login")
      }, 2000)

    } catch (err) {

      const message =
        err.response?.data?.message ||
        "Reset link expired. Please request again."

      alert(message)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] via-[#eef1f6] to-[#e3e8f0] px-4">

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-8"
      >

        {!success && (
          <>
            <h1 className="text-3xl font-semibold text-gray-900 text-center mb-6">
              Reset Password
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="password"
                placeholder="New Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl font-medium transition hover:bg-gray-800 disabled:opacity-70"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>

            </form>
          </>
        )}

        {success && (
          <div className="text-center">

            <h2 className="text-2xl font-semibold text-green-600 mb-3">
              Password Updated
            </h2>

            <p className="text-gray-500 text-sm">
              Redirecting to login...
            </p>

          </div>
        )}

      </motion.div>

    </div>
  )
}

export default ResetPassword