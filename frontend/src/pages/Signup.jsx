import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_BASE from "../config/api";
import { AuthContext } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    enrollmentNumber: "",
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload =
        role === "student"
          ? { ...form, role }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role,
            };

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      login(data.user);
      navigate(data.user.role === "teacher" ? "/teacher" : "/student");
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 px-4 py-10 relative overflow-hidden">

      {/* Decorative gradient blur circles */}
      <div className="absolute w-72 h-72 bg-indigo-500 rounded-full blur-3xl opacity-30 top-10 -left-10"></div>
      <div className="absolute w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-30 bottom-10 -right-10"></div>

      {/* GLASS CARD */}
      <div className="relative w-full max-w-md backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">

        {/* BRAND */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent">
            ClassMark
          </h1>
          <p className="text-slate-200 text-sm mt-1">
            Smart Institutional Attendance
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-sm text-red-200 bg-red-500/20 border border-red-400/40 p-3 rounded-lg text-center mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 text-white">

          {/* ROLE */}
          <div>
            <label className="text-sm text-slate-200">
              Register As
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-md text-white"
            >
              <option value="student" className="text-black">Student</option>
              <option value="teacher" className="text-black">Teacher</option>
            </select>
          </div>

          {/* NAME */}
          <div>
            <label className="text-sm text-slate-200">
              {role === "teacher" ? "Teacher Name" : "Full Name"}
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-md placeholder-slate-300 text-white"
            />
          </div>

          {/* ENROLLMENT */}
          {role === "student" && (
            <div>
              <label className="text-sm text-slate-200">
                Enrollment Number
              </label>
              <input
                type="text"
                name="enrollmentNumber"
                required
                value={form.enrollmentNumber}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-md text-white"
              />
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="text-sm text-slate-200">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-md text-white"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-slate-200">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-md text-white"
            />
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold shadow-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
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
