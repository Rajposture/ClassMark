import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
      navigate(`/login?redirect=/attendance/${lectureId}`, { replace: true });
    }
  }, [authLoading, user, navigate, lectureId]);

  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMessage("");
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

    if (!user) {
      setMessage("Please login again");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          lectureId,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to mark attendance");
      } else {
        setSuccess(true);
        setMessage("Attendance submitted successfully 🎉");

        setTimeout(() => {
          navigate("/student", { replace: true });
        }, 1500);
      }
    } catch {
      setMessage("Server error");
    }

    setLoading(false);
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div
        className={`bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transition-all duration-500 ${
          success ? "scale-105" : ""
        }`}
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Lecture Attendance
        </h2>

        <div className="mb-6 bg-slate-50 p-4 rounded-lg text-sm">
          <p>
            <strong>Name:</strong> {user?.name}
          </p>
          <p>
            <strong>Enrollment No:</strong> {user?.enrollmentNumber}
          </p>
        </div>

        <button
          onClick={handleSetLocation}
          className="w-full mb-4 py-3 bg-slate-700 text-white rounded-lg"
        >
          Set Current Location
        </button>

        <button
          onClick={submitAttendance}
          disabled={loading || success}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading
            ? "Submitting..."
            : success
            ? "Redirecting..."
            : "Submit Attendance"}
        </button>

        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              success ? "text-green-600 animate-pulse" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AttendanceForm;
