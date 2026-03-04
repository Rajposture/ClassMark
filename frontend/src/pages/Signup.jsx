import { useState } from "react"
import { motion } from "framer-motion"
import api from "../utils/axios"
import { useNavigate } from "react-router-dom"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"

const Signup = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [role, setRole] = useState("student")
  const [showPassword, setShowPassword] = useState(false)

  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    enrollment: "",
    otp: ""
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

 
  const handleSignup = async (e) => {
    e.preventDefault()

    try {
      await api.post("/auth/register", {
        ...formData,
        role
      })

      setStep(2)
      alert("OTP sent to your email")
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed")
    }
  }


  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    try {
      const res = await api.post("/auth/verify-signup-otp", {
        email: formData.email,
        otp: formData.otp
      })

      login(res.data)

      navigate("/dashboard")
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP")
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

        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            {step === 1 ? "Create Account" : "Verify OTP"}
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Welcome to ClassMark
          </p>
        </div>

        {step === 1 && (
          <>
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">

              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                  role === "student"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Student
              </button>

              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                  role === "teacher"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500"
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
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl pr-12"
                />

                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>

              {role === "student" && (
                <motion.input
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="text"
                  name="enrollment"
                  placeholder="Enrollment Number"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
                />
              )}

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-black text-white rounded-xl"
              >
                Send OTP
              </button>

            </form>
          </>
        )}

        {step === 2 && (
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
              className="w-full py-3 bg-black text-white rounded-xl"
            >
              Verify OTP
            </button>

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