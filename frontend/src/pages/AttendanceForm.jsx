import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";

const AttendanceForm = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

useEffect(() => {
  if (!authLoading && !user) {
    navigate("/login", {
      state: { from: `/attendance/${lectureId}` }
    });
  }
}, [authLoading, user, navigate, lectureId]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null;

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

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          lectureId,
          latitude,
          longitude
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
      } else {
        setSuccess(true);
        setMessage("Attendance marked successfully 🎉");

        setTimeout(() => {
          navigate("/student");
        }, 1800);
      }

    } catch {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200 transition-all duration-300 ${
          success ? "scale-105" : ""
        }`}
      >

        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
          Mark Attendance
        </h2>

        {/* Student Info Card */}
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Student Name</p>
          <p className="font-semibold text-gray-800">
            {user.name}
          </p>

          <div className="mt-3">
            <p className="text-sm text-gray-500">Enrollment Number</p>
            <p className="font-semibold text-gray-800">
              {user.enrollmentNumber}
            </p>
          </div>
        </div>

        {/* Location Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSetLocation}
          className="w-full mb-4 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition"
        >
          {latitude ? "Location Set ✓" : "Set Current Location"}
        </motion.button>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={submitAttendance}
          disabled={loading || success}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading
            ? "Submitting..."
            : success
            ? "Redirecting..."
            : "Submit Attendance"}
        </motion.button>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
