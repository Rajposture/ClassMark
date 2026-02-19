import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API_BASE from "../config/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Reset failed");
        return;
      }

      setMessage("Password reset successful. Redirecting...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch {
      setError("Server error. Please try again.");
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
            Reset Password
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Enter your new password
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 p-3 rounded-xl text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5">

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 focus:bg-white focus:border-gray-400 outline-none transition"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 focus:bg-white focus:border-gray-400 outline-none transition"
            required
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </motion.button>

        </form>

        <p className="text-sm text-gray-500 mt-8 text-center">
          Back to{" "}
          <Link to="/login" className="text-black font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </motion.div>
    </div>
  );
};

export default ResetPassword;
