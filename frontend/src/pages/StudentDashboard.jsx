import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import DashboardLayout from "../components/common/DashboardLayout";

const API = import.meta.env.VITE_API_BASE;

const StudentDashboard = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth(); // ✅ THIS IS IMPORTANT
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const token = await getToken(); // ✅ CORRECT WAY

        const res = await fetch(`${API}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (res.ok && data.success) {
          if (data.user.role !== "student") {
            navigate("/teacher", { replace: true });
            return;
          }

          setStudent(data.user);
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        navigate("/login", { replace: true });
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [isLoaded, isSignedIn, getToken, navigate]);

  if (fetching || !student) {
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

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Welcome back, {student.name?.split(" ")[0]}
          </h1>
          <p className="text-slate-500 mt-2">
            Stay consistent. Track your attendance effortlessly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8"
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

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl shadow-2xl p-8 relative overflow-hidden"
          >
            <h2 className="text-xl font-semibold mb-4">
              📊 Attendance
            </h2>

            <p className="text-indigo-100 mb-6">
              Track and mark your attendance instantly by scanning QR codes.
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/scan")}
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow"
            >
              Scan QR for Attendance
            </motion.button>
          </motion.div>

        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
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