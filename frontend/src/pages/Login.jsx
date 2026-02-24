import { useState } from "react"
import { motion } from "framer-motion"
import api from "../utils/axios"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await api.post("/auth/login", formData)

      login(res.data)   // 🔥 THIS IS IMPORTANT

      navigate("/dashboard")
    } catch (err) {
      alert(err.response?.data?.message || "Login failed")
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
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-xl"
          >
            Login
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default Login