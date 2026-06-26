import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi"
import api from "../utils/axios"

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tokenInvalid, setTokenInvalid] = useState(false)

  // ── Guard: no token in URL → show error immediately, don't render form ────
  useEffect(() => {
    if (!token || token.trim() === "") {
      setTokenInvalid(true)
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Client-side validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      await api.post(`/auth/reset-password/${token}`, { password })

      setSuccess(true)

      // Auto-redirect after 3s — user can also click manually
      setTimeout(() => navigate("/login"), 3000)
    } catch (err) {
      const message = err.response?.data?.message || "Reset link expired. Please request a new one."
      setError(message)

      // If the token is rejected by the server, disable the form
      if (err.response?.status === 400 || err.response?.status === 401) {
        setTokenInvalid(true)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Spinner ───────────────────────────────────────────────────────────────
  const Spinner = () => (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] via-[#eef1f6] to-[#e3e8f0] px-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-8"
      >

        {/* ── Invalid / expired token ── */}
        {tokenInvalid && !success && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <FiAlertCircle className="text-red-500" size={28} />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Link Invalid or Expired</h2>
            <p className="text-gray-500 text-sm">
              This password reset link is no longer valid. Please request a new one.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* ── Reset form ── */}
        {!tokenInvalid && !success && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Reset Password
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Choose a strong new password
              </p>
            </div>

            {/* Inline error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* New password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  required
                  minLength={6}
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => { setError(""); setPassword(e.target.value) }}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Confirm password */}
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  required
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => { setError(""); setConfirmPassword(e.target.value) }}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Password match indicator */}
              <AnimatePresence>
                {confirmPassword.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`text-xs px-1 ${
                      password === confirmPassword ? "text-green-500" : "text-red-400"
                    }`}
                  >
                    {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <><Spinner /> Updating...</> : "Update Password"}
              </button>

            </form>
          </>
        )}

        {/* ── Success state ── */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="text-green-500" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900">Password Updated</h2>
            <p className="text-gray-500 text-sm">
              Your password has been reset successfully. Redirecting to login...
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              Go to Login
            </button>
          </motion.div>
        )}

      </motion.div>
    </div>
  )
}

export default ResetPassword