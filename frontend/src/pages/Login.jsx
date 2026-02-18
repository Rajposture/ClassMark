import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";

const Login = () => {
  const navigate = useNavigate();
  const { refreshUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mode, setMode] = useState("login");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginUser = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // 🔥 Store token in localStorage
      localStorage.setItem("token", data.token);

      await refreshUser();

      navigate(
        data.user.role === "teacher" ? "/teacher" : "/student"
      );
    } catch {
      setError("Unable to login");
    } finally {
      setLoading(false);
    }
  };

  const sendResetOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setMode("verify-otp");
    } catch {
      setError("Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Password reset failed");
        return;
      }

localStorage.setItem("token", data.token);

// directly update context user
refreshUser();

navigate(
  data.user.role === "teacher" ? "/teacher" : "/student"
);

    } catch {
      setError("Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-black px-4">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-2xl font-semibold text-white text-center">
          {mode === "login" ? "Sign In" : "Reset Password"}
        </h2>

        {error && (
          <div className="mt-4 text-sm text-red-400 bg-red-900/30 border border-red-800 p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4 text-white">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg"
          />

          {mode === "login" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg"
            />
          )}

          {mode === "verify-otp" && (
            <>
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-center"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg"
              />
            </>
          )}

          {mode === "login" && (
            <button
              onClick={loginUser}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          )}

          {mode === "login" && (
            <button
              onClick={() => setMode("forgot")}
              className="text-sm text-indigo-400 text-center w-full"
            >
              Forgot password?
            </button>
          )}

          {mode === "forgot" && (
            <button
              onClick={sendResetOtp}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          )}

          {mode === "verify-otp" && (
            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          )}
        </div>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
