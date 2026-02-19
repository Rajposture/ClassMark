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

  /* WAIT for auth to finish */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

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
        setMessage("Attendance submitted successfully 🎉");
        setTimeout(() => {
          navigate("/student");
        }, 1500);
      }

    } catch {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Mark Attendance
        </h2>

        <p className="mb-4 text-sm text-slate-600">
          Name: {user.name}
        </p>

        <button
          onClick={handleSetLocation}
          className="w-full mb-4 py-3 bg-slate-800 text-white rounded-lg"
        >
          Set Current Location
        </button>

        <button
          onClick={submitAttendance}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg"
        >
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AttendanceForm;
