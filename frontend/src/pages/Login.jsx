import { useState } from "react"
import { motion } from "framer-motion"
import api from "../utils/axios"
import { useNavigate } from "react-router-dom"

const Login = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

const res = await api.post("/auth/login", formData)

    localStorage.setItem("token", res.data.token)
    localStorage.setItem("user", JSON.stringify(res.data.user))

    if (res.data.user.role === "teacher") {
      navigate("/teacher-dashboard")
    } else {
      navigate("/student-dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eef2f7] via-[#e6ecf5] to-[#dde4ee] px-4 relative overflow-hidden">

      <div className="absolute w-72 h-72 bg-white/30 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-blue-300/20 rounded-full blur-3xl bottom-10 right-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Login to continue to ClassMark
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            name="email"
            placeholder="Email Address"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
          />

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-black font-medium cursor-pointer hover:underline"
          >
            Create one
          </span>
        </p>
      </motion.div>
    </div>
  )
}

export default Login