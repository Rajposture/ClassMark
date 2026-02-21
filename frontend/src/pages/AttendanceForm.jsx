import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";

const AttendanceForm = () => {
  const navigate = useNavigate();
  const { token: lectureId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

useEffect(() => {
  if (authLoading) return;

  const token = localStorage.getItem("token");

  if (!token) {
    navigate(`/login?redirect=/attendance/${lectureId}`, { replace: true });
    return;
  }

  if (!user) {
    navigate(`/login?redirect=/attendance/${lectureId}`, { replace: true });
    return;
  }

  if (user.role !== "student") {
    navigate("/teacher", { replace: true });
    return;
  }

  if (!lectureId) {
    navigate("/student", { replace: true });
  }
}, [authLoading, user, navigate, lectureId]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Loading...
      </div>
    );
  }

  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMessage("Location captured successfully");
      },
      () => {
        setMessage("Location permission denied");
      },
      { enableHighAccuracy: true }
    );
  };

  const submitAttendance = async () => {
    if (!latitude || !longitude) {
      setMessage("Please set your location first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const authToken = localStorage.getItem("token");

      if (!authToken) {
        navigate(`/login?redirect=/attendance/${lectureId}`);
        return;
      }

      const res = await fetch(`${API_BASE}/api/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token: lectureId,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to mark attendance");
      } else {
        setSuccess(true);
        setMessage("Attendance marked successfully");

        setTimeout(() => {
          navigate("/student", { replace: true });
        }, 1500);
      }
    } catch {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 w-full max-w-md border border-gray-200 transition-all duration-300 ${
          success ? "scale-105" : ""
        }`}
      >
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6 tracking-tight">
          Mark Attendance
        </h2>

        <div className="mb-6 bg-gray-50/80 backdrop-blur rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Student Name
          </p>
          <p className="font-semibold text-gray-900 mt-1">
            {user?.name}
          </p>

          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Enrollment Number
            </p>
            <p className="font-semibold text-gray-900 mt-1">
              {user?.enrollmentNumber}
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={handleSetLocation}
          className="w-full mb-4 py-3 rounded-2xl bg-black text-white font-medium transition"
        >
          {latitude ? "Location Set ✓" : "Set Current Location"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={submitAttendance}
          disabled={loading || success}
          className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-medium transition disabled:opacity-60"
        >
          {loading
            ? "Submitting..."
            : success
            ? "Redirecting..."
            : "Submit Attendance"}
        </motion.button>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-5 text-center text-sm font-medium ${
                success ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AttendanceForm;