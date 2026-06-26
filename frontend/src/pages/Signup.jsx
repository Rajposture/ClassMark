import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../utils/axios"
import { useNavigate } from "react-router-dom"
import { FiEye, FiEyeOff, FiMail } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"

const Signup = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [role, setRole] = useState("student")
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [loadingSignup, setLoadingSignup] = useState(false)
  const [loadingVerify, setLoadingVerify] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    enrollment: "",
    otp: ""
  })

  const handleChange = (e) => {
    setError("")
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Starts a 30-second resend cooldown timer
  const startResendCooldown = () => {
    setResendCooldown(30)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Step 1: Send OTP — backend should store pending data only, not create the user yet
  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")
    setLoadingSignup(true)

    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        enrollment: formData.enrollment,
        role
      })

      setStep(2)
      startResendCooldown()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setLoadingSignup(false)
    }
  }

  // Step 2: Verify OTP — backend creates the real user only after this succeeds
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.otp || formData.otp.length < 4) {
      setError("Please enter a valid OTP.")
      return
    }

    setLoadingVerify(true)

    try {
      const res = await api.post("/auth/verify-signup-otp", {
        email: formData.email,
        otp: formData.otp.trim()
      })

      login(res.data)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.")
      // Clear OTP field so user can re-enter cleanly
      setFormData((prev) => ({ ...prev, otp: "" }))
    } finally {
      setLoadingVerify(false)
    }
  }

  // Resend OTP without going back to step 1
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setError("")
    setLoadingSignup(true)

    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        enrollment: formData.enrollment,
        role
      })

      startResendCooldown()
      setFormData((prev) => ({ ...prev, otp: "" }))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.")
    } finally {
      setLoadingSignup(false)
    }
  }

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
            {step === 1 ? "Create Account" : "Verify OTP"}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {step === 1
              ? "Welcome to ClassMark"
              : `OTP sent to ${formData.email}`}
          </p>
        </div>

        {/* Inline error banner */}
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

        {/* Step 1: Registration Form */}
        {step === 1 && (
          <>
            {/* Role Toggle */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
              <button
                type="button"
                onClick={() => { setRole("student"); setError("") }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  role === "student"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => { setRole("teacher"); setError("") }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  role === "teacher"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Teacher
              </button>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                required
                autoComplete="name"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
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
                  autoComplete="new-password"
                  minLength={6}
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

              <AnimatePresence>
                {role === "student" && (
                  <motion.input
                    key="enrollment"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    type="text"
                    name="enrollment"
                    placeholder="Enrollment Number"
                    value={formData.enrollment}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                  />
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loadingSignup}
                className="w-full py-3 mt-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingSignup ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Email hint */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
              <FiMail className="text-gray-400 shrink-0" size={16} />
              <span className="text-sm text-gray-500 truncate">{formData.email}</span>
              <button
                type="button"
                onClick={() => { setStep(1); setError("") }}
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
              disabled={loadingVerify}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loadingVerify ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <span className="text-sm text-gray-500">Didn't receive it?{" "}</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loadingSignup}
                className="text-sm font-medium text-black hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-black font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  )
}

export default Signup