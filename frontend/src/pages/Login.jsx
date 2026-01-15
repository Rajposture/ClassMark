import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [enrollment, setEnrollment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔥 MAIN USER OBJECT (FOR NAVBAR & AUTH)
    const userData = {
      name: role === "student" ? name : "Teacher",
      enrollment: role === "student" ? enrollment : "",
      email,
      role,
      profilePic: null,
    };

    // 🔥 STORE USER (NAVBAR READS THIS)
    localStorage.setItem("user", JSON.stringify(userData));

    // 🔥 DISPATCH LOGIN EVENT (THIS FIXES THE BUG)
    window.dispatchEvent(new Event("user-login"));

    // 🔥 KEEP YOUR EXISTING STORAGE (OPTIONAL, SAFE)
    localStorage.setItem(
      "classmark_user",
      JSON.stringify({
        role,
        email,
      })
    );

    if (role === "student") {
      localStorage.setItem(
        "classmark_student",
        JSON.stringify({
          name,
          enrollment,
          avatar: "",
        })
      );
      navigate("/student");
    } else {
      navigate("/teacher");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
      {/* Glass Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl text-white"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          ClassMark Login
        </h1>

        {/* Role */}
        <label className="block text-sm mb-1">Login as</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white/80 text-black outline-none"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        {/* Student Fields */}
        {role === "student" && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mb-3 px-4 py-2 rounded-lg bg-white/80 text-black outline-none"
            />

            <input
              type="text"
              placeholder="Enrollment Number"
              value={enrollment}
              onChange={(e) => setEnrollment(e.target.value)}
              required
              className="w-full mb-3 px-4 py-2 rounded-lg bg-white/80 text-black outline-none"
            />
          </>
        )}

        {/* Common Fields */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-3 px-4 py-2 rounded-lg bg-white/80 text-black outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 px-4 py-2 rounded-lg bg-white/80 text-black outline-none"
        />

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
