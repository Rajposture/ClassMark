import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";
const { setUser } = useContext(AuthContext);
const Signup = () => {
  const navigate = useNavigate();
  const { refreshUser } = useContext(AuthContext);

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
        email: form.email,
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

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
    } catch {
      setError("Server error during signup");
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
        body: JSON.stringify({ email: form.email, otp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid OTP");
        return;
      }

localStorage.setItem("token", data.token);
setUser(data.user);

navigate(
  data.user.role === "teacher" ? "/teacher" : "/student"
);

    } catch {
      setError("Server error during OTP verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 px-4 py-10">
      <div className="relative w-full max-w-md backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent">
            ClassMark
          </h1>
          <p className="text-slate-200 text-sm mt-1">
            Smart Institutional Attendance
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-200 bg-red-500/20 border border-red-400/40 p-3 rounded-lg text-center mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4 text-white">
          <div>
            <label className="text-sm text-slate-200">Register As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg"
            >
              <option value="student" className="text-black">
                Student
              </option>
              <option value="teacher" className="text-black">
                Teacher
              </option>
            </select>
          </div>

          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg"
          />

          {role === "student" && (
            <input
              name="enrollmentNumber"
              placeholder="Enrollment Number"
              value={form.enrollmentNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg"
          />

          {!otpSent && (
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Create Account"}
            </button>
          )}

          {otpSent && (
            <>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-center tracking-widest"
              />

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}
        </form>

        <p className="text-sm text-slate-200 mt-6 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-300 hover:text-white font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
