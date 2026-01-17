import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    enrollment: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    // 🔒 Validation
    if (form.role === "student" && !form.enrollment) {
      alert("Enrollment number is required for students");
      return;
    }

    const user = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      enrollment: form.role === "student" ? form.enrollment : null,
      avatar: "",
      createdAt: Date.now(),
    };

    // Save user
    localStorage.setItem("classmark_user", JSON.stringify(user));

    // Notify navbar
    window.dispatchEvent(new Event("userUpdated"));

    // Redirect by role
    navigate(form.role === "teacher" ? "/teacher" : "/student");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="pt-32 flex justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center text-indigo-600">
            Create Account
          </h2>

          <p className="text-center text-slate-500 mt-2">
            Join ClassMark
          </p>

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            {/* Role */}
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            {/* Name */}
            <input
              type="text"
              name="name"
              required
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
            />

            {/* Enrollment (STUDENT ONLY) */}
            {form.role === "student" && (
              <input
                type="text"
                name="enrollment"
                required
                placeholder="Enrollment Number"
                value={form.enrollment}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
              />
            )}

            {/* Email */}
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
            />

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
