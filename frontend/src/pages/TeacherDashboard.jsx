import { useState, useEffect, useContext } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import CreateLecture from "../components/teacher/CreateLecture";
import GenerateQR from "../components/teacher/GenerateQR";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../config/api";

const TeacherDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [lectures, setLectures] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "teacher") {
      navigate("/login");
      return;
    }

    fetch(`${API_BASE}/api/lectures/mine`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setLectures(data || []))
      .catch(() => setLectures([]));
  }, [user, loading, navigate]);

  const handleLectureCreated = async (lectureData) => {
    const res = await fetch(`${API_BASE}/api/lectures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(lectureData),
    });

    if (!res.ok) return;

    const lecture = await res.json();
    setLectures((prev) => [lecture, ...prev]);
  };

  const handleExcelDownload = async (lectureId) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/lectures/${lectureId}/excel`,
        { credentials: "include" }
      );

      if (!res.ok) return;

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
          Teacher Dashboard
        </h1>
        <p className="text-slate-500 mt-2 mb-8 sm:mb-10">
          Manage your lectures and attendance
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <CreateLecture onCreate={handleLectureCreated} />
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-6">
              Today’s Lectures
            </h2>

            {lectures.length === 0 ? (
              <div className="h-40 sm:h-56 flex items-center justify-center text-slate-400 text-base sm:text-lg text-center">
                No lectures scheduled yet
              </div>
            ) : (
              <div className="space-y-5 sm:space-y-6">
                {lectures.map((lecture) => (
                  <div
                    key={lecture._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border rounded-xl p-4 sm:p-6 hover:shadow-md transition"
                  >
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-slate-800">
                        {lecture.subject}
                      </h3>
                      <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base">
                        {lecture.date} • {lecture.startTime} – {lecture.endTime}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                      <button
                        onClick={() => setActiveLecture(lecture)}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm sm:text-base"
                      >
                        Generate QR
                      </button>

                      <button
                        onClick={() =>
                          handleExcelDownload(lecture._id)
                        }
                        className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition text-sm sm:text-base"
                      >
                        Generate Excel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {activeLecture && (
          <GenerateQR
            lecture={activeLecture}
            onClose={() => setActiveLecture(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
