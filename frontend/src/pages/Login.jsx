import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../utils/axios"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { FiEye, FiEyeOff, FiMail } from "react-icons/fi"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Steps: "login" → "otp" → (dashboard)
  //        "login" → "forgot" → "reset-otp" → "new-password" → "login"
  const [step, setStep] = useState("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    newPassword: ""
  })

  const handleChange = (e) => {
    setError("")
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const startResendCooldown = () => {
    setResendCooldown(30)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // ── Step 1: Login → sends OTP ─────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.post("/auth/login", {
        email: formData.email,
        password: formData.password
      })

      setStep("otp")
      startResendCooldown()
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify login OTP ──────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.otp || formData.otp.length < 4) {
      setError("Please enter a valid OTP.")
      return
    }

    setLoading(true)

    try {
      const res = await api.post("/auth/verify-login-otp", {
        email: formData.email,
        otp: formData.otp.trim()
      })

      login(res.data)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.")
      setFormData((prev) => ({ ...prev, otp: "" }))
    } finally {
      setLoading(false)
    }
  }

  // ── Resend login OTP ──────────────────────────────────────────────────────
  const handleResendLoginOtp = async () => {
    if (resendCooldown > 0) return
    setError("")
    setLoading(true)

    try {
      await api.post("/auth/login", {
        email: formData.email,
        password: formData.password
      })

      startResendCooldown()
      setFormData((prev) => ({ ...prev, otp: "" }))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.")
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot password: send reset OTP ──────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.post("/auth/forgot-password", {
        email: formData.email
      })

      // Move to OTP entry for password reset — don't jump back to login
      setStep("reset-otp")
      startResendCooldown()
    } catch (err) {
      setError(err.response?.data?.message || "Error sending reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ── Verify reset OTP ──────────────────────────────────────────────────────
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.otp || formData.otp.length < 4) {
      setError("Please enter a valid OTP.")
      return
    }

    setLoading(true)

    try {
      await api.post("/auth/verify-reset-otp", {
        email: formData.email,
        otp: formData.otp.trim()
      })

      setStep("new-password")
      setFormData((prev) => ({ ...prev, otp: "" }))
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.")
      setFormData((prev) => ({ ...prev, otp: "" }))
    } finally {
      setLoading(false)
    }
  }

  // ── Resend reset OTP ──────────────────────────────────────────────────────
  const handleResendResetOtp = async () => {
    if (resendCooldown > 0) return
    setError("")
    setLoading(true)

    try {
      await api.post("/auth/forgot-password", { email: formData.email })
      startResendCooldown()
      setFormData((prev) => ({ ...prev, otp: "" }))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.")
    } finally {
      setLoading(false)
    }
  }

  // ── Set new password ──────────────────────────────────────────────────────
  const handleSetNewPassword = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.newPassword || formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)

    try {
      await api.post("/auth/reset-password", {
        email: formData.email,
        newPassword: formData.newPassword
      })

      // Reset all state and go back to login
      setFormData({ email: "", password: "", otp: "", newPassword: "" })
      setStep("login")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ── Shared heading map ────────────────────────────────────────────────────
  const headings = {
    login: "Login",
    otp: "Enter OTP",
    forgot: "Reset Password",
    "reset-otp": "Verify OTP",
    "new-password": "New Password"
  }

  const subheadings = {
    login: null,
    otp: `OTP sent to ${formData.email}`,
    forgot: "Enter your registered email",
    "reset-otp": `OTP sent to ${formData.email}`,
    "new-password": "Choose a strong new password"
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
        transition={{ duration: 0.8 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            {headings[step]}
          </h1>
          {subheadings[step] && (
            <p className="text-gray-500 text-sm mt-2">{subheadings[step]}</p>
          )}
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

        {/* ── Step: login ── */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              required
              autoComplete="email"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                required
                autoComplete="current-password"
                onChange={handleChange}
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

            <div className="text-right text-sm">
              <span
                onClick={() => { setStep("forgot"); setError("") }}
                className="text-gray-500 cursor-pointer hover:underline"
              >
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner /> Sending OTP...</> : "Send OTP"}
            </button>
          </form>
        )}

        {/* ── Step: login otp ── */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
              <FiMail className="text-gray-400 shrink-0" size={16} />
              <span className="text-sm text-gray-500 truncate">{formData.email}</span>
              <button
                type="button"
                onClick={() => { setStep("login"); setError("") }}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 shrink-0 transition"
              >
                Change
              </button>
            </div>

            <input
              type="text"
              name="otp"
              placeholder="• • • • • •"
              value={formData.otp}
              required
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              onChange={handleChange}
              className="w-full px-4 py-3 text-center tracking-[8px] text-lg bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner /> Verifying...</> : "Verify OTP"}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-500">Didn't receive it?{" "}</span>
              <button
                type="button"
                onClick={handleResendLoginOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-sm font-medium text-black hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {/* ── Step: forgot password ── */}
        {step === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              required
              autoComplete="email"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner /> Sending...</> : "Send Reset OTP"}
            </button>

            <p
              onClick={() => { setStep("login"); setError("") }}
              className="text-center text-sm text-gray-500 cursor-pointer hover:underline"
            >
              Back to login
            </p>
          </form>
        )}

        {/* ── Step: verify reset OTP ── */}
        {step === "reset-otp" && (
          <form onSubmit={handleVerifyResetOtp} className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
              <FiMail className="text-gray-400 shrink-0" size={16} />
              <span className="text-sm text-gray-500 truncate">{formData.email}</span>
              <button
                type="button"
                onClick={() => { setStep("forgot"); setError("") }}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 shrink-0 transition"
              >
                Change
              </button>
            </div>

            <input
              type="text"
              name="otp"
              placeholder="• • • • • •"
              value={formData.otp}
              required
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              onChange={handleChange}
              className="w-full px-4 py-3 text-center tracking-[8px] text-lg bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner /> Verifying...</> : "Verify OTP"}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-500">Didn't receive it?{" "}</span>
              <button
                type="button"
                onClick={handleResendResetOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-sm font-medium text-black hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {/* ── Step: set new password ── */}
        {step === "new-password" && (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                required
                minLength={6}
                autoComplete="new-password"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner /> Saving...</> : "Set New Password"}
            </button>
          </form>
        )}

        {/* Footer */}
        {(step === "login" || step === "forgot") && (
          <p className="text-center text-sm text-gray-500 mt-6">
            {step === "login" ? (
              <>
                Don't have an account?{" "}
                <span
                  onClick={() => navigate("/signup")}
                  className="text-black font-medium cursor-pointer hover:underline"
                >
                  Sign up
                </span>
              </>
            ) : null}
          </p>
        )}
      </motion.div>
    </div>
  )
}

export default Login