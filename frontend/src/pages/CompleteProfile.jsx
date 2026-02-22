import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config/api";

const CompleteProfile = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 Proper redirect using useEffect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Set phone if exists
  useEffect(() => {
    if (user?.phoneNumbers?.length > 0) {
      setPhone(user.phoneNumbers[0].phoneNumber);
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (role === "student" && !enrollmentNumber) {
      setError("Enrollment number required");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("No token");
      }

      const res = await fetch(`${API_BASE}/api/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          role,
          enrollmentNumber: role === "student" ? enrollmentNumber : null,
          phoneNumber: phone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed");
      }

      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error(err);
      setError("Failed to save profile");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Complete Profile
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border p-3 rounded-lg"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          {role === "student" && (
            <input
              type="text"
              placeholder="Enrollment Number"
              value={enrollmentNumber}
              onChange={(e) => setEnrollmentNumber(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          )}

          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            {loading ? "Saving..." : "Continue"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;