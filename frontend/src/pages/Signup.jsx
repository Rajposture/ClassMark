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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    enrollment: ""
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/auth/register", {
      ...formData,
      role
    });

    // Make sure backend actually returned success
    if (res.data?.success) {
      login(res.data);
      navigate("/dashboard", { replace: true });
    } else {
      alert(res.data?.message || "Signup failed");
    }

  } catch (err) {
    console.error("Signup error:", err);
    alert(err.response?.data?.message || "Signup failed");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] via-[#eef1f6] to-[#e3e8f0] px-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Welcome to ClassMark
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
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
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
              role === "teacher"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500"
            }`}
          >
            Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition pr-12"
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              type="text"
              name="enrollment"
              placeholder="Enrollment Number (Example: FS24CO0XX)"
              pattern="FS[0-9]{2}CO0[0-9]{2}"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
            />
          )}

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg"
          >
            Create Account
          </button>

        </form>

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