import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";

const AttendanceForm = () => {
  const navigate = useNavigate();
  const { lectureId } = useParams();
  const { user, loading } = useAuth();

  const [student, setStudent] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "student") {
      navigate("/teacher-dashboard", { replace: true });
      return;
    }

    setStudent(user);
  }, [user, loading, navigate]);

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

    setSubmitting(true);
    setMessage("");

    try {
      const res = await api.post("/attendance/mark", {
        lectureId,
        latitude,
        longitude,
        enrollment: student.enrollment
      });

      if (res.status !== 201) {
        setMessage(res.data?.message || "Failed to mark attendance");
      } else {
        setSuccess(true);
        setMessage("Attendance marked successfully");

        setTimeout(() => {
          navigate("/student-dashboard", { replace: true });
        }, 1500);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Server error");
    }

    setSubmitting(false);
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.08)] p-8 w-full max-w-md border border-gray-200 transition-all ${
          success ? "scale-105" : ""
        }`}
      >
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6 tracking-tight">
          Mark Attendance
        </h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 bg-gray-50/80 backdrop-blur rounded-2xl border border-gray-200 p-5"
        >
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Student Name
          </p>
          <p className="font-semibold text-gray-900 mt-1">
            {student.name}
          </p>

          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Enrollment Number
            </p>
            <p className="font-semibold text-gray-900 mt-1">
              {student.enrollment}
            </p>
          </div>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 260 }}
          onClick={handleSetLocation}
          className="w-full mb-4 py-3 rounded-2xl bg-black text-white font-medium transition"
        >
          {latitude ? "Location Set ✓" : "Set Current Location"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 260 }}
          onClick={submitAttendance}
          disabled={submitting || success}
          className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-medium transition disabled:opacity-60"
        >
          {submitting
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