import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    enrollmentNumber: "",
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email.toLowerCase(),
        password: form.password,
        role,
        enrollmentNumber:
          role === "student" ? form.enrollmentNumber : undefined,
      };

      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Signup failed");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setOtpSent(true);
    } catch (err) {
      setError(err.message || "Server error during signup");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.toLowerCase(),
          otp,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data?.message || "OTP verification failed");
      }

      if (!data.success) {
        throw new Error(data.message || "Invalid OTP");
      }

      localStorage.setItem("token", data.token);
      setUser(data.user);

      navigate(data.user.role === "teacher" ? "/teacher" : "/student");
    } catch (err) {
      setError(err.message || "Server error during OTP verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-black px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md lg:max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ClassMark
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Smart Institutional Attendance
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-400 bg-red-900/30 border border-red-800 p-3 rounded-lg text-center mb-4"
          >
            {error}
          </motion.div>
        )}

        <form className="space-y-4 text-white">
          <div>
            <label className="text-sm text-slate-400">Register As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            required
          />

          {role === "student" && (
            <input
              name="enrollmentNumber"
              placeholder="Enrollment Number"
              value={form.enrollmentNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            required
          />

          {!otpSent && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={sendOtp}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Create Account"}
            </motion.button>
          )}

          {otpSent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center tracking-widest focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                required
              />

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={verifyOtp}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all font-semibold"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </motion.button>
            </motion.div>
          )}
        </form>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
