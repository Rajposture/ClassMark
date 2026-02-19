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
  const [fetchError, setFetchError] = useState("");
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  /* ===============================
     LOAD LECTURES
  ============================== */
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "teacher") {
      navigate("/student", { replace: true });
      return;
    }

    const loadLectures = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${API_BASE}/api/lectures/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setFetchError(data.message || "Failed to load lectures");
          return;
        }

        // ✅ Backend returns array directly
        setLectures(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Lecture fetch error:", err);
        setFetchError("Server error while fetching lectures");
      } finally {
        setFetching(false);
      }
    };

    loadLectures();
  }, [user, loading, navigate]);

  /* ===============================
     CREATE LECTURE
  ============================== */
  const handleLectureCreated = async (lectureData) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/lectures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lectureData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create lecture");
        return false;
      }

      // ✅ Backend returns { lecture }
      if (data.lecture) {
        setLectures((prev) => [data.lecture, ...prev]);
      }

      return true;
    } catch (err) {
      console.log(err);
      alert("Server error while creating lecture");
      return false;
    }
  };

  /* ===============================
     EXCEL DOWNLOAD
  ============================== */
  const handleExcelDownload = async (lectureId, subject) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/lectures/${lectureId}/excel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    } catch {
      alert("Server error while downloading Excel");
    }
  };

  /* ===============================
     LOADING STATE
  ============================== */
  if (loading || fetching) {
    return (
      <DashboardLayout>
        <div className="text-center text-slate-500 mt-20">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  /* ===============================
     UI
  ============================== */
return (
  <DashboardLayout>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
          Teacher Dashboard
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Manage your lectures and attendance seamlessly
        </p>
      </div>

      {fetchError && (
        <p className="text-red-500 mb-6">{fetchError}</p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

        {/* Create Lecture Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-md p-6 sm:p-8 transition hover:shadow-xl">
          <CreateLecture onCreate={handleLectureCreated} />
        </div>

        {/* Lectures Section */}
        <div className="xl:col-span-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-md p-6 sm:p-8 transition hover:shadow-xl">

          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Your Lectures
          </h2>

          {lectures.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400">
              No lectures scheduled yet
            </div>
          ) : (
            <div className="space-y-5">
              {lectures.map((lecture) => (
                <div
                  key={lecture._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border border-gray-200 rounded-2xl p-5 bg-gray-50 hover:bg-gray-100 transition duration-200"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {lecture.subject}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {lecture.date} • {lecture.startTime} – {lecture.endTime}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                    {/* Generate QR */}
                    <button
                      onClick={() => setActiveLecture(lecture)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black text-white font-medium hover:bg-gray-900 active:scale-95 transition"
                    >
                      Generate QR
                    </button>

                    {/* Excel */}
                    <button
                      onClick={() =>
                        handleExcelDownload(
                          lecture._id,
                          lecture.subject
                        )
                      }
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-200 text-gray-900 font-medium hover:bg-gray-300 active:scale-95 transition"
                    >
                      Download Excel
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
