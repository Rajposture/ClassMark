import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
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
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "student") {
      navigate("/teacher", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStudent(data.user);
        } else {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
        }
      } catch {
        navigate("/login", { replace: true });
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user, loading, navigate]);

  if (loading || fetching || !student) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh] text-slate-500">
          Loading your dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Welcome back, {student.name.split(" ")[0]} 
          </h1>
          <p className="text-slate-500 mt-2">
            Stay consistent. Track your attendance effortlessly.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Profile Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 transition-all"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              👤 Profile
            </h2>

            <div className="space-y-3 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-medium">{student.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Enrollment</span>
                <span className="font-medium">
                  {student.enrollmentNumber || "N/A"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-medium">
                  {student.email || "N/A"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Attendance Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl shadow-2xl p-8 transition-all relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

            <h2 className="text-xl font-semibold mb-4">
              📊 Attendance
            </h2>

            <p className="text-indigo-100 mb-6">
              Track and mark your attendance instantly by scanning QR codes.
            </p>

            <button
              onClick={() => navigate("/scan")}
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow hover:scale-105 active:scale-95 transition-all"
            >
              Scan QR for Attendance
            </button>
          </motion.div>

        </div>

        {/* Motivational Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-400 text-sm">
            Consistency is key. Keep your attendance strong 💪
          </p>
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
