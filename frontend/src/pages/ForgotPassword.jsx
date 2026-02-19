import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import API_BASE from "../config/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong");
        return;
      }

      setMessage("Password reset link sent to your email.");

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
            Forgot Password
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Enter your email to receive reset link
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

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 focus:bg-white focus:border-gray-400 outline-none transition"
            required
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </motion.button>

        </form>

        <p className="text-sm text-gray-500 mt-8 text-center">
          Remember your password?{" "}
          <Link to="/login" className="text-black font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </motion.div>
    </div>
  );
};

export default ForgotPassword;
