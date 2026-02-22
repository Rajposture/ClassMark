import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import DashboardLayout from "../components/common/DashboardLayout";
import CreateLecture from "../components/teacher/CreateLecture";
import GenerateQR from "../components/teacher/GenerateQR";

const API = import.meta.env.VITE_API_BASE;

const TeacherDashboard = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [lectures, setLectures] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLectures = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        navigate("/login", { replace: true });
        return;
      }

      const token = await getToken();

      const meRes = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const meData = await meRes.json();

      if (!meRes.ok || meData.user.role !== "teacher") {
        navigate("/student", { replace: true });
        return;
      }

      try {
        const res = await fetch(`${API}/api/lectures/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
          setFetchError(data.message || "Failed to load lectures");
          return;
        }

        setLectures(Array.isArray(data.lectures) ? data.lectures : []);
      } catch {
        setFetchError("Server error while fetching lectures");
      } finally {
        setFetching(false);
      }
    };

    loadLectures();
  }, [isLoaded, isSignedIn]);

  const handleLectureCreated = async (lectureData) => {
    const token = await getToken();

    const res = await fetch(`${API}/api/lectures`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(lectureData)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to create lecture");
      return false;
    }

    if (data.lecture) {
      setLectures((prev) => [data.lecture, ...prev]);
    }

    return true;
  };

const handleExcelDownload = async (lectureId, subject) => {
  const token = await getToken();

  const res = await fetch(
    `${API}/api/lectures/${lectureId}/excel`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    alert("Failed to generate Excel");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);


    const safeSubject = (subject || "attendance")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeSubject}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="text-center text-slate-500 mt-24 text-lg">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Manage your lectures and attendance seamlessly
          </p>
        </motion.div>

        {fetchError && (
          <p className="text-red-500 mb-6">{fetchError}</p>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CREATE LECTURE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Lecture
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Schedule a lecture and generate attendance QR
              </p>
            </div>

            <CreateLecture onCreate={handleLectureCreated} />
          </motion.div>

          {/* LECTURE LIST */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              Your Lectures
            </h2>

            {lectures.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                No lectures scheduled yet
              </div>
            ) : (
              <div className="space-y-5">
                {lectures.map((lecture) => (
                  <motion.div
                    key={lecture._id}
                    whileHover={{ scale: 1.01 }}
                    className="flex flex-col sm:flex-col md:flex-row md:items-center md:justify-between gap-6 border rounded-2xl p-5 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {lecture.subject}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {lecture.date} • {lecture.startTime} – {lecture.endTime}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setActiveLecture(lecture)}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition"
                      >
                        Generate QR
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                          handleExcelDownload(
                            lecture._id,
                            lecture.subject
                          )
                        }
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-medium shadow-md transition"
                      >
                        Download Excel
                      </motion.button>

                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* QR MODAL */}
        <AnimatePresence>
          {activeLecture && (
            <GenerateQR
              lecture={activeLecture}
              onClose={() => setActiveLecture(null)}
            />
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;