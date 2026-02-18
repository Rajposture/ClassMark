import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";

const Login = () => {
  const navigate = useNavigate();

  // ✅ Get setUser from context at TOP LEVEL
  const { setUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginUser = async (e) => {
    e.preventDefault(); // ✅ prevent page reload

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

      // ✅ Store token
      localStorage.setItem("token", data.token);

      // ✅ Immediately authenticate user
      setUser(data.user);

      // ✅ Redirect via central dashboard route
      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError("Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-black px-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">

        <h2 className="text-2xl font-semibold text-white text-center">
          Sign In
        </h2>

        {error && (
          <div className="mt-4 text-sm text-red-400 bg-red-900/30 border border-red-800 p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* ✅ FORM wrapper prevents reload */}
        <form onSubmit={loginUser} className="mt-6 space-y-4 text-white">

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

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
