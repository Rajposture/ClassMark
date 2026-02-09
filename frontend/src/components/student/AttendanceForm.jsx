import { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";

const AttendanceForm = () => {
  const { lectureId } = useParams();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submitAttendance = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          lectureId,
          token: localStorage.getItem("qr_token")
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
      } else {
        setMessage("Attendance submitted successfully");
      }

    } catch {
      setMessage("Error submitting attendance");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Confirm Attendance
        </h2>

        <div className="space-y-4 mb-6">

          <div>
            <label className="text-sm text-slate-500">Name</label>
            <input
              type="text"
              value={user?.name || ""}
              disabled
              className="w-full mt-1 px-4 py-3 rounded-lg border bg-slate-100 text-slate-700"
            />
          </div>

          <div>
            <label className="text-sm text-slate-500">Enrollment Number</label>
            <input
              type="text"
              value={user?.enrollmentNumber || ""}
              disabled
              className="w-full mt-1 px-4 py-3 rounded-lg border bg-slate-100 text-slate-700"
            />
          </div>

        </div>

        <button
          onClick={submitAttendance}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-slate-600">
            {message}
          </p>
        )}

      </div>
    </div>
  );
};

export default AttendanceForm;
