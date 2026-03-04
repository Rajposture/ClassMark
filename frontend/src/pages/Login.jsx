import { useState } from "react"
import { motion } from "framer-motion"
import api from "../utils/axios"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState("login")
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: ""
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post("/auth/login", {
        email: formData.email,
        password: formData.password
      })

      setStep("otp")
      alert("OTP sent to your email")
    } catch (err) {
      alert(err.response?.data?.message || "Login failed")
    }

    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post("/auth/verify-login-otp", {
        email: formData.email,
        otp: formData.otp
      })

      login(res.data)
      navigate("/dashboard")
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP")
    }

    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post("/auth/forgot-password", {
        email: formData.email
      })

      alert("Password reset email sent")
      setStep("login")
    } catch (err) {
      alert(err.response?.data?.message || "Error sending reset email")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] via-[#eef1f6] to-[#e3e8f0] px-4">

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-8"
      >

        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-6">
          {step === "login" && "Login"}
          {step === "otp" && "Enter OTP"}
          {step === "forgot" && "Reset Password"}
        </h1>

        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
            />

            <div className="text-right text-sm">
              <span
                onClick={() => setStep("forgot")}
                className="text-gray-500 cursor-pointer hover:underline"
              >
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Send OTP"
              )}
            </button>

          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">

            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 text-center tracking-[8px] text-lg bg-white border border-gray-200 rounded-xl"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Verify OTP"
              )}
            </button>

          </form>
        )}

        {step === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <p
              onClick={() => setStep("login")}
              className="text-center text-sm text-gray-500 cursor-pointer hover:underline"
            >
              Back to login
            </p>

          </form>
        )}

      </motion.div>
    </div>
  )
}

export default Login