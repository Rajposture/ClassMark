import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);

  const from = location.state?.from || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      setUser(data.user);

      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(data.user.role === "teacher" ? "/teacher" : "/student", {
          replace: true,
        });
      }

    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Sign in to ClassMark
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Enter your credentials to continue
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={loginUser} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 focus:bg-white focus:border-gray-400 outline-none transition"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 focus:bg-white focus:border-gray-400 outline-none transition"
            required
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-gray-600 hover:text-black transition"
          >
            Forgot Password?
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8 text-center">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-black font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
