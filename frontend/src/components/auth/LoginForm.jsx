import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
  localStorage.setItem(
    "classmark_user",
    JSON.stringify({
      role: role,       // "teacher"
      email: email
    })
  );

  if (role === "teacher") {
    navigate("/teacher");
  }
};

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    role === "student" ? navigate("/student") : navigate("/teacher");
  };

  return (
    <div
      className="
        w-full max-w-md
        rounded-2xl
        bg-white/20
        backdrop-blur-lg
        border border-white/30
        shadow-2xl
        p-8
        text-white
      "
    >
      {/* Header */}
      <h2 className="text-3xl font-bold text-center">
        Welcome to <span className="text-indigo-300">ClassMark</span>
      </h2>
      <p className="text-center text-white/70 mt-2">
        Smart Attendance. Zero Proxy.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">

        {/* Role */}
        <div>
          <label className="block text-sm mb-1 text-white/80">
            Login As
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="
              w-full px-4 py-2 rounded-lg
              bg-white/20 text-white
              border border-white/30
              focus:outline-none focus:ring-2 focus:ring-indigo-400
            "
          >
            <option value="student" className="text-black">Student</option>
            <option value="teacher" className="text-black">Teacher</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-1 text-white/80">
            Email
          </label>
          <input
            type="email"
            required
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full px-4 py-2 rounded-lg
              bg-white/20 text-white placeholder-white/60
              border border-white/30
              focus:outline-none focus:ring-2 focus:ring-indigo-400
            "
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm mb-1 text-white/80">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full px-4 py-2 rounded-lg
              bg-white/20 text-white placeholder-white/60
              border border-white/30
              focus:outline-none focus:ring-2 focus:ring-indigo-400
            "
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="
            w-full py-2 rounded-lg
            bg-indigo-500/80 hover:bg-indigo-600
            transition font-medium
          "
        >
          Login
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-white/50 mt-6">
        © {new Date().getFullYear()} ClassMark
      </p>
    </div>
  );
};

export default LoginForm;
