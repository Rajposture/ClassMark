import { useEffect, useState, useContext } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config/api";
import { AuthContext } from "../context/AuthContext";

const StudentDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "student") {
      navigate("/teacher");
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,   // ✅ FIXED
          },
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStudent(data.user);   // ✅ FIXED (you were setting wrong object)
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.log("Dashboard error:", err);
        navigate("/login");
      } finally {
        setFetching(false);  // ✅ IMPORTANT
      }
    };

    fetchProfile();
  }, [user, loading, navigate]);

  if (loading || fetching) {
    return (
      <DashboardLayout>
        <div className="text-center text-slate-500 mt-20">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800">
          Student Dashboard
        </h1>
        <p className="text-slate-500">
          View your profile and attendance
        </p>

        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Profile
          </h2>

          <div className="space-y-2 text-slate-700">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {student.name}
            </p>
            <p>
              <span className="font-medium">Enrollment:</span>{" "}
              {student.enrollmentNumber || "N/A"}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {student.email}
            </p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Attendance
          </h2>

          <p className="text-slate-400">
            Attendance graph will appear here
          </p>

          <button
            onClick={() => navigate("/scan")}
            className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Scan QR for Attendance
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
